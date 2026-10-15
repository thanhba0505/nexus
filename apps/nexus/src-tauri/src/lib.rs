use tauri::Manager;

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

        // 1. Thử mở qua standard macOS bundle ID
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

        // 2. Dự phòng trong môi trường dev / local build nếu chưa đăng ký LaunchServices
        if let Some(ref name) = app_name {
            let app_bundle_name = format!("{}.app", name);
            let candidate_paths = [
                format!("/Applications/{}", app_bundle_name),
                format!("./target/release/bundle/macos/{}", app_bundle_name),
                format!("./target/release/bundle/osx/{}", app_bundle_name),
                format!("../../target/release/bundle/macos/{}", app_bundle_name),
                format!("../../target/release/bundle/osx/{}", app_bundle_name),
                format!("../{}/src-tauri/target/release/bundle/macos/{}", name.to_lowercase(), app_bundle_name),
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

            let binary_slug = name.to_lowercase().replace(' ', "-");
            let bin_candidates = [
                format!("./target/debug/{}", binary_slug),
                format!("./target/release/{}", binary_slug),
                format!("../../target/debug/{}", binary_slug),
                format!("../../target/release/{}", binary_slug),
            ];
            for path in bin_candidates {
                if std::path::Path::new(&path).exists() {
                    if let Ok(_) = Command::new(&path).spawn() {
                        return Ok(format!("Spawned binary: {}", path));
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

        // 1. Thoát nhẹ nhàng bằng AppleScript qua bundle identifier
        if !bundle_id.is_empty() {
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

            // 1. Kiểm tra qua lsappinfo (nhanh nhất trên macOS, không cần quyền AppleScript)
            if !app.bundle_id.is_empty() {
                if let Ok(output) = Command::new("lsappinfo")
                    .arg("info")
                    .arg("-bundleid")
                    .arg(&app.bundle_id)
                    .output()
                {
                    let stdout = String::from_utf8_lossy(&output.stdout);
                    if stdout.contains("bundleID=") || stdout.contains("ASN:") {
                        is_running = true;
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

            // 3. Dự phòng: AppleScript check
            if !is_running && !app.bundle_id.is_empty() {
                if let Ok(output) = Command::new("osascript")
                    .arg("-e")
                    .arg(format!("application id \"{}\" is running", app.bundle_id))
                    .output()
                {
                    if String::from_utf8_lossy(&output.stdout).trim() == "true" {
                        is_running = true;
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

#[tauri::command]
fn save_secure_secret(service: String, secret: String) -> Result<(), String> {
    let entry = keyring::Entry::new(&service, "nexus_user").map_err(|e| e.to_string())?;
    entry.set_password(&secret).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_secure_secret(service: String) -> Result<String, String> {
    let entry = keyring::Entry::new(&service, "nexus_user").map_err(|e| e.to_string())?;
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
