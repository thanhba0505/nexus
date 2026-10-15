
#[derive(serde::Deserialize, serde::Serialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct MiniAppCheckMeta {
    pub id: String,
    #[serde(alias = "bundle_id")]
    pub bundle_id: String,
    pub name: String,
}

#[tauri::command]
fn open_mini_app(bundle_id: String, app_name: Option<String>) -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;

        let binary_slug = app_name.as_ref().map(|n| n.to_lowercase().replace(' ', "-"));

        // =========================================================================
        // 1. MÔI TRƯỜNG DEV (chạy tauri dev / debug_assertions)
        // =========================================================================
        if cfg!(debug_assertions) {
            // 1.1. Nếu ứng dụng dev đang chạy, đưa cửa sổ lên phía trước (activate)
            if let Some(ref slug) = binary_slug {
                let is_running = Command::new("pgrep")
                    .arg("-x")
                    .arg(slug)
                    .status()
                    .map(|s| s.success())
                    .unwrap_or(false);

                if is_running {
                    let _ = Command::new("osascript")
                        .arg("-e")
                        .arg(format!(
                            "tell application \"System Events\" to set frontmost of first process whose name is \"{}\" to true",
                            slug
                        ))
                        .output();
                    if let Some(ref name) = app_name {
                        let _ = Command::new("osascript")
                            .arg("-e")
                            .arg(format!("tell application \"{}\" to activate", name))
                            .output();
                    }
                    return Ok(format!("Activated already running dev app: {}", slug));
                }
            }

            // 1.2. Thử mở qua dev bundle ID (nếu bundle .dev đã đăng ký)
            let dev_bundle = format!("{}.dev", bundle_id);
            if let Ok(res) = Command::new("open").arg("-b").arg(&dev_bundle).output() {
                if res.status.success() {
                    return Ok(format!("Opened application bundle: {}", dev_bundle));
                }
            }

            // 1.3. Khởi chạy binary debug trong target/debug (kết nối trực tiếp devUrl Vite)
            if let Some(ref slug) = binary_slug {
                let bin_candidates = [
                    format!("./target/debug/{}", slug),
                    format!("../../target/debug/{}", slug),
                    format!("../target/debug/{}", slug),
                    format!("../{}/src-tauri/target/debug/{}", slug, slug),
                ];
                for path in bin_candidates {
                    if std::path::Path::new(&path).exists() {
                        if let Ok(_) = Command::new(&path).spawn() {
                            return Ok(format!("Spawned dev binary: {}", path));
                        }
                    }
                }
            }
        }

        // =========================================================================
        // 2. MÔI TRƯỜNG PRODUCTION (hoặc khi không tìm thấy bản dev)
        // =========================================================================
        // 2.1. Thử mở qua standard macOS bundle ID (/Applications hoặc hệ thống)
        if !bundle_id.is_empty() {
            let output = Command::new("open")
                .arg("-b")
                .arg(&bundle_id)
                .output();

            if let Ok(res) = output {
                if res.status.success() {
                    return Ok(format!("Opened application: {}", bundle_id));
                }
            }
        }

        // 2.2. Tìm app bundle theo tên trong /Applications hoặc thư mục build release
        if let Some(ref name) = app_name {
            let app_bundle_name = format!("{}.app", name);
            let candidate_paths = [
                format!("/Applications/{}", app_bundle_name),
                format!("./target/release/bundle/macos/{}", app_bundle_name),
                format!("../../target/release/bundle/macos/{}", app_bundle_name),
                format!("./target/release/bundle/osx/{}", app_bundle_name),
                format!("../../target/release/bundle/osx/{}", app_bundle_name),
            ];

            for path in candidate_paths {
                if std::path::Path::new(&path).exists() {
                    if let Ok(res) = Command::new("open").arg(&path).output() {
                        if res.status.success() {
                            return Ok(format!("Opened application: {}", path));
                        }
                    }
                }
            }
        }

        Err(format!("App with bundle ID '{}' is not installed or could not be opened", bundle_id))
    }

    #[cfg(not(target_os = "macos"))]
    {
        Err("Mini apps launch is only supported on macOS in this release".to_string())
    }
}

