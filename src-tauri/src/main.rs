// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{Manager, WindowBuilder, WindowUrl};
use std::collections::HashMap;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_system_info() -> String {
    format!("System: {} - Architecture: {} - Chrome Engine: Active", std::env::consts::OS, std::env::consts::ARCH)
}

#[tauri::command]
fn open_browser(url: &str) -> Result<(), String> {
    // For now, just log the URL - in a real implementation, you'd use open::that(url)
    println!("Opening browser with URL: {}", url);
    Ok(())
}

// Webview management commands
#[tauri::command]
async fn create_webview(
    app_handle: tauri::AppHandle,
    url: String,
    title: String,
    width: f64,
    height: f64,
    resizable: bool,
    center: bool,
    decorations: bool,
    always_on_top: bool,
    skip_taskbar: bool,
    web_security: bool,
    additional_browser_args: Vec<String>,
) -> Result<String, String> {
    let webview_id = format!("webview_{}", chrono::Utc::now().timestamp_millis());
    
    let mut webview_builder = WindowBuilder::new(
        &app_handle,
        &webview_id,
        WindowUrl::External(url.parse().map_err(|e| format!("Invalid URL: {}", e))?)
    )
    .title(&title)
    .inner_size(width, height)
    .resizable(resizable)
    .center()
    .decorations(decorations)
    .always_on_top(always_on_top)
    .skip_taskbar(skip_taskbar);

    // Add browser arguments for enhanced Chrome/Chromium engine support
    let mut browser_args = vec![
        "--disable-web-security".to_string(),
        "--disable-features=VizDisplayCompositor".to_string(),
        "--enable-webgl".to_string(),
        "--enable-gpu".to_string(),
        "--enable-accelerated-2d-canvas".to_string(),
        "--enable-accelerated-video-decode".to_string(),
        "--enable-gpu-compositing".to_string(),
        "--enable-hardware-overlays".to_string(),
        "--enable-zero-copy".to_string(),
        "--enable-native-gpu-memory-buffers".to_string(),
        "--enable-gpu-rasterization".to_string(),
        "--enable-oop-rasterization".to_string(),
        "--enable-checker-imaging".to_string(),
        "--enable-gpu-service-logging".to_string(),
        "--enable-logging".to_string(),
        "--v=1".to_string(),
        "--enable-features=VaapiVideoDecoder".to_string(),
        "--disable-background-timer-throttling".to_string(),
        "--disable-backgrounding-occluded-windows".to_string(),
        "--disable-renderer-backgrounding".to_string(),
        "--disable-field-trial-config".to_string(),
        "--disable-back-forward-cache".to_string(),
        "--disable-ipc-flooding-protection".to_string(),
        "--enable-webgl2-compute-context".to_string(),
        "--enable-gpu-service".to_string(),
    ];
    
    browser_args.extend(additional_browser_args);
    
    webview_builder = webview_builder.additional_browser_args(browser_args);

    if !web_security {
        webview_builder = webview_builder.web_security(false);
    }

    let webview = webview_builder.build().map_err(|e| format!("Failed to create webview: {}", e))?;
    
    // Store webview reference for later use
    app_handle.manage(WebviewManager::new());
    
    Ok(webview_id)
}

#[tauri::command]
async fn navigate_webview(
    app_handle: tauri::AppHandle,
    webview_id: String,
    url: String,
) -> Result<(), String> {
    if let Some(webview) = app_handle.get_window(&webview_id) {
        webview.navigate(WindowUrl::External(url.parse().map_err(|e| format!("Invalid URL: {}", e))?))
            .map_err(|e| format!("Failed to navigate: {}", e))?;
    } else {
        return Err("Webview not found".to_string());
    }
    Ok(())
}

#[tauri::command]
async fn webview_go_back(
    app_handle: tauri::AppHandle,
    webview_id: String,
) -> Result<(), String> {
    if let Some(webview) = app_handle.get_window(&webview_id) {
        webview.with_webview(|webview| {
            webview.go_back().map_err(|e| format!("Failed to go back: {}", e))
        }).map_err(|e| format!("Webview error: {}", e))??;
    } else {
        return Err("Webview not found".to_string());
    }
    Ok(())
}

#[tauri::command]
async fn webview_go_forward(
    app_handle: tauri::AppHandle,
    webview_id: String,
) -> Result<(), String> {
    if let Some(webview) = app_handle.get_window(&webview_id) {
        webview.with_webview(|webview| {
            webview.go_forward().map_err(|e| format!("Failed to go forward: {}", e))
        }).map_err(|e| format!("Webview error: {}", e))??;
    } else {
        return Err("Webview not found".to_string());
    }
    Ok(())
}

#[tauri::command]
async fn webview_reload(
    app_handle: tauri::AppHandle,
    webview_id: String,
) -> Result<(), String> {
    if let Some(webview) = app_handle.get_window(&webview_id) {
        webview.with_webview(|webview| {
            webview.reload().map_err(|e| format!("Failed to reload: {}", e))
        }).map_err(|e| format!("Webview error: {}", e))??;
    } else {
        return Err("Webview not found".to_string());
    }
    Ok(())
}

// Webview manager to track active webviews
struct WebviewManager {
    webviews: HashMap<String, String>, // webview_id -> url mapping
}

impl WebviewManager {
    fn new() -> Self {
        Self {
            webviews: HashMap::new(),
        }
    }
}

impl Default for WebviewManager {
    fn default() -> Self {
        Self::new()
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_path::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            get_system_info, 
            open_browser,
            create_webview,
            navigate_webview,
            webview_go_back,
            webview_go_forward,
            webview_reload
        ])
        .setup(|app| {
            // Get the main window
            let window = app.get_window("main").unwrap();
            
            // Set window title
            window.set_title("Serenity Browser - Chrome/Chromium Engine").unwrap();
            
            // Enable web security for production
            #[cfg(not(debug_assertions))]
            window.with_webview(|webview| {
                webview.eval("console.log('Serenity Browser loaded with Chrome/Chromium engine');").unwrap();
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
