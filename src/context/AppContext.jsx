import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
	const [resourcesIPs, setResourcesIPs] = useState([])
	const [resourcesUser, setResourcesUser] = useState("usuario");
	const [containersPass, setContainersPass] = useState("pass123"); // temporals
	const [clusterState, setClusterState] = useState("inactive");
	const [LANname, setLANname] = useState("");
	const [clusterNodesConfig, setClusterNodesConfig] = useState();
	const [overlayNetworkName, setOverlayNetworkName] = useState("sidegerOnet");

	return (
		<AppContext.Provider value={{
			resourcesIPs, setResourcesIPs,
			resourcesUser, setResourcesUser,
			containersPass, setContainersPass,
			clusterState, setClusterState,
			LANname, setLANname,
			clusterNodesConfig, setClusterNodesConfig,
			overlayNetworkName, setOverlayNetworkName
			}}>
			{ children }
		</AppContext.Provider>
	)
}

export const useAppContext = () => useContext(AppContext);