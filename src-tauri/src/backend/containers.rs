use crate::backend::models::NodeRole;
use std::process::Command;

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
        .join("src/scripts/htcondor/run_containers.sh");

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

/// this function sets the roles of every node in the pool before
/// to start the pool. Uses images from dockerhub to run servers
/// with roles: central manager, submit and execute
/// 
/// # Example
///
/// ```
/// asigns and run a submit role, a manager role and one or more execute
/// roles to the servers 
/// ```
pub fn run_single_node(ip: &str, role: &str) -> Result<String, String> {
    let image = match role {
        "cm" => "wvel/sideger-cm:1.0.2",
        "sub" => "wvel/sideger-sub:1.0.2",
        "exe" => "wvel/sideger-exe:1.0.2",
        _ => return Err(format!("Unknown role: {}", role)),
    };

    let container_name = format!("{}_{}", role.replace("-", ""), ip.replace(".", "_"));

    let output = Command::new("docker")
        .args([
            "run", "-d", "--rm",
            "--name", &container_name,
            "--net", "sidegernet", // THIS METOD IS PENDING
            image,
        ])
        .output()
        .map_err(|e| format!("Failed to run container: {}", e))?;

    if output.status.success() {
        Ok(format!("Container {} launched successfully", container_name))
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

/// this function uses the function run_single_node to iterate in every node
/// of the array received from the request
/// 
/// # Example
///
/// ```
/// sends the ip and rol of one node to run_single_node function to run
/// the containers on an atomic form
/// ```
#[tauri::command]
pub fn assign_roles(nodes: Vec<NodeRole>) -> Result<String, String> {
    if nodes.is_empty() {
        return Err("Request without nodes, empty request".into());
    }

    let mut results = Vec::new();

    for node in nodes {
        if node.role.is_empty() {
            return Err(format!("The node {} has no role assigned", node.ip));
        }

        println!("Assigning {} as {}", node.ip, node.role);
        match run_single_node(&node.ip, &node.role) {
            Ok(msg) => results.push(msg),
            Err(err) => return Err(format!("Failed to assign role to {}: {}", node.ip, err)),
        }
    }

    Ok(results.join("\n"))
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
        .join("src/scripts/htcondor/start_condor_master.sh");

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