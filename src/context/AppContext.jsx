import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
	const [resourcesIPs, setResourcesIPs] = useState([])
	const [user, setUser] = useState("usuario");
	const [pass, setPass] = useState("pass123"); // temporal
	const [clusterState, setClusterState] = useState("inactive");
	const [myIP, setMyIP] = useState("");

	return (
		<AppContext.Provider value={{
			resourcesIPs, setResourcesIPs,
			user, setUser,
			pass, setPass,
			clusterState, setClusterState,
			myIP, setMyIP,
			}}>
			{ children }
		</AppContext.Provider>
	)
}

export const useAppContext = () => useContext(AppContext);