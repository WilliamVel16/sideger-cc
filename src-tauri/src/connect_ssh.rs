use dotenv::dotenv;
use openssh::{KnownHosts, SessionBuilder};
use serde::Deserialize;
use serde_json::Value;
use std::process::Command;

//#[derive(Deserialize)]
#[derive(Debug, Deserialize)]
pub struct MySSHRequest {
    host: String,
    username: String,
    command: String,
}

#[derive(Debug, serde::Serialize)]
pub struct NodeInfo {
    hostname: String,
    os: String,
    ip: String,
    cpu_cores: u32,
    memory_gb: f32,
    disk_space_gb: f32,
}

#[derive(Debug, Deserialize)]
pub struct NodeRole {
    ip: String,
    role: String,
}

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
pub fn show_resources_specs() -> Result<Value, String> {
    let script_path = std::env::current_dir()
        .unwrap()
        .join("src/scripts/get_resources_info.sh");

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
        .map_err(|err| format!("Failed to execute script show rescs: {}", err))?;

    if output.status.success() {
        let stdout = String::from_utf8_lossy(&output.stdout);
        serde_json::from_str::<Value>(&stdout)
            .map_err(|err| format!("Invalid JSON output: {}\nOriginal output:\n{}", err, stdout))
    } else {
        Err(format!(
            "Script failed:\n{}",
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}

#[tauri::command]
pub fn assign_roles(nodes: Vec<NodeRole>) -> Result<String, String> {
    for node in nodes {
        // usar SSH para escribirlo remotamente
        println!("Assigning {} as {}", node.ip, node.role);
        // invocar scripts según el rol
    }
    Ok("Roles assigned successfully.".into())
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
