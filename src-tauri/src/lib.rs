mod backend;

use backend::{
    containers::{run_containers, start_condor_master},
    lan_ssh::{script_permissions, scan_lan_resources, start_ssh_connection, execute_command},
    resources::{show_resources_specs, initialize_cluster}
};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // local
            run_containers,
            start_ssh_connection,
            execute_command,
            show_resources_specs,
            start_condor_master,
            initialize_cluster,

            // lan
            script_permissions,
            scan_lan_resources
            
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}