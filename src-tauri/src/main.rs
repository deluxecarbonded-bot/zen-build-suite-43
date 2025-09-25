// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_system_info() -> String {
    format!("System: {} - Architecture: {}", std::env::consts::OS, std::env::consts::ARCH)
}

#[tauri::command]
fn open_browser(url: &str) -> Result<(), String> {
    // For now, just log the URL - in a real implementation, you'd use open::that(url)
    println!("Opening browser with URL: {}", url);
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_path::init())
        .invoke_handler(tauri::generate_handler![greet, get_system_info, open_browser])
        .setup(|app| {
            // Get the main window
            let window = app.get_window("main").unwrap();
            
            // Set window title
            window.set_title("Zen Build Suite - Chrome/Chromium Engine").unwrap();
            
            // Enable web security for production
            #[cfg(not(debug_assertions))]
            window.with_webview(|webview| {
                webview.eval("console.log('Zen Build Suite loaded with Chrome/Chromium engine');").unwrap();
            }).unwrap();
            
            Ok(())
        })
        .on_window_event(|event| match event.event() {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                // Handle close event if needed
                println!("Window close requested");
            }
            _ => {}
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
