import { createContext, useContext } from "react";
import { usePersistentState } from "../hooks/usePersistentState";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
	const [resourcesIPs, setResourcesIPs] = usePersistentState("resourcesIPs", []);
	const [resourcesUser, setResourcesUser] = usePersistentState("resourcesUser", "");
	const [containersPass, setContainersPass] = usePersistentState("containersPass", "pass123"); // temporals
	const [clusterState, setClusterState] = usePersistentState("clusterState", "inactive");
	const [LANname, setLANname] = usePersistentState("LANname", "");
	const [clusterNodesConfig, setClusterNodesConfig] =  usePersistentState("clusterNodesConfig", null);
	const [overlayNetworkName, setOverlayNetworkName] = usePersistentState("overlayNetworkName", "");
  const [sessionJobsSubmitted, setSessionJobsSubmitted] = usePersistentState("sessionJobsSubmitted", []);
  const [submitContainerName, setSubmitContainerName] = usePersistentState("submitContainerName", "");
  const [currentClusterId, setCurrentClusterId] = usePersistentState("currentClusterId", "");
  const [servers, setServers] = usePersistentState("servers", []);
  const [checkedServers, setCheckedServers] = usePersistentState("checkedServers", []);
  const [swarmToken, setSwarmToken] = usePersistentState("swarmToken", "");
  const [savedJobs, setSavedJobs] = usePersistentState("savedJobs", []);
  const [autoAssigned, setAutoAssigned] = usePersistentState("autoAssigned", false);
  const [sysDefineAll, setSysDefineAll] = usePersistentState("sysDefineAll", false);
  const [clusterActiveInfo, setClusterActiveInfo] = usePersistentState("clusterActiveInfo", {
    numberNodes: 0,
    createdAt: null,
    jobsTotal: 0,
    jobsRunning: 0,
    jobsHeld: 0,
    jobsWaiting: 0,
  })

	return (
		<AppContext.Provider
      value={{
        resourcesIPs, setResourcesIPs,
        resourcesUser, setResourcesUser,
        containersPass, setContainersPass,
        clusterState, setClusterState,
        LANname, setLANname,
        clusterNodesConfig, setClusterNodesConfig,
        overlayNetworkName, setOverlayNetworkName,
        sessionJobsSubmitted, setSessionJobsSubmitted,
        submitContainerName, setSubmitContainerName,
        currentClusterId, setCurrentClusterId,
        clusterActiveInfo, setClusterActiveInfo,
        servers, setServers,
        checkedServers, setCheckedServers,
        swarmToken, setSwarmToken,
        savedJobs, setSavedJobs,
        autoAssigned, setAutoAssigned,
        sysDefineAll, setSysDefineAll
        }}
      >
        { children }
		</AppContext.Provider>
	);
};

export const useAppContext = () => useContext(AppContext);