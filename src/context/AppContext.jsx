import { createContext, useContext } from "react";
import { usePersistentState } from "../hooks/usePersistentSate";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
	const [resourcesIPs, setResourcesIPs] = usePersistentState("resourcesIPs", []);
	const [resourcesUser, setResourcesUser] = usePersistentState("resourcesUser", "usuario"); // temporals
	const [containersPass, setContainersPass] = usePersistentState("containersPass", "pass123"); // temporals
	const [clusterState, setClusterState] = usePersistentState("clusterState", "inactive");
	const [LANname, setLANname] = usePersistentState("LANname", "");
	const [clusterNodesConfig, setClusterNodesConfig] =  usePersistentState("clusterNodesConfig", null);
	const [overlayNetworkName, setOverlayNetworkName] = usePersistentState("overlayNetworkName", "sidegerOnet"); // temporals
  const [sessionJobsSubmitted, setSessionJobsSubmitted] = usePersistentState("sessionJobsSubmitted", [])

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
        sessionJobsSubmitted, setSessionJobsSubmitted
        }}
      >
        { children }
		</AppContext.Provider>
	);
};

export const useAppContext = () => useContext(AppContext);