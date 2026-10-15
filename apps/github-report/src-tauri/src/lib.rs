use tauri::Manager;

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PrereqStatus {
    pub gh_installed: bool,
    pub gh_logged_in: bool,
    pub gh_account: Option<String>,
    pub claude_cli_installed: bool,
    pub antigravity_cli_installed: bool,
    pub has_github_token: bool,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct CommitItem {
    pub headline: String,
    pub committed_date: String,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct PRReportItem {
    pub number: u64,
    pub repository: String,
    pub title: String,
    pub url: String,
    pub state: String,
    pub commits: Vec<CommitItem>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct AISummaryResult {
    pub bullets: Vec<String>,
    pub raw_summary: String,
    pub provider: String,
}

fn get_enhanced_path() -> String {
    let current_path = std::env::var("PATH").unwrap_or_default();
    let home = std::env::var("HOME").unwrap_or_default();
    format!(
        "/opt/homebrew/bin:/usr/local/bin:{}/.local/bin:{}",
        home, current_path
    )
}

fn find_executable(name: &str) -> Option<std::path::PathBuf> {
    let home = std::env::var("HOME").unwrap_or_default();
    let candidates = [
        format!("/opt/homebrew/bin/{}", name),
        format!("/usr/local/bin/{}", name),
        format!("{}/.local/bin/{}", home, name),
    ];
    for p in &candidates {
        let path = std::path::Path::new(p);
        if path.exists() && path.is_file() {
            return Some(path.to_path_buf());
        }
    }

    if let Ok(output) = std::process::Command::new("which")
        .arg(name)
        .env("PATH", get_enhanced_path())
        .output()
    {
        if output.status.success() {
            let p = String::from_utf8_lossy(&output.stdout).trim().to_string();
            if !p.is_empty() {
                let pb = std::path::PathBuf::from(p);
                if pb.exists() {
                    return Some(pb);
                }
            }
        }
    }
    None
}

#[tauri::command]
fn check_prerequisites() -> Result<PrereqStatus, String> {
    let gh_path = find_executable("gh");
    let gh_installed = gh_path.is_some();
    let mut gh_logged_in = false;
    let mut gh_account = None;

    if let Some(ref path) = gh_path {
        if let Ok(out) = std::process::Command::new(path)
            .args(["auth", "status"])
            .env("PATH", get_enhanced_path())
            .output()
        {
            let text = format!(
                "{}\n{}",
                String::from_utf8_lossy(&out.stdout),
                String::from_utf8_lossy(&out.stderr)
            );
            if out.status.success() || text.contains("Logged in to") {
                gh_logged_in = true;
                if let Some(pos) = text.find("account ") {
                    let sub = &text[pos + 8..];
                    if let Some(end) = sub.find(|c: char| c.is_whitespace() || c == '(') {
                        gh_account = Some(sub[..end].trim().to_string());
                    }
                }
            }
        }
    }

    let claude_cli_installed = find_executable("claude").is_some();
    let antigravity_cli_installed = find_executable("agy").is_some();

    let has_github_token = keyring::Entry::new("github_report_token", "nexus_user")
        .map(|e| e.get_password().is_ok())
        .unwrap_or(false);

    Ok(PrereqStatus {
        gh_installed,
        gh_logged_in,
        gh_account,
        claude_cli_installed,
        antigravity_cli_installed,
        has_github_token,
    })
}

#[tauri::command]
fn fetch_github_prs(since_iso: Option<String>) -> Result<Vec<PRReportItem>, String> {
    let gh_path = find_executable("gh").ok_or_else(|| {
        "GitHub CLI (`gh`) không được tìm thấy. Hãy cài đặt `gh` qua Homebrew hoặc cung cấp GitHub Token.".to_string()
    })?;

    let since_arg = since_iso.unwrap_or_else(|| {
        "2000-01-01T00:00:00Z".to_string()
    });

    let search_query = format!("--updated=>{}", since_arg);

    let output = std::process::Command::new(&gh_path)
        .args([
            "search",
            "prs",
            "--author=@me",
            &search_query,
            "--json",
            "number,repository,title,url,state",
            "--limit",
            "50",
        ])
        .env("PATH", get_enhanced_path())
        .output()
        .map_err(|e| format!("Lỗi khi chạy `gh search prs`: {}", e))?;

    if !output.status.success() {
        return Err(format!(
            "Lỗi `gh search prs`: {}",
            String::from_utf8_lossy(&output.stderr)
        ));
    }

    let prs_raw: serde_json::Value = serde_json::from_slice(&output.stdout)
        .map_err(|e| format!("Lỗi đọc kết quả JSON từ gh: {}", e))?;

    let prs_arr = prs_raw.as_array().ok_or("Dữ liệu PRs không hợp lệ")?;
    let mut result = Vec::new();

    for pr in prs_arr {
        let number = pr["number"].as_u64().unwrap_or(0);
        let title = pr["title"].as_str().unwrap_or("").to_string();
        let url = pr["url"].as_str().unwrap_or("").to_string();
        let state = pr["state"].as_str().unwrap_or("OPEN").to_uppercase();
        let repo = pr["repository"]["nameWithOwner"].as_str().unwrap_or("").to_string();

        if repo.is_empty() || number == 0 {
            continue;
        }

        let view_output = std::process::Command::new(&gh_path)
            .args([
                "pr",
                "view",
                &number.to_string(),
                "--repo",
                &repo,
                "--json",
                "commits",
            ])
            .env("PATH", get_enhanced_path())
            .output();

        let mut commits = Vec::new();
        if let Ok(view_res) = view_output {
            if view_res.status.success() {
                if let Ok(view_json) = serde_json::from_slice::<serde_json::Value>(&view_res.stdout) {
                    if let Some(c_arr) = view_json["commits"].as_array() {
                        for c in c_arr {
                            let headline = c["messageHeadline"].as_str().unwrap_or("").to_string();
                            let date_str = c["committedDate"].as_str().unwrap_or("").to_string();

                            if date_str >= since_arg {
                                commits.push(CommitItem {
                                    headline,
                                    committed_date: date_str,
                                });
                            }
                        }
                    }
                }
            }
        }

        if !commits.is_empty() {
            result.push(PRReportItem {
                number,
                repository: repo,
                title,
                url,
                state,
                commits,
            });
        }
    }

    Ok(result)
}

fn parse_bullets(text: &str) -> Vec<String> {
    text.lines()
        .map(|line| line.trim())
        .filter(|line| !line.is_empty())
        .map(|line| {
            line.trim_start_matches(|c: char| {
                c == '-' || c == '•' || c == '*' || c == ' ' || c.is_ascii_digit() || c == '.'
            })
            .trim()
            .to_string()
        })
        .filter(|s| !s.is_empty() && !s.starts_with('#'))
        .take(6)
        .collect()
}

#[tauri::command]
fn generate_ai_summary(
    prs: Vec<PRReportItem>,
    prompt_template: Option<String>,
    provider_preference: Option<String>,
) -> Result<AISummaryResult, String> {
    if prs.is_empty() {
        return Err("Không có Pull Request hoặc commit nào để tóm tắt".to_string());
    }

    let mut body = String::new();
    for pr in &prs {
        body.push_str(&format!("PR: {} ({})\n", pr.title, pr.repository));
        for c in &pr.commits {
            body.push_str(&format!("  - {}\n", c.headline));
        }
        body.push('\n');
    }

    let default_prompt = "Below are the pull requests I worked on today, each with today's commit titles. Write a summary for my daily standup in 3 to 4 lines total, covering all PRs together: group related work, describe outcomes in plain English, skip merges and trivial comment/doc tweaks. Each line is one short sentence, starting with '- ', no heading or preamble.";
    let prompt = prompt_template.unwrap_or_else(|| default_prompt.to_string());

    let pref = provider_preference.unwrap_or_else(|| "auto".to_string());
    let claude_bin = find_executable("claude");
    let agy_bin = find_executable("agy");

    let mut errors = Vec::new();

    // 1. Thử Claude Code CLI
    if (pref == "claude" || pref == "auto") && claude_bin.is_some() {
        let exe = claude_bin.unwrap();
        use std::io::Write;
        let child = std::process::Command::new(&exe)
            .args(["-p", &prompt])
            .stdin(std::process::Stdio::piped())
            .stdout(std::process::Stdio::piped())
            .stderr(std::process::Stdio::piped())
            .current_dir(std::env::temp_dir())
            .env("PATH", get_enhanced_path())
            .spawn();

        if let Ok(mut c) = child {
            if let Some(mut stdin) = c.stdin.take() {
                let _ = stdin.write_all(body.as_bytes());
            }
            if let Ok(out) = c.wait_with_output() {
                if out.status.success() {
                    let text = String::from_utf8_lossy(&out.stdout).to_string();
                    let bullets = parse_bullets(&text);
                    if !bullets.is_empty() {
                        return Ok(AISummaryResult {
                            bullets,
                            raw_summary: text,
                            provider: "Claude Code CLI".to_string(),
                        });
                    }
                } else {
                    errors.push(format!("Claude CLI: {}", String::from_utf8_lossy(&out.stderr).trim()));
                }
            }
        }
    }

    // 2. Thử Antigravity CLI
    if (pref == "agy" || pref == "auto" || pref == "claude") && agy_bin.is_some() {
        let exe = agy_bin.unwrap();
        let full_prompt = format!("{}\n\n{}", prompt, body);
        let out = std::process::Command::new(&exe)
            .args(["-p", &full_prompt])
            .current_dir(std::env::temp_dir())
            .env("PATH", get_enhanced_path())
            .output();

        if let Ok(res) = out {
            if res.status.success() {
                let text = String::from_utf8_lossy(&res.stdout).to_string();
                let bullets = parse_bullets(&text);
                if !bullets.is_empty() {
                    return Ok(AISummaryResult {
                        bullets,
                        raw_summary: text,
                        provider: "Antigravity CLI".to_string(),
                    });
                }
            } else {
                errors.push(format!("Antigravity CLI: {}", String::from_utf8_lossy(&res.stderr).trim()));
            }
        }
    }

    if errors.is_empty() {
        Err("Không tìm thấy Local AI CLI (`claude` hoặc `agy`). Hãy cài đặt Claude Code CLI (`npm i -g @anthropic-ai/claude-code`) hoặc Antigravity CLI.".to_string())
    } else {
        Err(format!("Lỗi khi tóm tắt AI:\n{}", errors.join("\n")))
    }
}

#[tauri::command]
fn reveal_browser_tab(url: String, browser_name: Option<String>) -> Result<(), String> {
    let browser = browser_name.unwrap_or_else(|| "Brave Browser".to_string());
    let domain = if url.contains("parabol.co") {
        "parabol.co"
    } else if url.contains("slack.com") {
        "slack.com"
    } else {
        ""
    };

    let script = format!(
        r#"
tell application "{}"
    activate
    set found to false
    repeat with w in windows
        set i to 0
        repeat with t in tabs of w
            set i to i + 1
            if "{}" is not "" and URL of t contains "{}" then
                set active tab index of w to i
                set index of w to 1
                set found to true
                exit repeat
            end if
        end repeat
        if found then exit repeat
    end repeat
    if not found then
        if (count of windows) = 0 then make new window
        tell window 1 to make new tab with properties {{URL:"{}"}}
    end if
end tell
"#,
        browser, domain, domain, url
    );

    let output = std::process::Command::new("osascript")
        .arg("-e")
        .arg(&script)
        .output();

    match output {
        Ok(res) if res.status.success() => Ok(()),
        _ => {
            let _ = std::process::Command::new("open").arg(&url).output();
            Ok(())
        }
    }
}

#[tauri::command]
fn save_github_token(token: String) -> Result<(), String> {
    let entry = keyring::Entry::new("github_report_token", "nexus_user").map_err(|e| e.to_string())?;
    entry.set_password(&token).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_github_token() -> Result<String, String> {
    let entry = keyring::Entry::new("github_report_token", "nexus_user").map_err(|e| e.to_string())?;
    entry.get_password().map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                #[cfg(target_os = "macos")]
                {
                    use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};
                    if let Err(err) = apply_vibrancy(&window, NSVisualEffectMaterial::FullScreenUI, None, None) {
                        eprintln!("Warning: Failed to apply macOS vibrancy: {}", err);
                    }
                }
            }
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                window.app_handle().exit(0);
            }
        })
        .invoke_handler(tauri::generate_handler![
            check_prerequisites,
            fetch_github_prs,
            generate_ai_summary,
            reveal_browser_tab,
            save_github_token,
            get_github_token
        ])
        .run(tauri::generate_context!())
        .expect("error while running github-report application");
}
