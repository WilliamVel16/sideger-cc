use std::process::Command;
use std::env;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|_app| {
            if env::var("USE_EXTERNAL_BACKEND").unwrap_or("0".into()) != "1" { //USE_EXTERNAL_BACKEND=1 avoid run start.sh (without container)
                Command::new("bash")
                    .arg("start.sh")
                    .current_dir("../src-backend")
                    .spawn()
                    .expect("Error starting Python backend");
            } else {
                println!("Backend externo detectado. Usando Docker.");
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Error executing Tauri");
}