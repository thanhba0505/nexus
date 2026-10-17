use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};
use tauri::Manager;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ScreenBoundsDto {
    pub width: f64,
    pub height: f64,
    pub scale_factor: f64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct PetItemDto {
    pub id: String,
    pub name: String,
    pub description: String,
    pub frame_count: usize,
    pub preview_url: String,
    pub is_custom: bool,
    pub folder_path: Option<String>,
}

#[tauri::command]
async fn get_screen_bounds(window: tauri::Window) -> Result<ScreenBoundsDto, String> {
    if let Ok(Some(monitor)) = window.current_monitor() {
        let size = monitor.size();
        let scale = monitor.scale_factor();
        let logical_size = size.to_logical::<f64>(scale);
        Ok(ScreenBoundsDto {
            width: logical_size.width,
            height: logical_size.height,
            scale_factor: scale,
        })
    } else {
        Ok(ScreenBoundsDto {
            width: 1920.0,
            height: 1080.0,
            scale_factor: 2.0,
        })
    }
}

#[tauri::command]
async fn spawn_pet_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("pet-overlay") {
        win.show().map_err(|e| e.to_string())?;
        win.set_focus().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Không tìm thấy cửa sổ pet-overlay".to_string())
    }
}

#[tauri::command]
async fn close_pet_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("pet-overlay") {
        win.hide().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Ok(())
    }
}

#[tauri::command]
async fn is_pet_spawned(app: tauri::AppHandle) -> Result<bool, String> {
    if let Some(win) = app.get_webview_window("pet-overlay") {
        win.is_visible().map_err(|e| e.to_string())
    } else {
        Ok(false)
    }
}

#[tauri::command]
async fn show_dashboard_window(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("main") {
        win.unminimize().ok();
        win.show().map_err(|e| e.to_string())?;
        win.set_focus().map_err(|e| e.to_string())?;
        Ok(())
    } else {
        Err("Không tìm thấy cửa sổ main".to_string())
    }
}

#[tauri::command]
async fn set_pet_position(app: tauri::AppHandle, x: f64, y: f64) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("pet-overlay") {
        win.set_position(tauri::Position::Logical(tauri::LogicalPosition::new(x, y)))
            .map_err(|e| e.to_string())
    } else {
        Ok(())
    }
}

#[tauri::command]
async fn get_pet_position(app: tauri::AppHandle) -> Result<(f64, f64), String> {
    if let Some(win) = app.get_webview_window("pet-overlay") {
        let pos = win.outer_position().map_err(|e| e.to_string())?;
        let scale = win.scale_factor().unwrap_or(1.0);
        let logical = pos.to_logical::<f64>(scale);
        Ok((logical.x, logical.y))
    } else {
        Ok((300.0, 300.0))
    }
}

#[tauri::command]
async fn set_ignore_cursor(app: tauri::AppHandle, ignore: bool) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("pet-overlay") {
        win.set_ignore_cursor_events(ignore)
            .map_err(|e| e.to_string())
    } else {
        Ok(())
    }
}

#[tauri::command]
async fn set_pet_always_on_top(app: tauri::AppHandle, always_on_top: bool) -> Result<(), String> {
    if let Some(win) = app.get_webview_window("pet-overlay") {
        win.set_always_on_top(always_on_top)
            .map_err(|e| e.to_string())
    } else {
        Ok(())
    }
}

#[tauri::command]
async fn close_pet(app: tauri::AppHandle) -> Result<(), String> {
    app.exit(0);
    Ok(())
}

fn get_custom_pets_dir(app: &tauri::AppHandle) -> Result<PathBuf, String> {
    let app_dir = app.path().app_data_dir().map_err(|e| e.to_string())?;
    let custom_dir = app_dir.join("custom_pets");
    fs::create_dir_all(&custom_dir).map_err(|e| e.to_string())?;
    Ok(custom_dir)
}

