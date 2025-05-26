mod backend;

use backend::{
    containers::{run_containers, assign_roles, start_condor_master},
    ssh::{start_ssh_connection, execute_command},
    resources::{show_resources_specs, init_swarm_manager}
};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            run_containers,
            start_ssh_connection,
            execute_command,
            show_resources_specs,
            start_condor_master,
            assign_roles,
            init_swarm_manager
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}