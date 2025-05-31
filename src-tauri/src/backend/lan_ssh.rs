use openssh::{KnownHosts, SessionBuilder};
use crate::backend::models::MySSHRequest;
use std::process::Command;
use dotenv::dotenv;
use std::os::unix::fs::PermissionsExt;
use std::path::Path;
use std::fs;

/// allows to give permissions to run scripts to configure the 
/// network and prepare the resources founded on the LAN, iterates
/// for every .sh file inside the directory to give execution permission
/// 
/// # Example
/// ```
/// allows the app to run a script to scan the LAN
/// ```
#[tauri::command]
pub fn script_permissions() -> Result<String, String> {
    let scripts_dir = Path::new("../local-scripts");

    if !scripts_dir.exists() {
        return Err("The directory doesn't exists".to_string());
    }

    println!("path: {}", scripts_dir.display());

    for file in fs::read_dir(scripts_dir).map_err(|e| e.to_string())? {
        let file = file.map_err(|e| e.to_string())?;
        let path = file.path();

        if path.extension().and_then(|s| s.to_str()) == Some("sh") {
            let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
            let mut permissions = metadata.permissions();

            permissions.set_mode(0o755); // chmod 755 -> rwxr-xr-x 
            fs::set_permissions(&path, permissions).map_err(|e| e.to_string())?;
        }
    }

    Ok("Permissions correctly assigned".to_string())
}


/// this function starts the SSH conenection con every available resource
/// in the local network
/// 
/// # Example
/// ```
/// copy the public keys from the server where sideger is being use inside
/// of the other available servers of the network
/// ```
#[tauri::command]
pub fn start_ssh_connection(node_ip: String, user: String, pass: String) -> Result<String, String> {
    let ssh_auth = format!("{}@{}", user, node_ip);
    let script_path = std::env::current_dir()
        .unwrap()
        .join("src/scripts/utils/ssh_connection.sh");

    println!("path: {}", script_path.display());

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


/// it's temporal and only executes a command in the remote machine
#[tauri::command]
pub async fn execute_command(req: MySSHRequest) -> Result<String, String> {
    dotenv().ok();
    println!("back receives: {}", req.command);
    let ssh_url = format!("{}@{}", req.username, req.host);

    let session = SessionBuilder::default()
        .known_hosts_check(KnownHosts::Accept)
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