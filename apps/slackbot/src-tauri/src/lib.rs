use tauri::Manager;

fn get_keychain_service() -> &'static str {
    if cfg!(debug_assertions) {
        "nexus-slackbot-dev"
    } else {
        "nexus-slackbot"
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
fn save_slack_token(token: String) -> Result<(), String> {
    let entry = keyring::Entry::new(get_keychain_service(), get_keychain_account()).map_err(|e| e.to_string())?;
    entry.set_password(&token).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
fn get_slack_token() -> Result<String, String> {
    let entry = keyring::Entry::new(get_keychain_service(), get_keychain_account()).map_err(|e| e.to_string())?;
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
                    if let Err(err) = apply_vibrancy(&window, NSVisualEffectMaterial::FullScreenUI, None, Some(14.0)) {
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
            save_slack_token,
            get_slack_token
        ])
        .run(tauri::generate_context!())
        .expect("error while running slackbot application");
}
