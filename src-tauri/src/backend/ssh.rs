use openssh::{KnownHosts, SessionBuilder};
use crate::backend::models::MySSHRequest;
use std::process::Command;
use dotenv::dotenv;

/// this function starts the SSH conenection con every available resource
/// in the local network
/// 
/// # Example
///
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