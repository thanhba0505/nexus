use tauri::Manager;

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SlackCredentialsDto {
    pub has_user_token: bool,
    pub has_app_token: bool,
    pub masked_user_token: Option<String>,
    pub masked_app_token: Option<String>,
}

#[derive(serde::Serialize, serde::Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct SlackStatusDto {
    pub has_user_token: bool,
    pub has_app_token: bool,
    pub is_connected: bool,
    pub socket_status: String,
    pub local_ai_installed: bool,
    pub local_ai_engine: Option<String>,
    pub version: String,
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

fn get_keychain_service() -> &'static str {
    if cfg!(debug_assertions) {
        "nexus-slackbot-dev"
    } else {
        "nexus-slackbot"
    }
}

fn get_user_token_account() -> &'static str {
    if cfg!(debug_assertions) {
        "slack_user_token_dev"
    } else {
        "slack_user_token"
    }
}

fn get_app_token_account() -> &'static str {
    if cfg!(debug_assertions) {
        "slack_app_token_dev"
    } else {
        "slack_app_token"
    }
}

fn mask_token(token: &str) -> String {
    if token.is_empty() {
        return String::new();
    }
    if token.len() <= 8 {
        return "****".to_string();
    }
    let prefix = if token.len() >= 6 {
        &token[..6]
    } else {
        &token[..3]
    };
    let suffix = &token[token.len() - 4..];
    format!("{}...{}", prefix, suffix)
}

