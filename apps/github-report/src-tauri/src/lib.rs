use tauri::Manager;

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
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                window.app_handle().exit(0);
            }
        })
        .invoke_handler(tauri::generate_handler![
            save_github_token,
            get_github_token
        ])
        .run(tauri::generate_context!())
        .expect("error while running github-report application");
}
