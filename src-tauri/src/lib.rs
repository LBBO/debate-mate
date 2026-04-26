#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .plugin(tauri_plugin_swipe_back_ios::init())
        .plugin(tauri_plugin_safe_area_insets_css::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
