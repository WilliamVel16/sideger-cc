use std::process::Command;
use std::env;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|_app| {
            let is_dev = cfg!(debug_assertions); //true en dev, false en build --release

            //USE_EXTERNAL_BACKEND=1 in development, prevents Tauri from launching the Python backend automatically
            //in production (release build), Tauri always works as a frontend only, the backend must be started externally
            if is_dev && env::var("USE_EXTERNAL_BACKEND").unwrap_or("0".into()) != "1" {
                Command::new("bash")
                    .arg("start.sh")
                    .current_dir("../src-backend")
                    .spawn()
                    .expect("Error starting Python backend");
            } else {
                println!("Using external Backend");
            }

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("Error executing Tauri");
}