#[tauri::command]
fn close_mini_app(bundle_id: String, app_name: Option<String>) -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;

        // 1. Thoát nhẹ nhàng bằng AppleScript qua bundle identifier (cả dev lẫn prod)
        if !bundle_id.is_empty() {
            let _ = Command::new("osascript")
                .arg("-e")
                .arg(format!("tell application id \"{}.dev\" to quit", bundle_id))
                .output();
            let _ = Command::new("osascript")
                .arg("-e")
                .arg(format!("tell application id \"{}\" to quit", bundle_id))
                .output();
        }

        // 2. Đóng tiến trình qua tên nhị phân/ứng dụng bằng pkill -x
        let mut names_to_kill = Vec::new();
        if let Some(ref name) = app_name {
            names_to_kill.push(name.clone());
            names_to_kill.push(name.to_lowercase());
            names_to_kill.push(name.to_lowercase().replace(' ', "-"));
            names_to_kill.push(name.replace(' ', ""));
        }
        if let Some(last_part) = bundle_id.split('.').last() {
            names_to_kill.push(last_part.to_string());
        }

        for proc_name in names_to_kill {
            if !proc_name.is_empty() {
                let _ = Command::new("pkill")
                    .arg("-x")
                    .arg(&proc_name)
                    .output();
            }
        }

        Ok(format!("Closed application: {}", bundle_id))
    }

    #[cfg(not(target_os = "macos"))]
    {
        Err("Mini apps close is only supported on macOS in this release".to_string())
    }
}

#[tauri::command]
fn check_running_apps(apps: Vec<MiniAppCheckMeta>) -> Result<Vec<String>, String> {
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;

        let mut running_ids = Vec::new();

        for app in apps {
            let mut is_running = false;

            // 1. Kiểm tra qua lsappinfo (hỗ trợ cả bundle dev và prod)
            if !app.bundle_id.is_empty() {
                let dev_id = format!("{}.dev", app.bundle_id);
                for bid in [&dev_id, &app.bundle_id] {
                    if let Ok(output) = Command::new("lsappinfo")
                        .arg("info")
                        .arg("-bundleid")
                        .arg(bid)
                        .output()
                    {
                        let stdout = String::from_utf8_lossy(&output.stdout);
                        if stdout.contains("bundleID=") || stdout.contains("ASN:") {
                            is_running = true;
                            break;
                        }
                    }
                }
            }

            // 2. Kiểm tra tiến trình trực tiếp qua pgrep -x
            if !is_running {
                let mut candidates = vec![
                    app.name.clone(),
                    app.name.to_lowercase(),
                    app.name.to_lowercase().replace(' ', "-"),
                    app.name.replace(' ', ""),
                    app.id.clone(),
                ];
                if let Some(last_part) = app.bundle_id.split('.').last() {
                    candidates.push(last_part.to_string());
                }

                for name in &candidates {
                    if let Ok(status) = Command::new("pgrep").arg("-x").arg(name).status() {
                        if status.success() {
                            is_running = true;
                            break;
                        }
                    }
                }
            }

            // 3. Dự phòng: AppleScript check (hỗ trợ cả bundle dev và prod)
            if !is_running && !app.bundle_id.is_empty() {
                let dev_id = format!("{}.dev", app.bundle_id);
                for bid in [&dev_id, &app.bundle_id] {
                    if let Ok(output) = Command::new("osascript")
                        .arg("-e")
                        .arg(format!("application id \"{}\" is running", bid))
                        .output()
                    {
                        if String::from_utf8_lossy(&output.stdout).trim() == "true" {
                            is_running = true;
                            break;
                        }
                    }
                }
            }

            if is_running {
                running_ids.push(app.id);
            }
        }

        Ok(running_ids)
    }

    #[cfg(not(target_os = "macos"))]
    {
        Ok(Vec::new())
    }
}

fn get_keychain_service(service: &str) -> String {
    if cfg!(debug_assertions) {
        format!("{}-dev", service)
    } else {
        service.to_string()
    }
}

fn get_keychain_account() -> &'static str {
    if cfg!(debug_assertions) {
        "nexus_user_dev"
    } else {
        "nexus_user"
    }
}

#[tauri::command]
fn save_secure_secret(service: String, secret: String) -> Result<(), String> {
    let resolved_service = get_keychain_service(&service);
    let entry = keyring::Entry::new(&resolved_service, get_keychain_account()).map_err(|e| e.to_string())?;
    entry.set_password(&secret).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_secure_secret(service: String) -> Result<String, String> {
    let resolved_service = get_keychain_service(&service);
    let entry = keyring::Entry::new(&resolved_service, get_keychain_account()).map_err(|e| e.to_string())?;
    entry.get_password().map_err(|e| e.to_string())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|_app| {
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            open_mini_app,
            close_mini_app,
            check_running_apps,
            save_secure_secret,
            get_secure_secret
        ])
        .run(tauri::generate_context!())
        .expect("error while running nexus application");
}
