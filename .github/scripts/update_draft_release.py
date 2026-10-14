#!/usr/bin/env python3
"""
Tự động tính toán phiên bản tiếp theo và tạo/cập nhật bản Draft Release cho hệ sinh thái Nexus,
liệt kê toàn bộ commits và PRs kể từ tag phát hành chính thức gần nhất.
"""

import json
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parent.parent.parent


def run(cmd: list[str]) -> str:
    res = subprocess.run(cmd, capture_output=True, text=True, cwd=ROOT_DIR)
    if res.returncode != 0:
        print(f"Command failed: {' '.join(cmd)}\nStderr: {res.stderr}")
        raise subprocess.CalledProcessError(res.returncode, cmd, res.stdout, res.stderr)
    return res.stdout.strip()


def sync_ecosystem_version(version: str, tag: str) -> bool:
    """Đồng bộ version vào apps.json, package.json và tauri.conf.json nếu chưa khớp."""
    apps_json_path = ROOT_DIR / "apps.json"
    if not apps_json_path.exists():
        return False

    with open(apps_json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    if data.get("version") == version:
        return False

    data["version"] = version
    data["nexus"]["version"] = version
    data["nexus"]["downloadUrl"] = (
        f"https://github.com/thanhba0505/nexus/releases/download/{tag}/Nexus_{version}_aarch64.dmg"
    )

    for app in data.get("apps", []):
        app["version"] = version
        dmg_name = "GitHub_Report" if app["id"] == "github-report" else app["name"]
        app["downloadUrl"] = (
            f"https://github.com/thanhba0505/nexus/releases/download/{tag}/{dmg_name}_{version}_aarch64.dmg"
        )

    with open(apps_json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
        f.write("\n")

    for app_dir in ["nexus", "slackbot", "github-report"]:
        pkg_file = ROOT_DIR / "apps" / app_dir / "package.json"
        if pkg_file.exists():
            with open(pkg_file, "r", encoding="utf-8") as f:
                pkg = json.load(f)
            pkg["version"] = version
            with open(pkg_file, "w", encoding="utf-8") as f:
                json.dump(pkg, f, indent=2)
                f.write("\n")

        tauri_file = ROOT_DIR / "apps" / app_dir / "src-tauri" / "tauri.conf.json"
        if tauri_file.exists():
            with open(tauri_file, "r", encoding="utf-8") as f:
                tconf = json.load(f)
            tconf["version"] = version
            with open(tauri_file, "w", encoding="utf-8") as f:
                json.dump(tconf, f, indent=2)
                f.write("\n")

    return True


def main() -> None:
    # 1. Lấy tag release gần nhất
    try:
        run(["git", "fetch", "--tags", "--force"])
        latest_tag = run(["git", "describe", "--tags", "--abbrev=0"])
    except Exception:
        latest_tag = "v0.1.0"

    if not latest_tag:
        latest_tag = "v0.1.0"

    print(f"📌 Latest published tag: {latest_tag}")

    # 2. Lấy toàn bộ commits kể từ tag gần nhất (loại bỏ merge commits)
    commits_raw = run([
        "git",
        "log",
        f"{latest_tag}..HEAD",
        "--no-merges",
        "--pretty=format:%h|%an|%s",
    ])

    if not commits_raw.strip():
        print("ℹ️ Không có commit mới kể từ tag gần nhất.")
        return

    all_commits = [
        line.split("|", 2) for line in commits_raw.splitlines() if line.strip()
    ]

    # Lọc bỏ các commit tự động bump từ bot để giữ changelog sạch đẹp
    commits = [c for c in all_commits if "[skip ci]" not in c[2]]

    if not commits:
        print("ℹ️ Không có commit tính năng/sửa lỗi mới.")
        return

    # 3. Tính toán phiên bản tiếp theo theo SemVer
    m = re.match(r"^v?(\d+)\.(\d+)\.(\d+)", latest_tag)
    if m:
        major, minor, patch = map(int, m.groups())
    else:
        major, minor, patch = (0, 1, 0)

    has_major = any("BREAKING" in c[2] or "feat!:" in c[2] for c in commits)
    has_minor = any(
        re.match(r"^[a-z0-9]+\s+feat(\([^)]+\))?:", c[2], re.IGNORECASE)
        or c[2].lower().startswith("feat")
        for c in commits
    )

    if has_major:
        next_version = f"{major + 1}.0.0"
    elif has_minor:
        next_version = f"{major}.{minor + 1}.0"
    else:
        next_version = f"{major}.{minor}.{patch + 1}"

    next_tag = f"v{next_version}"
    print(f"🎯 Target version: {next_tag}")

    # Đồng bộ version vào các file cấu hình
    changed = sync_ecosystem_version(next_version, next_tag)
    if changed and os.environ.get("GITHUB_ACTIONS") == "true":
        print("📝 Đang commit phiên bản đồng bộ vào main...")
        run(["git", "config", "user.name", "github-actions[bot]"])
        run([
            "git",
            "config",
            "user.email",
            "github-actions[bot]@users.noreply.github.com",
        ])
        run([
            "git",
            "add",
            "apps.json",
            "apps/*/package.json",
            "apps/*/src-tauri/tauri.conf.json",
        ])
        run([
            "git",
            "commit",
            "-m",
            f"chore(release): bump unified ecosystem to {next_tag} [skip ci]",
        ])
        run(["git", "push", "origin", "main"])

    # 4. Phân nhóm thay đổi
    features = []
    fixes = []
    maintenance = []

    for h, author, msg in commits:
        line = f"* {msg} by @{author} in {h}"
        msg_lower = msg.lower()
        if msg_lower.startswith("feat"):
            features.append(line)
        elif msg_lower.startswith("fix"):
            fixes.append(line)
        else:
            maintenance.append(line)

    body_parts = ["## What's Changed"]
    if features:
        body_parts.append("\n### 🚀 Features")
        body_parts.extend(features)
    if fixes:
        body_parts.append("\n### 🐛 Bug Fixes")
        body_parts.extend(fixes)
    if maintenance:
        body_parts.append("\n### 🧰 Maintenance & Updates")
        body_parts.extend(maintenance)

    repo = os.environ.get("GITHUB_REPOSITORY", "thanhba0505/nexus")
    body_parts.append(
        f"\n\n**Full Changelog**: https://github.com/{repo}/compare/{latest_tag}...{next_tag}"
    )
    body = "\n".join(body_parts)

    title = f"{next_tag} Nexus Ecosystem"

    # 5. Kiểm tra và cập nhật bản nháp (Draft Release)
    releases_json = run(
        ["gh", "release", "list", "--json", "isDraft,tagName,name"]
    )
    try:
        releases = json.loads(releases_json)
    except Exception:
        releases = []

    existing_draft = next((r for r in releases if r.get("isDraft")), None)

    with tempfile.NamedTemporaryFile(
        "w", encoding="utf-8", delete=False, suffix=".md"
    ) as tmp:
        tmp.write(body)
        tmp_path = tmp.name

    try:
        if existing_draft:
            draft_tag = existing_draft["tagName"]
            print(
                f"🔄 Đang cập nhật bản nháp có sẵn ({draft_tag}) ->"
                f" {next_tag}..."
            )
            run([
                "gh",
                "release",
                "edit",
                draft_tag,
                "--draft",
                "--tag",
                next_tag,
                "--title",
                title,
                "--notes-file",
                tmp_path,
            ])
        else:
            print(f"✨ Đang tạo bản nháp mới ({next_tag})...")
            run([
                "gh",
                "release",
                "create",
                next_tag,
                "--draft",
                "--title",
                title,
                "--notes-file",
                tmp_path,
            ])
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)

    print(
        f"✅ Cập nhật Draft Release {next_tag} thành công với đầy đủ danh sách"
        " commit!"
    )


if __name__ == "__main__":
    main()
