# Nexus — macOS Mini App Ecosystem

> **Nexus**: Nền tảng quản lý hệ sinh thái mini app độc lập trên macOS.  
> Được xây dựng theo mô hình **Monorepo** với **Tauri v2 + React 19 + TypeScript + Vite + Turborepo + pnpm Workspaces**.

---

## 1. Tổng Quan Kiến Trúc

- **Monorepo duy nhất**: Quản lý toàn bộ source code của các ứng dụng độc lập và thư viện dùng chung.
- **Tính độc lập vòng đời (Independent Lifecycle)**: Mỗi mini app là một macOS Application Bundle (`.app`) riêng biệt, có Process ID, icon, bundle identifier và entry point riêng. Người dùng có thể khởi chạy bất kỳ app nào trực tiếp từ Dock, Spotlight hoặc Raycast mà không cần Nexus phải chạy trước.
- **Tiết kiệm tài nguyên (Tauri 2 vs Electron)**: Tận dụng trực tiếp **WKWebView** native của macOS và backend **Rust**, tiêu thụ chỉ từ **30MB - 50MB RAM** mỗi app (so với >250MB của Electron).
- **Cargo Workspace Root**: Chia sẻ chung một thư mục cache `/target/` tại root repo, tiết kiệm 70% dung lượng đĩa (chống phình 15GB).
- **Local-First & Bảo Mật Token**: Cài đặt thông thường lưu qua `tauri-plugin-store` tại `~/Library/Application Support/`, Token/Secrets nhạy cảm lưu trực tiếp vào **macOS Keychain** qua crate `keyring`.

---

## 2. Danh Sách Ứng Dụng Trong Hệ Sinh Thái

| Ứng Dụng          | Thư Mục              | Bundle Identifier                | Port Dev | Giao Diện Hiển Thị                                                  |
| :---------------- | :------------------- | :------------------------------- | :------: | :------------------------------------------------------------------ |
| **Nexus**         | `apps/nexus`         | `com.thanhba.nexus`              |  `1420`  | Launchpad macOS kính mờ trong suốt, App Grid, Header & Footer icons |
| **SlackBot**      | `apps/slackbot`      | `com.thanhba.nexus.slackbot`     |  `1421`  | Placeholder `SlackBot` — `Coming soon`                              |
| **GitHub Report** | `apps/github-report` | `com.thanhba.nexus.githubreport` |  `1422`  | Placeholder `GitHub Report` — `Coming soon`                         |

---

## 3. Cấu Trúc Repository

```text
nexus/
├── apps/
│   ├── nexus/               # App chính: Nexus Launchpad Hub (Port 1420)
│   ├── slackbot/            # Mini App: Slack Assistant (Port 1421)
│   └── github-report/       # Mini App: GitHub PR Monitor (Port 1422)
├── packages/
│   ├── config/              # @nexus/config: Shared ESLint, TS, Tailwind presets
│   ├── shared/              # @nexus/shared: Types, app registry, constants
│   └── ui/                  # @nexus/ui: Shared Launchpad components, buttons, badges
├── tooling/
│   ├── assets/              # SVG source icons (nexus, slackbot, github-report)
│   └── scripts/             # Scripts tiện ích: check-env.sh, generate-icons.sh
├── docs/                    # Tài liệu kỹ thuật chi tiết
│   ├── architecture.md      # Đặc tả kiến trúc tổng thể & so sánh Tauri vs Electron
│   ├── coding-standards.md  # Quy chuẩn lập trình, naming, string unions, Keychain
│   ├── implementation-plan.md # Kế hoạch triển khai 6 Phase & 12 tiêu chí DoD
│   └── prerequisites.md     # Hướng dẫn thiết lập môi trường macOS
├── Cargo.toml               # Cargo Workspace root chia sẻ build cache
├── pnpm-workspace.yaml      # Khai báo pnpm workspaces
├── turbo.json               # Cấu hình Turborepo task pipeline
├── package.json             # Root scripts & dependencies
└── README.md
```

---

