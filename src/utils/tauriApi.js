const BACKEND_URL = "http://localhost:8000";

// to execute scripts with user permission [Resources.jsx]
export const scriptPermissions = async () => {
  const response = await fetch(`${BACKEND_URL}/lan-ssh/permissions`);

  if (!response.ok) throw new Error("Error to obtain permissions");
  return response.text();
};

// to obtain names of the network interfaces [Resources.jsx]
export const scanInterfaces = async () => {
  const response = await fetch(`${BACKEND_URL}/lan-ssh/interfaces`);

  if (!response.ok) {
	const errorData = await response.json();
    throw new Error(errorData.detail || "Unknown error getting interfaces");
  }
  return response.json();
}

// to obtain the IPs of the resources (up) by scanning the LAN [Resources.jsx]
export const scanLanResources = async (interfaceLanName, localPassword) => {
  console.log("OBLIGAR A ELEGIR LAN", interfaceLanName)
  const url = `${BACKEND_URL}/lan-ssh/scan-resources?interface_lan_name=${interfaceLanName}&local_password=${localPassword}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Unknown error scanning LAN resources");
  }
  return response.json(); // Devuelve un ScanResourcesResult: { ips: [...] }
};

// to get the ip of the resource which user is using Sideger [Resources.jsx]
export const getMyIp = async (interfaceLanName) => {
  const url = `${BACKEND_URL}/lan-ssh/my-ip?interface_lan_name=${interfaceLanName}`;
  const response = await fetch(url);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Unknown error getting the IP local (this pc)");
  }
  return response.json();
};

// to set the ssh connection in the resources of LAN [Resources.jsx]
export const startSshConnection = async (resourcesUser, resourcesPass, resourcesIps) => {
  console.log(resourcesIps, resourcesUser, resourcesPass)
	const response = await fetch(`${BACKEND_URL}/lan-ssh/connect`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			resources_ips: resourcesIps,
			resources_user: resourcesUser,
			resources_pass: resourcesPass,
		}),
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(`Error SSH connection: ${errorData.detail || response.statusText}`);
	}

	return response.json();
}

// to get resources specifications [InitializeCluster.jsx]
export const showResourcesSpecs = async (resourcesIPs, resourcesUser) => {
	const res = await fetch(`${BACKEND_URL}/resources/other-specs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      resources_ips: resourcesIPs,
      resources_user: resourcesUser
    })
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return res.json();
};

// to get specifications of this resource [InitializeCluster.jsx]
export const showMySpecs = async (interfaceLanName) => {
	const response = await fetch(`${BACKEND_URL}/resources/my-specs?interface_lan_name=${encodeURIComponent(interfaceLanName)}`, {
		method: "GET",
		headers: {
			"Content-Type": "application/json",
		}
	});

	if (!response.ok) {
		const errorData = await response.json();
		throw new Error(`Error fetching my specs: ${errorData.detail || response.statusText}`);
	}
	return response.json();
};

// to start cluster with selected nodes [InitializeCluster.jsx]
export const initializeCluster = async (nodes, resourcesUser, onetName) => {
	const res = await fetch(`${BACKEND_URL}/cluster/initialize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      nodes: nodes,
      resources_user: resourcesUser,
      onetwork_name: onetName
    })
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return await res.json();
};

// to kill the cluster [Topbar.jsx]
export const shutdownCluster = async (clusterNodesConfig) => {
  console.log(clusterNodesConfig)
	const response = await fetch(`${BACKEND_URL}/cluster/shutdown`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(clusterNodesConfig)
  });
  console.log(response)
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Shutdown failed: ${err}`);
  }
  return response.json();
};

// -------------------------- jobs -----------------------------

// to submit a new job to the cluster [NewJob.jsx]
export const submitJob = async (formData, nodeSubmitRole, outputType) => {
  const response = await fetch(`${BACKEND_URL}/jobs/submit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      job_data: formData,
      submit_role_container_name: nodeSubmitRole,
      output_type: outputType
    })
  });
  console.log(response)
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Submit new job failed: ${err}`);
  }
  return response.json();
};
