use axum::{Router, extract::Json, routing::post};
use openssh::{KnownHosts, SessionBuilder};
use serde::Deserialize;
use std::{env, net::SocketAddr};
use tokio::net::TcpListener;
use dotenv::dotenv;

//#[derive(Deserialize)]
#[derive(Debug, Deserialize)]
pub struct MySSHRequest {
    host: String,
    username: String,
    command: String,
}

#[tauri::command]
pub async fn execute_ssh(req: MySSHRequest) -> Result<String, String> {
    dotenv().ok();
    println!("back receives: {}", req.command);
    let ssh_url = format!("{}@{}", req.username, req.host);
    let key_path = std::env::var("SSH_KEY").expect("SSH_KEY env var not set");

    let session = SessionBuilder::default()
        .known_hosts_check(KnownHosts::Accept)
        .keyfile(&key_path)
        .connect(&ssh_url)
        .await;

    match session {
        Ok(session) => {
            match session.command(&req.command).output().await {
                Ok(output) => Ok(String::from_utf8_lossy(&output.stdout).to_string()),
                Err(err) => Err(format!("Error running command: {}", err)),
            }
        }
        Err(err) => Err(format!("Couldn't connect via SSH to {}: {}", req.host, err)),
    }
}