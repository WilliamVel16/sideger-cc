use serde::Deserialize;

#[derive(Debug, Deserialize)]
pub struct MySSHRequest {
    pub host: String,
    pub username: String,
    pub command: String,
}

#[derive(Debug, serde::Serialize)]
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

#[derive(Clone)]
pub struct ContainerConfig {
    pub ip: String,
    pub username: String,
    pub role: String,
    pub image: String,
    pub container_name: String,
    pub onetwork_name: String,
}