#[tauri::command]
fn save_slack_credentials(user_token: String, app_token: String) -> Result<(), String> {
    let u = user_token.trim();
    if !u.is_empty() {
        let entry = keyring::Entry::new(get_keychain_service(), get_user_token_account())
            .map_err(|e| format!("Lỗi truy cập Keychain: {}", e))?;
        entry
            .set_password(u)
            .map_err(|e| format!("Lỗi lưu User Token: {}", e))?;
    }
    let a = app_token.trim();
    if !a.is_empty() {
        let entry = keyring::Entry::new(get_keychain_service(), get_app_token_account())
            .map_err(|e| format!("Lỗi truy cập Keychain: {}", e))?;
        entry
            .set_password(a)
            .map_err(|e| format!("Lỗi lưu App Token: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
fn get_slack_credentials() -> Result<SlackCredentialsDto, String> {
    let user_res = keyring::Entry::new(get_keychain_service(), get_user_token_account())
        .ok()
        .and_then(|e| e.get_password().ok());
    let app_res = keyring::Entry::new(get_keychain_service(), get_app_token_account())
        .ok()
        .and_then(|e| e.get_password().ok());

    Ok(SlackCredentialsDto {
        has_user_token: user_res.is_some(),
        has_app_token: app_res.is_some(),
        masked_user_token: user_res.as_deref().map(mask_token),
        masked_app_token: app_res.as_deref().map(mask_token),
    })
}

#[tauri::command]
fn delete_slack_credentials() -> Result<(), String> {
    if let Ok(entry) = keyring::Entry::new(get_keychain_service(), get_user_token_account()) {
        let _ = entry.delete_credential();
    }
    if let Ok(entry) = keyring::Entry::new(get_keychain_service(), get_app_token_account()) {
        let _ = entry.delete_credential();
    }
    Ok(())
}

fn internal_check_slack_status() -> Result<SlackStatusDto, String> {
    let user_token_exists = keyring::Entry::new(get_keychain_service(), get_user_token_account())
        .map(|e| e.get_password().is_ok())
        .unwrap_or(false);

    let app_token_exists = keyring::Entry::new(get_keychain_service(), get_app_token_account())
        .map(|e| e.get_password().is_ok())
        .unwrap_or(false);

    let agy_found = find_executable("agy").is_some();
    let claude_found = find_executable("claude").is_some();

    let (local_ai_installed, local_ai_engine) = if agy_found {
        (true, Some("Antigravity CLI".to_string()))
    } else if claude_found {
        (true, Some("Claude Code CLI".to_string()))
    } else {
        (false, None)
    };

    let socket_status = if user_token_exists && app_token_exists {
        "ready_to_connect".to_string()
    } else {
        "disconnected".to_string()
    };

    Ok(SlackStatusDto {
        has_user_token: user_token_exists,
        has_app_token: app_token_exists,
        is_connected: false,
        socket_status,
        local_ai_installed,
        local_ai_engine,
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

#[tauri::command]
async fn check_slack_status() -> Result<SlackStatusDto, String> {
    tauri::async_runtime::spawn_blocking(internal_check_slack_status)
        .await
        .map_err(|e| e.to_string())?
}

// Backward-compatibility wrappers
#[tauri::command]
fn save_slack_token(token: String) -> Result<(), String> {
    save_slack_credentials(token, String::new())
}

#[tauri::command]
fn get_slack_token() -> Result<String, String> {
    let entry = keyring::Entry::new(get_keychain_service(), get_user_token_account())
        .map_err(|e| e.to_string())?;
    entry.get_password().map_err(|e| e.to_string())
}

#[tauri::command]
async fn connect_socket_mode() -> Result<(), String> {
    Ok(())
}

#[tauri::command]
async fn disconnect_socket_mode() -> Result<(), String> {
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|_app| Ok(()))
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                window.app_handle().exit(0);
            }
        })
        .invoke_handler(tauri::generate_handler![
            save_slack_credentials,
            get_slack_credentials,
            delete_slack_credentials,
            check_slack_status,
            save_slack_token,
            get_slack_token,
            connect_socket_mode,
            disconnect_socket_mode
        ])
        .run(tauri::generate_context!())
        .expect("error while running slackbot application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_mask_token_empty_and_short() {
        assert_eq!(mask_token(""), "");
        assert_eq!(mask_token("123"), "****");
        assert_eq!(mask_token("12345678"), "****");
    }

    #[test]
    fn test_mask_token_slack_tokens() {
        let user_token = "xoxp-1234567890-abcdef";
        let masked = mask_token(user_token);
        assert_eq!(masked, "xoxp-1...cdef");
        assert!(!masked.contains("1234567890"));

        let app_token = "xapp-1-A0123456789-9876543210-xyz";
        let masked_app = mask_token(app_token);
        assert_eq!(masked_app, "xapp-1...-xyz");
        assert!(!masked_app.contains("A0123456789"));
    }

    #[test]
    fn test_keychain_isolation_in_dev_mode() {
        // When running tests, cfg!(debug_assertions) is true
        assert_eq!(get_keychain_service(), "nexus-slackbot-dev");
        assert_eq!(get_user_token_account(), "slack_user_token_dev");
        assert_eq!(get_app_token_account(), "slack_app_token_dev");
    }

    #[test]
    fn test_dto_serialization_camel_case() {
        let creds = SlackCredentialsDto {
            has_user_token: true,
            has_app_token: false,
            masked_user_token: Some("xoxp-1...9999".to_string()),
            masked_app_token: None,
        };

        let json = serde_json::to_string(&creds).expect("Serialize creds");
        assert!(json.contains("\"hasUserToken\":true"));
        assert!(json.contains("\"hasAppToken\":false"));
        assert!(json.contains("\"maskedUserToken\":\"xoxp-1...9999\""));
        assert!(json.contains("\"maskedAppToken\":null"));

        let status = SlackStatusDto {
            has_user_token: true,
            has_app_token: true,
            is_connected: false,
            socket_status: "ready_to_connect".to_string(),
            local_ai_installed: true,
            local_ai_engine: Some("Claude Code CLI".to_string()),
            version: "0.4.0".to_string(),
        };

        let json_status = serde_json::to_string(&status).expect("Serialize status");
        assert!(json_status.contains("\"localAiInstalled\":true"));
        assert!(json_status.contains("\"localAiEngine\":\"Claude Code CLI\""));
        assert!(json_status.contains("\"socketStatus\":\"ready_to_connect\""));
    }
}