#[tauri::command]
async fn scan_shimeji_folder(folder_path: String) -> Result<Vec<String>, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let path = Path::new(&folder_path);
        if !path.exists() || !path.is_dir() {
            return Err("Thư mục không tồn tại hoặc không hợp lệ".to_string());
        }

        let mut png_files = Vec::new();
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                let file_path = entry.path();
                if let Some(ext) = file_path.extension() {
                    if ext.to_string_lossy().to_lowercase() == "png" {
                        png_files.push(file_path.to_string_lossy().to_string());
                    }
                }
            }
        }

        png_files.sort();
        Ok(png_files)
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn import_custom_pet(
    app: tauri::AppHandle,
    folder_path: String,
    pet_name: String,
) -> Result<PetItemDto, String> {
    tauri::async_runtime::spawn_blocking(move || {
        let src_path = Path::new(&folder_path);
        if !src_path.exists() || !src_path.is_dir() {
            return Err("Thư mục nguồn không hợp lệ".to_string());
        }

        let custom_root = get_custom_pets_dir(&app)?;
        let clean_name = pet_name.trim();
        let safe_id = format!(
            "custom-{}",
            clean_name
                .to_lowercase()
                .chars()
                .filter(|c| c.is_alphanumeric() || *c == '-')
                .collect::<String>()
        );
        let dest_dir = custom_root.join(&safe_id);
        fs::create_dir_all(&dest_dir).map_err(|e| e.to_string())?;

        let mut count = 0;
        let mut first_preview = String::new();

        if let Ok(entries) = fs::read_dir(src_path) {
            for entry in entries.flatten() {
                let p = entry.path();
                if let Some(ext) = p.extension() {
                    if ext.to_string_lossy().to_lowercase() == "png" {
                        let file_name = p.file_name().unwrap_or_default();
                        let dest_file = dest_dir.join(file_name);
                        fs::copy(&p, &dest_file).ok();
                        count += 1;
                        if first_preview.is_empty() {
                            first_preview = dest_file.to_string_lossy().to_string();
                        }
                    }
                }
            }
        }

        if count == 0 {
            return Err("Không tìm thấy file ảnh PNG nào trong thư mục Shimeji".to_string());
        }

        Ok(PetItemDto {
            id: safe_id,
            name: if clean_name.is_empty() {
                "Nhân vật tùy chỉnh".to_string()
            } else {
                clean_name.to_string()
            },
            description: format!("Bộ ảnh Shimeji tùy chỉnh ({} frames)", count),
            frame_count: count,
            preview_url: first_preview,
            is_custom: true,
            folder_path: Some(dest_dir.to_string_lossy().to_string()),
        })
    })
    .await
    .map_err(|e| e.to_string())?
}

