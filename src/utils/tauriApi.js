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
export const shutdownCluster = async (clusterNodesConfig, clusterId) => {
  const payload = {
    cluster_id: clusterId,
    nodes: clusterNodesConfig,
  };

	const response = await fetch(`${BACKEND_URL}/cluster/shutdown`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  
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

// to retrieve the jobs data in execution (includes state) [JobQueue.jsx]
export const jobsQueue = async (nodeSubmitRole, sessionJobsSubmitted) => {
  console.log("SESION JOBS ENBVIADOS AL BACK", JSON.stringify( { session_jobs: sessionJobsSubmitted}))
  const response = await fetch(
    `${BACKEND_URL}/jobs/data/queue?submit_container_name=${encodeURIComponent(nodeSubmitRole)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_jobs: sessionJobsSubmitted }),
    }
  );
  
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`get data and state jobs failed: ${err}`);
  }
  const data = await response.json();
  return data.jobs;
}

// to view the reesults of the runnings in the htcondor cluster [FinishedJobs.jsx]
export const jobsResults = async (sessionJobsSubmitted, submitContainerName) => {
  const response = await fetch(`${BACKEND_URL}/jobs/results?sub_container_name=${encodeURIComponent(submitContainerName)}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(sessionJobsSubmitted)
    }
  )

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`get jobs results failed: ${err}`);
  }
  const data = await response.json();
  return data.results;
}

// saves a submitted job in the app's database [FinishedJobs.jsx]
// WAY TOKEN TEMP
export const saveJob = async (jobDataToSave) => {
  console.log("SABE JOBS SENDS", jobDataToSave)
  const token = localStorage.getItem("access_token")
  if (!token) throw new Error("No authentication token found");

  const res = await fetch(`${BACKEND_URL}/user/save-job`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, 
    },
    body: JSON.stringify(jobDataToSave),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`save failed: ${txt}`);
  }
  return res.json();
};

// gets the information of a job [JobQueue.jsx]
export const getJobInformation = async (job_id) => {
  // here the logic to do the api request
}

// deletes a specific job from a batch [JobQueue.jsx]
export const removeSpecificJob = async (job_id, submit_container_name) => {
  console.log(job_id, submit_container_name)
  const token = localStorage.getItem("access_token")
  if (!token) throw new Error("No authentication token found");

  const res = await fetch(`${BACKEND_URL}/jobs/queue/remove-job`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ job_id, submit_container_name }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Error al eliminar trabajo: ${err}`);
  }

  return res.json();
}

// deletes all jobs from a batch [JobQueue.jsx]
export const removeBatch = async (batch_name, submit_container_name) => {
  const token = localStorage.getItem("access_token")
  if (!token) throw new Error("No authentication token found");

  const res = await fetch(`${BACKEND_URL}/queue/remove-batch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ batch_name, submit_container_name }),
  });
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  alert(data.message);
}


// ----------------------------- database ---------------------------------- //

// save cluster deploy information in the database [InitializeCluster.jsx]
export async function saveClusterInformation(clusterData) {
  const response = await fetch(`${BACKEND_URL}/cluster/save-cluster-data`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(clusterData),
    });
  if (!response.ok) throw new Error("Error trying to save the cluster");
  return await response.json();
}


// get the clusters deployed by the user [StoragedJobs.jsx]
export const getUserClusters = async() => {
  const token = localStorage.getItem("access_token")
  if (!token) throw new Error("No authentication token found");
  const response = await fetch(`${BACKEND_URL}/user/clusters/db`,
    {
      method: "GET",
      headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    });
  if (!response.ok) throw new Error("Error trying get the storaged cluster sessions");
  return await response.json();
}


// deletes a specific cluster from a user [StoragedJobs.jsx]
export const deleteCluster = async (id) => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BACKEND_URL}/user/cls/db/remove/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMsg = response.status === 404 ? "Cluster no encontrado" : "Error eliminando cluster";
    throw new Error(errorMsg);
  }
  return { message: "Cluster eliminado correctamente" };
};


// deletes a specific job from a cluster [StoragedJobs.jsx]
export const deleteJob = async (id) => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BACKEND_URL}/user/jbs/db/remove/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMsg = response.status === 404 ? "Trabajo no encontrado" : "Error eliminando trabajo";
    throw new Error(errorMsg);
  }
  return { message: "Trabajo eliminado correctamente" };
};


// deletes a specific result from a job [StoragedJobs.jsx]
export const deleteResult = async (id) => {
  const token = localStorage.getItem("access_token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${BACKEND_URL}/user/res/db/remove/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorMsg = response.status === 404 ? "Resultado no encontrado" : "Error eliminando resultado";
    throw new Error(errorMsg);
  }
  return { message: "Resultado eliminado correctamente" };
};