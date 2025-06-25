import { invoke } from "@tauri-apps/api/core";

// to execute scripts with user permission [Resources.jsx]
export const scriptPermissions = async () => {
	return invoke("script_permissions")
}

// to obtain names of the network interfaces [Resources.jsx]
export const scanInterfaces = async () => {
	return invoke("scan_interfaces")
}

// to obtain the IPs of the resources (up) by scanning the LAN [Resources.jsx]
export const scanLanResources = async (interfaceName, localPassword) => {
	return invoke("scan_lan_resources", {
		interfaceLanName: interfaceName,
		pass: localPassword,
	})
}

// to get the ip of the resource which user is using Sideger [Resources.jsx]
export const getMyIp = async (interfaceName) => {
	return invoke("get_my_ip", {interfaceName });
}

// to set the ssh connection in the resources of LAN [Resources.jsx]
export const startSshConnection = async (user, remotePassword, resources_ips) => {
	return invoke("start_ssh_connection", {
		nodesIps: resources_ips,
		user: user,
		pass: remotePassword,
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
export const showResourcesSpecs = async (resourcesIPs, user) => {
	return invoke("show_resources_specs", {
		ipsResources: resourcesIPs,
		user: user,
	});
};

// to get specifications of this resource [InitializeClster.jsx]
export const showMySpecs = async (lanName) => {
	return invoke("show_my_specs", {
		lanName,
	});
};

// to start cluster with selected nodes [InitializeClster.jsx]
export const initializeCluster = async (nodes, user, onetName) => {
	return invoke("initialize_cluster", {
		nodes,
		user,
		onetName,
	});
};