## 4. Hướng Dẫn Cài Đặt & Phát Triển

### 4.1. Môi Trường Tiên Quyết (Prerequisites)

1. **macOS**: Ventura 13.0 trở lên (Apple Silicon M1/M2/M3/M4 hoặc Intel x86_64).
2. **Node.js**: v20+ hoặc v24+ (kèm `pnpm@12` qua Corepack: `corepack enable pnpm`).
3. **Rust & Cargo**: Cài đặt qua rustup:
   ```bash
   curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
   source "$HOME/.cargo/env"
   ```
4. Kiểm tra sức khỏe môi trường bằng script tự động:
   ```bash
   ./tooling/scripts/check-env.sh
   ```

### 4.2. Cài Đặt Dependencies

```bash
pnpm install
```

### 4.3. Chạy Chế Độ Phát Triển (Development)

Hệ sinh thái Nexus hỗ trợ 2 nhóm lệnh chính:

#### A. Nhóm DEV (Chạy Cửa Sổ Ứng Dụng macOS)

```bash
# Khởi động đồng thời cả 3 apps và TỰ ĐỘNG MỞ CỬA SỔ DESKTOP NEXUS
pnpm dev

# Chạy cả 3 app ở chế độ Web thuần (không mở cửa sổ desktop)
pnpm dev:web

# Mở riêng từng cửa sổ Desktop:
pnpm dev:nexus          # Cửa sổ Nexus Launchpad Hub (Cổng 1420 + Kính mờ)
pnpm dev:slackbot       # Cửa sổ SlackBot (Cổng 1421)
pnpm dev:github-report  # Cửa sổ GitHub Report (Cổng 1422)
```

---

### 4.4. Nhóm BUILD (Đóng Gói Ứng Dụng Desktop Native .dmg)

Để biên dịch và đóng gói thành các file bundle macOS `.dmg` / `.app` độc lập trong thư mục `target/release/bundle/`:

```bash
# Build toàn bộ monorepo
pnpm build

# Đóng gói bộ cài Nexus (.dmg)
pnpm build:nexus

# Đóng gói bộ cài SlackBot (.dmg)
pnpm build:slackbot

# Đóng gói bộ cài GitHub Report (.dmg)
pnpm build:github-report
```

---

### 4.5. Kiểm Tra Typecheck, Linter & Format

```bash
# Kiểm tra TypeScript toàn bộ monorepo (Strict Mode)
pnpm typecheck

# Kiểm tra ESLint
pnpm lint

# Format mã nguồn bằng Prettier
pnpm format
```

---

### 4.6. Build Mã Nguồn Frontend & Quản Lý Assets

```bash
# Build frontend webview của toàn bộ monorepo qua Turborepo
pnpm build

# Build riêng từng frontend app
pnpm build:nexus
pnpm build:slackbot
pnpm build:github-report

# Sinh lại toàn bộ app icon (.icns, .ico, .png) từ file SVG gốc
./tooling/scripts/generate-icons.sh
```

---

## 5. Tài Liệu Kỹ Thuật Chi Tiết Trong `docs/`

- [`docs/architecture.md`](docs/architecture.md): Phân tích chuyên sâu kiến trúc hệ thống, so sánh Tauri v2 vs Electron, thiết kế cửa sổ trong suốt và macOS Vibrancy.
- [`docs/coding-standards.md`](docs/coding-standards.md): Quy chuẩn lập trình, TypeScript String Literal Unions thay cho Enum, lưu trữ Keychain và `tauri-plugin-store`.
- [`docs/implementation-plan.md`](docs/implementation-plan.md): Lộ trình 6 Phase triển khai và 12 tiêu chí nghiệm thu hoàn thành.
- [`docs/prerequisites.md`](docs/prerequisites.md): Hướng dẫn chi tiết từng bước cài đặt môi trường trên macOS.
- [`docs/github-report.md`](docs/github-report.md): Đặc tả kiến trúc, Unified Titlebar Header, luồng xử lý Local AI và lưu trữ cấu hình của ứng dụng GitHub Report.
