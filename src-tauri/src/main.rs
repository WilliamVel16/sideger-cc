use std::process::Command;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|_app| {
            Command::new("bash")
                .arg("start.sh")
                .current_dir("../src-backend")
                .spawn()
                .expect("it couldn't start the Backend Python");
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Error executing Tauri");
}