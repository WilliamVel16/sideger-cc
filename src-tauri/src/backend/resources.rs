use std::process::Command;
use serde_json::Value;

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
