import { useState, useEffect, useContext } from "react";
import { IconButton, Menu, MenuItem, Tooltip, Snackbar, Alert } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useAppContext } from "../context/AppContext";
import { shutdownCluster } from "../utils/tauriApi";
import { exit } from "@tauri-apps/plugin-process";
import useAuth from "../hooks/useAuth";

function Topbar() {
  const { logout } = useAuth();
  const { clusterState, setClusterState, clusterNodesConfig, currentClusterId } = useAppContext();
  const [anchorMenu, setAnchorMenu] = useState(null);
  const [anchorNotif, setAnchorNotif] = useState(null);
  const [lastNotification, setLastNotification] = useState("Notificación de prueba");
  const [showNotifText, setShowNotifText] = useState(true);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [showClusterWarning, setShowClusterWarning] = useState(false);

  const [notifications] = useState([
    "Cluster iniciado correctamente.",
    "Nuevo trabajo en cola",
    "3 trabajos finalizados."
  ]);

  useEffect(() => {
    const timer = setTimeout(() => setShowNotifText(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleMenuClick = (event) => setAnchorMenu(event.currentTarget);
  const handleNotifClick = (event) => setAnchorNotif(event.currentTarget);

  // verify if cluster is in state "active" to avoid close the app
  // user must be deactivate the cluster (shutdown)
  const checkClusterBeforeExit = (action) => {
    if (clusterState === "active") {
    const msg =
      action === "logout"
        ? "No puedes cerrar sesión mientras el clúster está activo."
        : "No puedes cerrar la aplicación mientras el clúster está activo.";

    setSnackbarMessage(`${msg} Por favor, da de baja el clúster antes de continuar.`);
    setShowClusterWarning(true);
    return false;
  }
  return true; 
  };

  // manage close session
  const handleSessionClose = async () => {
    if (!checkClusterBeforeExit("logout")) return;
    try {
      await logout();
    } catch (_) {
      //useAuth manages errors
    }
  }

  // close app
  const handleAppExit = async () => {
    if (!checkClusterBeforeExit("exit")) return;
    await exit(0)
  };

  const handleShutdownCluster = async () => {
    // sends as arguments: nodes, onetName, and user
    try {
      console.log("SHUTDOWN CLUSTER SENDS", clusterNodesConfig, currentClusterId);
      const response = await shutdownCluster(clusterNodesConfig, currentClusterId);
      console.log("RESPONSE SHUTDOWN", response)
      setClusterState("inactive")
    } catch (err) {
      console.log("Error to try kill the cluster:", err);
    }
  }

  // functions to show system state
  const getClusterStateColor = () => {
    switch(clusterState) {
      case "active":
        return "green";
      case "inactive":
        return "red";
      case "warning":
        return "orange";
      default:
        return "gray";
    }
  };
  const getClusterStateText = () => {
    switch(clusterState) {
      case "active":
        return "Cluster activo";
      case "inactive":
        return "Cluster inactivo";
      case "warning":
        return "Cluster en alerta";
      default:
        return "En construcción";
    }
  };

  return (
    <div className="topbar">
      {/* system state */}
      <Tooltip title="Estado del Cluster">
        <div className="system-status" >
          <FiberManualRecordIcon style={{ color: getClusterStateColor(), backgroundColor: 'white', fontSize: '1.5rem', borderRadius: '5px'}} />
          <span className="system-status-text">{getClusterStateText()}</span>
        </div>
      </Tooltip>

      {/* center */}
      <div style={{ flexGrow: 1 }} />

      {/* last notifiaction field */}
      {showNotifText && (
        <div className="last-notif">
          <span>{lastNotification}</span>
          <IconButton
            className="topbar-icon"
            size="small"
            onClick={() => setShowNotifText(false)}
            style={{ marginLeft: 8, color: 'white' }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </div>
      )}

      {/* notifications */}
      <Tooltip title="Notificaciones">
        <IconButton className="topbar-icon" color="inherit" onClick={handleNotifClick} >
          <NotificationsIcon />
        </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorNotif} open={Boolean(anchorNotif)} onClose={() => setAnchorNotif(null)}>
        {notifications.map((note, index) => (
          <MenuItem key={index}>{note}</MenuItem>
        ))}
      </Menu>

      {/* burguer menu */}
      <Tooltip title="Menú">
        <IconButton className="topbar-icon" color="inherit" onClick={handleMenuClick}>
        <MenuIcon />
      </IconButton>
      </Tooltip>
      <Menu anchorEl={anchorMenu} open={Boolean(anchorMenu)} onClose={() => setAnchorMenu(null)}>
        <MenuItem onClick={handleSessionClose}>Cerrar Sesión</MenuItem>
        <MenuItem onClick={handleShutdownCluster}>Dar de Baja</MenuItem>
        <MenuItem onClick={handleAppExit}>Salir</MenuItem>
      </Menu>

      {/* Snackbar warning */}
      <Snackbar
        open={showClusterWarning}
        autoHideDuration={5000}
        onClose={() => setShowClusterWarning(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setShowClusterWarning(false)}
          severity="warning"
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default Topbar;
