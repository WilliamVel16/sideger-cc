use openssh::{KnownHosts, SessionBuilder};
use crate::backend::models::{MySSHRequest, SSHConnectionResult, ScanResourcesResult};
use std::process::Command;
use dotenv::dotenv;
use get_if_addrs::get_if_addrs;
use std::os::unix::fs::PermissionsExt;
use std::path::Path;
use std::fs;
use std::net::{IpAddr};
use pnet_datalink::{self, NetworkInterface};

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

/// this function allows scan the network interfaces
/// 
#[tauri::command]
pub fn scan_interfaces() -> Result<Vec<String>, String> {
    match get_if_addrs() {
        Ok(interfaces) => {
            let names = interfaces.into_iter()
                .map(|iface| iface.name)
                .collect::<std::collections::HashSet<_>>()
                .into_iter()
                .collect::<Vec<_>>();
            Ok(names)
        },
        Err(err) => Err(format!("Error to obtain interfaces: {}", err))
    }
}

/// this function allows scan the allowed resources in the network
/// 
#[tauri::command]
pub fn scan_lan_resources(interface_lan_name: String, pass: String) -> Result<ScanResourcesResult, String> {
    let script_path = Path::new("../local-scripts/get_resources_up.sh");

    if !script_path.exists() {
        return Err("Script doesn't exists".to_string());
    }

    let output = Command::new(script_path)
        .arg(&interface_lan_name)
        .arg(&pass)
        .output()
        .map_err(|e| format!("Error executing script: {}", e))?;

    if output.status.success() {
        println!("out success");
        let stdout = String::from_utf8_lossy(&output.stdout);
        let ips: Vec<String> = stdout
            .lines()
            .map(|line| line.trim().to_string())
            .filter(|ip| !ip.is_empty())
            .collect();

        Ok(ScanResourcesResult { ips })
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).to_string();
        Err(format!("Script process error: {}", stderr))
    }
}

/// this function gets the local ip of the machine where user is using the 
/// Sideger app
/// 
#[tauri::command]
pub fn get_my_ip(interface_name: String) -> Result<String, String> {
    let interfaces = pnet_datalink::interfaces();
    println!("Interfaces encontradas:");
    for iface in &interfaces {
        println!(
            "- {} | MAC: {:?} | IPs: {:?}",
            iface.name,
            iface.mac,
            iface.ips
        );
    }
    
    let interface = interfaces
        .into_iter()
        .find(|iface: &NetworkInterface| iface.name == interface_name)
        .ok_or_else(|| format!("Interface {} not found", interface_name))?;

    for ip_network in interface.ips {
        if let IpAddr::V4(ipv4) = ip_network.ip() {
            return Ok(ipv4.to_string());
        }
    }

    Err("No IPv4 address found for the interface".into())
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
pub fn start_ssh_connection(nodes_ips: Vec<String>, user: String, pass: String) -> Result<Vec<SSHConnectionResult>, String> {
    let script_path = std::env::current_dir()
        .unwrap()
        .join("src/scripts/utils/ssh_connection.sh");

    println!("start ssh connection called");

    if !script_path.exists() {
        return Err(format!("Script not found in path: {}", script_path.display()));
    }

    let mut results = Vec::new();
    for ip in nodes_ips {
        let output = Command::new("bash")
            .arg(&script_path)
            .arg(&user)
            .arg(&pass)
            .arg(&ip)
            .output();

        match output {
            Ok(output) => {
                if output.status.success() {
                    println!("Success for IP {}:\n{}", ip, String::from_utf8_lossy(&output.stdout));
                    results.push(SSHConnectionResult {
                        ip,
                        success: true,
                        message: String::from_utf8_lossy(&output.stdout).to_string(),
                    });
                } else {
                     println!("Error for IP {}:\n{}", ip, String::from_utf8_lossy(&output.stderr));
                    results.push(SSHConnectionResult {
                        ip,
                        success: false,
                        message: String::from_utf8_lossy(&output.stderr).to_string(),
                    });
                }
            }
            Err(e) => {
                results.push(SSHConnectionResult {
                    ip,
                    success: false,
                    message: format!("Execution failed: {}", e),
                });
            }
        }
    }

    Ok(results)
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