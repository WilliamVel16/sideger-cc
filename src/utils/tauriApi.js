import { invoke } from "@tauri-apps/api/core";

// to execute scripts with user permission [Resources.jsx]
export const scriptPermissions = async () => {
	return invoke("script_permissions")
}

// to obtain the IPs of the resources (up) by scanning the LAN [Resources.jsx]
export const scanLanResources = async (interfaceName, password) => {
	console.log("invocando scan_lan_resources con:", interfaceName, password);
	return invoke("scan_lan_resources", {
		interfaceLanName: interfaceName,
		pass: password,
	})
}

// to run container (one host) [Start.jsx]
export const runContainers = async () => {
	return invoke("run_containers");
};

// to start ssh connection [Start.jsx]
export const sshConnection = async () => {
	return invoke("start_ssh_connection");
};

// to execute command (temporal) [Command.jsx]
export const executeCommand = async (sshReq) => {
	return invoke("execute_command", {
		req: sshReq,
	});
};

// to start condor master (one host) [Start.jsx]
export const startCondorMaster = async () => {
	return invoke("start_condor_master");
};

// to get resources specifications [InitializeClster.jsx]
export const showResourcesSpecs = async () => {
	return invoke("show_resources_specs")
};

// to start cluster with selected nodes [InitializeClster.jsx]
export const initializeCluster = async (nodes, user, onetName) => {
	return invoke("initialize_cluster", {
		nodes,
		user,
		onetName,
	});
};