use tauri::Manager;

#[tauri::command]
fn open_mini_app(bundle_id: String) -> Result<String, String> {
    #[cfg(target_os = "macos")]
    {
        use std::process::Command;
        let output = Command::new("open")
            .arg("-b")
            .arg(&bundle_id)
            .output();

        match output {
            Ok(res) if res.status.success() => Ok(format!("Opened application: {}", bundle_id)),
            Ok(_) => Err(format!("App with bundle ID '{}' is not installed or could not be opened", bundle_id)),
            Err(e) => Err(format!("Failed to execute open command: {}", e)),
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        Err("Mini apps launch is only supported on macOS in this release".to_string())
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
            save_secure_secret,
            get_secure_secret
        ])
        .run(tauri::generate_context!())
        .expect("error while running nexus application");
}
