import { createContext, useContext, useState } from "react";

const AppContext = createContext();

export const AppProvider = ({ children }) => {
	const [resourcesIPs, setResourcesIPs] = useState([])
	const [user, setUser] = useState("usuario");
	const [pass, setPass] = useState('');

	return (
		<AppContext.Provider value={{ resourcesIPs, setResourcesIPs, user, setUser, pass, setPass }}>
			{ children }
		</AppContext.Provider>
	)
}

export const useAppContext = () => useContext(AppContext);