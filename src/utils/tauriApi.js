import { invoke } from "@tauri-apps/api/core";

// to execute scripts with user permission
export const scriptPermissions = async (interfaceName, password) => {
	return invoke("script_permissions")
}

// to obtain the IPs of the resources (up) by scanning the LAN
export const scanLanResources = async (interfaceName, password) => {
	return invoke("scan_lan_resources")
}

// to run container (one host)
// is used in Start.jsx
export const runContainers = async () => {
	return invoke("run_containers");
};

// to start ssh connection
// is used in Start.jsx
export const sshConnection = async () => {
	return invoke("start_ssh_connection");
};

// to execute command (temporal)
// is used in Command.jsx
export const executeCommand = async (sshReq) => {
	return invoke("execute_command", {
		req: sshReq,
	});
};

// to start condor master (one host)
// is used in Start.jsx
export const startCondorMaster = async () => {
	return invoke("start_condor_master");
};

// to get resources specifications
// is used in Resources.jsx
export const showResourcesSpecs = async () => {
	return invoke("show_resources_specs")
};

// to start cluster with selected nodes
// is used in Resources.jsx
export const initializeCluster = async (nodes, user, onetName) => {
	return invoke("initialize_cluster", {
		nodes,
		user,
		onetName,
	});
};