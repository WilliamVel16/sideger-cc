
use crate::backend::models::NodeRole;
use std::process::Command;
use super::models::ContainerConfig;

/// permits create a container with its respective configuration
impl ContainerConfig {
    pub fn new(ip: &str, role: &str, onetwork_name: &str) -> Result<Self, String> {
        let image = match role {
            "cm" => "wvel/sideger-cm:1.0.2",
            "sub" => "wvel/sideger-sub:1.0.2",
            "exe" => "wvel/sideger-exe:1.0.2",
            _ => return Err(format!("Unknown role: {}", role)),
        };

        let cont_name = format!("{}_{}", role, ip.replace(".", "_"));

        Ok(ContainerConfig { 
            ip: ip.to_string(),
            username: "user".to_string(), // current container user
            role: role.to_string(),
            image: image.to_string(),
            container_name: cont_name,
            onetwork_name: onetwork_name.to_string(),
        })
    }
}

/// this function permits running the container s that are simulating the
/// real servers, this bacause temporally we are using Docker containers.
/// 
/// # Example
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
/// to start the pool using as input every node ip and its role.
/// Uses images from dockerhub to run the containers with one of
/// the following roles: central manager, submit or execute
/// 
/// # Example
/// ```
/// input: "172.19.0.6", "cm"
/// process: runs into node with ip 172.19.0.6 a container with role
///          cm of htcondor.
/// output: node name using nomenclature cm_172_19_0_6
/// ```
pub fn run_single_node(config: &ContainerConfig) -> Result<String, String> {
    let ssh_auth = format!("{}@{}", config.username, config.ip);
    let command = format!(
        "docker run -d --rm --name {} --net {} {}",
        config.container_name, config.onetwork_name, config.image //THIS METHOD IS PENDING (NET)
    );

    let output = Command::new("ssh")
        .args([
            &ssh_auth,
            &command,
        ])
        .output()
        .map_err(|err| format!("SSH failed: {}", err))?;

    if output.status.success() {
        Ok(format!("Container {} launched on {} successfully with role {}", config.container_name, config.ip, config.role))
    } else {
        Err(format!(
            "Failed on {}: {}",
            config.ip,
            String::from_utf8_lossy(&output.stderr)
        ))
    }
}

/// this function uses the function run_single_node to iterate in every node
/// of the array received from the request
/// 
/// # Example
/// ```
/// sends the ip and rol of one node to run_single_node function to run
/// the containers on an atomic form
/// ```
#[tauri::command]
pub fn assign_roles(nodes: Vec<NodeRole>, onetwork_name: String) -> Result<String, String> {
    if nodes.is_empty() {
        return Err("Request without nodes, empty request".into());
    }

    let mut results = Vec::new();

    for node in nodes {
        if node.role.is_empty() {
            return Err(format!("The node {} has no role assigned", node.ip));
        }

        println!("Assigning {} as {}", node.ip, node.role);
        let config = ContainerConfig::new(&node.ip, &node.role, &onetwork_name)?;
        match run_single_node(&config) {
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