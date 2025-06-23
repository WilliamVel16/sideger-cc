mod backend;
use backend::{
    containers::{run_containers},
    lan_ssh::{script_permissions, scan_interfaces, scan_lan_resources, get_my_ip, start_ssh_connection, execute_command},
    resources::{show_resources_specs, show_my_specs, initialize_cluster}
};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            // local
            run_containers,
            execute_command,
            initialize_cluster,

            // lan
            script_permissions,
            scan_interfaces,
            scan_lan_resources,
            get_my_ip,
            start_ssh_connection,
            show_resources_specs,
            show_my_specs,
            
            ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}