#[tauri::command]
async fn get_pet_library(app: tauri::AppHandle) -> Result<Vec<PetItemDto>, String> {
    let mut list = vec![
        PetItemDto {
            id: "anya".to_string(),
            name: "Anya Forger (Chibi)".to_string(),
            description: "Đồng phục Eden Academy, biểu cảm Waku Waku & cười gian".to_string(),
            frame_count: 13,
            preview_url: "/sprites/default/shime1.png".to_string(),
            is_custom: false,
            folder_path: None,
        },
        PetItemDto {
            id: "neko".to_string(),
            name: "Bé Mèo Neko".to_string(),
            description: "Mèo con tinh nghịch, đuôi ngoe nguẩy và ngủ khò".to_string(),
            frame_count: 13,
            preview_url: "/sprites/default/shime1.png".to_string(),
            is_custom: false,
            folder_path: None,
        },
        PetItemDto {
            id: "miku".to_string(),
            name: "Hatsune Miku (Chibi)".to_string(),
            description: "Tóc xanh hai chùm đung đưa và cầm cọng hành".to_string(),
            frame_count: 13,
            preview_url: "/sprites/default/shime1.png".to_string(),
            is_custom: false,
            folder_path: None,
        },
    ];

    if let Ok(custom_dir) = get_custom_pets_dir(&app) {
        if let Ok(entries) = fs::read_dir(custom_dir) {
            for entry in entries.flatten() {
                let dir_path = entry.path();
                if dir_path.is_dir() {
                    let dir_name = dir_path
                        .file_name()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_default();
                    let mut count = 0;
                    let mut preview = String::new();
                    if let Ok(files) = fs::read_dir(&dir_path) {
                        for f in files.flatten() {
                            if f.path()
                                .extension()
                                .map(|e| e.to_string_lossy().to_lowercase())
                                == Some("png".to_string())
                            {
                                count += 1;
                                if preview.is_empty() {
                                    preview = f.path().to_string_lossy().to_string();
                                }
                            }
                        }
                    }

                    if count > 0 {
                        list.push(PetItemDto {
                            id: dir_name.clone(),
                            name: dir_name.replace("custom-", ""),
                            description: format!("Bộ Shimeji tùy chỉnh ({} frames)", count),
                            frame_count: count,
                            preview_url: preview,
                            is_custom: true,
                            folder_path: Some(dir_path.to_string_lossy().to_string()),
                        });
                    }
                }
            }
        }
    }

    Ok(list)
}

#[tauri::command]
async fn delete_custom_pet(app: tauri::AppHandle, pet_id: String) -> Result<(), String> {
    tauri::async_runtime::spawn_blocking(move || {
        let custom_root = get_custom_pets_dir(&app)?;
        let target_dir = custom_root.join(pet_id);
        if target_dir.exists() && target_dir.is_dir() {
            fs::remove_dir_all(target_dir).map_err(|e| e.to_string())?;
        }
        Ok(())
    })
    .await
    .map_err(|e| e.to_string())?
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|_app| Ok(()))
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { api, .. } = event {
                let label = window.label();
                if label == "main" {
                    // Check if pet-overlay is visible
                    let app = window.app_handle();
                    if let Some(pet_win) = app.get_webview_window("pet-overlay") {
                        if pet_win.is_visible().unwrap_or(false) {
                            // Keep pet running outside on desktop, just hide main dashboard
                            api.prevent_close();
                            window.hide().ok();
                            return;
                        }
                    }
                    app.exit(0);
                } else if label == "pet-overlay" {
                    // Just hide the pet overlay, don't kill the app
                    api.prevent_close();
                    window.hide().ok();
                }
            }
        })
        .invoke_handler(tauri::generate_handler![
            get_screen_bounds,
            spawn_pet_window,
            close_pet_window,
            is_pet_spawned,
            show_dashboard_window,
            set_pet_position,
            get_pet_position,
            set_ignore_cursor,
            set_pet_always_on_top,
            close_pet,
            scan_shimeji_folder,
            import_custom_pet,
            get_pet_library,
            delete_custom_pet
        ])
        .run(tauri::generate_context!())
        .expect("error while running 2d pet application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_dto_serialization_camel_case() {
        let bounds = ScreenBoundsDto {
            width: 1920.0,
            height: 1080.0,
            scale_factor: 2.0,
        };
        let json = serde_json::to_string(&bounds).expect("Serialize bounds");
        assert!(json.contains("\"width\":1920.0"));
        assert!(json.contains("\"scaleFactor\":2.0"));
    }

    #[test]
    fn test_pet_item_dto_serialization() {
        let pet = PetItemDto {
            id: "anya".to_string(),
            name: "Anya".to_string(),
            description: "Chibi".to_string(),
            frame_count: 13,
            preview_url: "/test.png".to_string(),
            is_custom: false,
            folder_path: None,
        };
        let json = serde_json::to_string(&pet).expect("Serialize pet item");
        assert!(json.contains("\"frameCount\":13"));
        assert!(json.contains("\"isCustom\":false"));
    }
}
