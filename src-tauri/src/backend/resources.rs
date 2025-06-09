use super::{containers, models::ContainerConfig};
use crate::backend::models::NodeRole;
use containers::{run_single_node};
use std::{collections::HashMap, process::Command};
use serde_json::Value;
use std::path::Path;

/// this function permits get the software and hardware characteristics
/// from the available servers that could be used in the cluster. executes
/// a script in every resource using ssh to get its specifications
/// 
/// # Example
/// ```
///  Show info as: OS, DISK, RAM, CPU, GPU, HOSTNAME
/// ```
#[tauri::command]
pub fn show_resources_specs(ips_resources: Vec<String>, user: String) -> Result<Value, String> {
    let script_path = Path::new("src/scripts/utils/resources_info.sh");

    if !script_path.exists() {
        return Err(format!("Script not found at path: {}", script_path.display()));
    }

    let mut all_resources_info = Vec::new();
    for ip in ips_resources.iter() {
        let output = Command::new("ssh")
            .arg(format!("{}@{}", user, ip))
            .arg("bash -s")
            .stdin(
                std::fs::File::open(&script_path)
                    .map_err(|e| format!("Error opening script: {}", e))?,
            )
            .output()
            .map_err(|err| format!("Failed to execute script show resorces specs: {}", err))?;
            
        if !output.status.success() {
            return Err(format!(
                "SSH to {} failed: {}",
                ip,
                String::from_utf8_lossy(&output.stderr)
            ));
        }

        let stdout = String::from_utf8_lossy(&output.stdout);
        let info: serde_json::Value = serde_json::from_str(&stdout)
            .map_err(|e| format!("Invalid JSON from {}: {}\nOutput: {}", ip, e, stdout))?;
        all_resources_info.push(info);
    }

    Ok(serde_json::Value::Array(all_resources_info))
}


/// this function joins all the functions (under of this) that permits the initialization
/// of the overlay network and then the cluster: init_swarm_manager, get_worker_token,
/// join_as_worker
#[tauri::command]
pub fn initialize_cluster(nodes: Vec<NodeRole>, user: String, onet_name: String,) -> Result<String, String> {
    if nodes.is_empty() {
        return Err("No nodes provided".into());
    }

    // step 1: find the node with CM rol
    let Some(cm_node) = nodes.iter().find(|n| n.role == "cm") else {
        return Err("No node with role 'cm' found.".into());
    };
    println!("[1] Initializing swarm manager: {}", cm_node.ip);
    init_swarm_manager(&cm_node.ip, &user)?;

    // step 2: get the token to connect workers to swarm manager
    let token =  get_worker_token(&cm_node.ip, &user)?;

    // step 3: join all the workers(submit or execute from condor) to swarm
    for node in &nodes {
        if node.ip != cm_node.ip {
            println!("[3] {} joins to swarm as worker", node.ip);
            join_as_worker(&node.ip, &user, &token, &cm_node.ip)?;
        }
    }

    // step 4: create overlay network From manager (o cm for htcondor)
    println!("[4] creating overlay network: {}", onet_name);
    create_overlay_network(&cm_node.ip, &user, &onet_name)?;

    // step 5: run containers with its roles in every node choiced
    // and run base daemon of htcondor condor_master
    println!("[5] Deploying containers...");
    let mut results = Vec::new();
    let mut role_counts: HashMap<String, usize> = HashMap::new();
    for node in nodes {
        let count = role_counts.entry(node.role.clone()).or_insert(0);
        *count += 1;
        let hostname = format!("{}{}", node.role, *count);

        let config = ContainerConfig::new(&node.ip, &node.role, &onet_name, &hostname)?;
        run_single_node(&config)?;
        start_condor_master(&config)?; 
        results.push(format!("Container {} with role {} deployed and condor_master started.", config.container_name, config.role));
    }

    Ok(results.join("\n"))
}


/// initialize the docker swarm manager inside the node which
/// will be running central manager (htcondor) container
/// receives the local node data (ip, user) to connect by ssh
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

    // ES IMPORTANTE RECORDAR QUE AQUÍ SE DEBE OBETNER EL TOKEN PARA UNIR LOS DEMAS NODOS
    // SE PODRÍA USAR GREP PARA OBTENER EL TOKEN O COMO SERÍA?
}

///
/// 
pub fn get_worker_token(manager_ip: &str, user: &str) -> Result<String, String> {
    let ssh_auth = format!("{}@{}", user, manager_ip);
    let command = "docker swarm join-token worker -q";

    let output = Command::new("ssh")
        .args([&ssh_auth, command])
        .output()
        .map_err(|err| format!("SSH failed: {}", err))?;

    if output.status.success() {
        Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
    } else {
        Err(format!("Failed to get token from {}: {}", manager_ip, String::from_utf8_lossy(&output.stderr)))
    }
}

/// join nodes to swarm as workers
/// this is execute on others nodes that will be workers
pub fn join_as_worker(worker_ip: &str, user: &str, token: &str, manager_ip: &str) -> Result<String, String> {
    let ssh_auth = format!("{}@{}", user, worker_ip);
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
pub fn create_overlay_network(manager_ip: &str, user: &str, onet_name: &str) -> Result<String, String> {
    let ssh_auth = format!("{}@{}", user, manager_ip);
    let command = format!("docker network create -d overlay --attachable {}", onet_name);

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

///
/// 
/// 
pub fn start_condor_master(config: &ContainerConfig) -> Result<String, String> {
    let ssh_auth = format!("{}@{}", config.username, config.ip);
    let command = format!("docker exec {} condor_master", config.container_name);

    let output = Command::new("ssh")
        .args([&ssh_auth, &command])
        .output()
        .map_err(|err| format!("SSH failed to start condor_master: {}", err))?;

    if output.status.success() {
        Ok(format!("condor_master started on {}", config.container_name))
    } else {
        Err(format!("Failed to start condor_master on {}: {}", config.container_name, String::from_utf8_lossy(&output.stderr)))
    }
}