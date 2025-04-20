use axum::{Router, extract::Json, routing::post};
use openssh::{KnownHosts, SessionBuilder};
use serde::Deserialize;
use std::{env, net::SocketAddr};
use tokio::net::TcpListener;
use dotenv::dotenv;

#[derive(Deserialize)]
struct SSHRequest {
    host: String,
    username: String,
    command: String,
}

async fn run_ssh(Json(req): Json<SSHRequest>) -> Result<String, String> {
    dotenv().ok();

    let ssh_url = format!("{}@{}", req.username, req.host);
    let key_path = env::var("SSH_KEY").expect("SSH_KEY env var not set");
    //println!("path ssh: {}", &key_path);

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
        Err(err) => Err(format!("didn't can connect by SSH to: {}: {}", req.host, err)),
    }        
}

pub async fn connection_ssh() {
    let app = Router::new().route("/ssh", post(run_ssh));
    let addr = SocketAddr::from(([127, 0, 0, 1], 3000));
    let listener = TcpListener::bind(addr).await.unwrap();
    println!("Server running at {}", addr);
    axum::serve(listener, app.into_make_service())
        .await
        .unwrap();
}