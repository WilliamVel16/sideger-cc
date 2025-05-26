use std::process::{Command};
use serde_json::Value;

/// this function permits get the software and hardware characteristics
/// from the available servers that could be used in the cluster
/// 
/// # Example
/// ```
///  Show info as: OS, DISK, RAM, CPU, GPU, HOSTNAME
/// ```
#[tauri::command]
pub fn show_resources_specs() -> Result<Value, String> {
    let script_path = std::env::current_dir()
        .unwrap()
        .join("src/scripts/utils/get_resources_info.sh");

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

/// initialize the docker swarm manager inside the node which
/// will be running central manager (htcondor) container
/// receives the local node data (ip, user) to connect by ssh
#[tauri::command]
pub fn init_swarm_manager(manager_ip: &str, user: &str) -> Result<String, String> {
    let ssh_auth = format!("{}@{}", user, manager_ip);
    let command = format!("docker swarm init --advertise-addr {}", manager_ip);

    let output = Command::new("ssh")
        .args([&ssh_auth, &command])
        .output()
        .map_err(|err| format!("SSH failed: {}", err))?;

    if output.status.success() {
        let out = String::from_utf8_lossy(&output.stdout).to_string();
        println!("out swarm: {}", out);
        Ok(out)
    } else {
        Err(format!("Failed in {} to init swarm: {}", &manager_ip, String::from_utf8_lossy(&output.stderr)))
    }
}

/// gets the token to the workers
/// this is execute on node that has the swarm manager
#[tauri::command]
pub fn get_worker_token(manager_ip: &str, user: &str) -> Result<String, String> {
    let ssh_auth = format!("{}@{}", user, manager_ip);
    let command = "docker swarm join-token -q worker";

    let output = Command::new("ssh")
        .args([&ssh_auth, command])
        .output()
        .map_err(|err| format!("Failed to get worker token: {}", err))?;

    if output.status.success() {
        let token = String::from_utf8_lossy(&output.stdout).trim().to_string();
        println!("token swarm: {}", token);
        Ok(token)
    } else {
        Err(format!(
            "Error obtaining worker token from {}: {}",
            manager_ip,
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}

/// join nodes to swarm as workers
/// this is execute on others nodes that will be workers
#[tauri::command]
pub fn join_as_worker(worker_ip: &str, user: &str, token: &str, manager_ip: &str) -> Result<String, String> {
    let ssh_auth = format!("{}@{}", user, manager_ip);
    let command = format!(
        "docker swarm join --token {} {}:2377",
        token, manager_ip
    );

    let output = Command::new("ssh")
        .args([&ssh_auth, &command])
        .output()
        .map_err(|err| format!("SSH failed: {}", err))?;

    if output.status.success() {
        Ok(format!("{} joined as worker", worker_ip))
    } else {
        Err(format!(
            "Failed to join worker {}: {}",
            worker_ip,
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}

/// creates the overlay network
/// manager must be active and nodes join
#[tauri::command]
pub fn create_overlay_network(manager_ip: &str, user: &str, onet_name: &str) -> Result<String, String> {
    let ssh_auth = format!("{}@{}", user, manager_ip);
    let command = format!(
        "docker network create -d overlay --attachable {}",
        onet_name
    );

    let output = Command::new("ssh")
        .args([&ssh_auth, &command])
        .output()
        .map_err(|err| format!("SSH failed: {}", err))?;

    if output.status.success() {
        Ok(format!("Overlay network {} created from {}.", onet_name, manager_ip))
    } else {
        Err(format!(
            "Failed to create overlay network on {}: {}",
            manager_ip,
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}
