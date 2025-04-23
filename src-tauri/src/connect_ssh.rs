use dotenv::dotenv;
use openssh::{KnownHosts, SessionBuilder};
use serde::Deserialize;
use std::process::Command;

//#[derive(Deserialize)]
#[derive(Debug, Deserialize)]
pub struct MySSHRequest {
    host: String,
    username: String,
    command: String,
}

#[tauri::command]
pub async fn execute_ssh(req: MySSHRequest) -> Result<String, String> {
    dotenv().ok();
    println!("back receives: {}", req.command);
    let ssh_url = format!("{}@{}", req.username, req.host);
    let key_path = std::env::var("SSH_KEY").expect("SSH_KEY env var not set");

    let session = SessionBuilder::default()
        .known_hosts_check(KnownHosts::Accept)
        .keyfile(&key_path)
        .connect(&ssh_url)
        .await;

    match session {
        Ok(session) => {
            match session
                .command("sh")
                .arg("-c")
                .arg(&req.command)
                .output()
                .await
            {
                Ok(output) => Ok(String::from_utf8_lossy(&output.stdout).to_string()),
                Err(err) => Err(format!("Error running command: {}", err)),
            }
        }
        Err(err) => Err(format!("Couldn't connect via SSH to {}: {}", req.host, err)),
    }
}

#[tauri::command]
pub fn run_containers() -> Result<String, String> {
    let script_path = std::env::current_dir()
        .unwrap()
        .join("src/scripts/run_containers.sh");

    println!("path: {}", script_path.display());

    if !script_path.exists() {
        return Err(format!(
            "Script not found at path: {}",
            script_path.display()
        ));
    }

    let output = Command::new("bash")
        .arg(script_path)
        .output()
        .map_err(|err| format!("Failed to execute script containers: {}", err))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(format!(
            "Script failed:\n{}",
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}

#[tauri::command]
pub fn start_ssh_connection() -> Result<String, String> {
    let script_path = std::env::current_dir()
        .unwrap()
        .join("src/scripts/ssh_connection.sh");

    println!("path: {}", script_path.display());

    if !script_path.exists() {
        return Err(format!(
            "Script not found at path: {}",
            script_path.display()
        ));
    }

    let output = Command::new("bash")
        .arg(script_path)
        .output()
        .map_err(|err| format!("Failed to execute script ssh: {}", err))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(format!(
            "Script failed:\n{}",
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}

#[tauri::command]
pub fn start_condor_master() -> Result<String, String> {
    let script_path = std::env::current_dir()
        .unwrap()
        .join("src/scripts/start_condor_master.sh");

    println!("path: {}", script_path.display());

    if !script_path.exists() {
        return Err(format!(
            "Script not found at path: {}",
            script_path.display()
        ));
    }

    let output = Command::new("bash")
        .arg(script_path)
        .output()
        .map_err(|err| format!("Failed to execute script daemon: {}", err))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).to_string())
    } else {
        Err(format!(
            "Script failed:\n{}",
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}