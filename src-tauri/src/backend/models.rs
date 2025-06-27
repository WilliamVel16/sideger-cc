use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize)]
pub struct MySSHRequest {
    pub host: String,
    pub username: String,
    pub command: String,
}

#[derive(Debug, Serialize)]
pub struct NodeInfo {
    pub hostname: String,
    pub os: String,
    pub ip: String,
    pub cpu_cores: u32,
    pub memory_gb: f32,
    pub disk_space_gb: f32,
}

#[derive(Debug, Deserialize)]
pub struct NodeRole {
    pub ip: String,
    pub role: String,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct ContainerConfig {
    pub ip: String,
    pub role: String,
    pub image: String,
    pub container_name: String,
    pub onetwork_name: String,
    pub hostname: String,
    pub user: String,
}

#[derive(Serialize)]
pub struct ScanResourcesResult {
    pub ips: Vec<String>,
}

#[derive(Serialize)]
pub struct SSHConnectionResult {
    pub ip: String,
    pub success: bool,
    pub message: String,
}

#[derive(Serialize)]
pub struct ClusterNodeResult {
    pub message: String,
    pub config: ContainerConfig,
}

#[derive(Serialize)]
pub struct ShutdownNodeResult {
    pub free: bool,
    pub message: String,
}