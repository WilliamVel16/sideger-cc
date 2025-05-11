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
/// 
/// 
/// # Example
///
/// ```
/// 
/// ```
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

/// this function permits running the container s that are simulating the
/// real servers, this bacause temporally we are using Docker containers.
/// 
/// # Example
///
/// ```
/// run servers with roles Central Manager, Submit and Execute
/// ```
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


/// this function permits get the software and hardware characteristics
/// from the available servers that could be used in the cluster
/// 
/// # Example
///
/// ```
///  Show info as: OS, DISK, RAM, CPU, GPU, HOSTNAME
/// ```
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
        //println!("data: {}", stdout);
        serde_json::from_str::<Value>(&stdout)
            .map_err(|err| format!("Invalid JSON output: {}\nOriginal output:\n{}", err, stdout))
    } else {
        Err(format!(
            "Script failed:\n{}",
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}

/// this function sets the roles of every node in the pool before
/// to start the pool.
/// 
/// # Example
///
/// ```
/// asigns a submit role, a manager role and one or more execute roles
/// to the servers 
/// ```
#[tauri::command]
pub fn assign_roles(nodes: Vec<NodeRole>) -> Result<String, String> {
    if nodes.is_empty() {
        return Err("No se enviaron nodos".into());
    }
    for node in nodes {
        println!("Assigning {} as {}", node.ip, node.role);
        if node.role.is_empty() {
            return Err(format!("El nodo {} no tiene rol asignado", node.ip));
        }
    }
    Ok("Roles asignados correctamente.".into())
}

/// this function permits to start htcondor pool, running the base
/// daemon on every node that coulb be used in the cluster
/// 
/// # Example
///
/// ```
/// execute the command: condor_master 
/// ```
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
