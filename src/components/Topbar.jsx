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
import { toast } from 'react-toastify'
import Swal from 'sweetalert2';

function Topbar() {
  const { logout } = useAuth();
  const { clusterState, setClusterState, setClusterNodesConfig, setSubmitContainerName,
    setOverlayNetworkName, setResourcesIPs, clusterNodesConfig, currentClusterId,
    setSessionJobsSubmitted
  } = useAppContext();
  const [anchorMenu, setAnchorMenu] = useState(null);
  const [anchorNotif, setAnchorNotif] = useState(null);
  const [lastNotification, setLastNotification] = useState("Notificación de prueba");
  const [showNotifText, setShowNotifText] = useState(true);
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
      showClusterActiveWarning(action);
      return false;
    }
    return true; 
  };

  // manage close session
  const handleSessionClose = async () => {
    if (!checkClusterBeforeExit("logout")) return;

    const result = await Swal.fire({
      title: "¿Cerrar sesión?",
      text: "Perderás el acceso actual a la aplicación.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar acción",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      try {
        await logout();
        toast.success("Sesión cerrada correctamente");
      } catch {
        toast.error("Error al cerrar sesión");
        // useAuth manages errors
      }
    }
  }

  // close app
  const handleAppExit = async () => {
    if (!checkClusterBeforeExit("exit")) return;

    const result = await Swal.fire({
      title: "¿Salir de la aplicación?",
      text: "Se cerrará completamente la aplicación.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, salir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      await exit(0);
    }
  };

  // sends as arguments: nodes, onetName, and user
  const handleShutdownCluster = async () => {
    const result = await Swal.fire({
      title: "¿Dar de baja el clúster?",
      text: "Se cerrarán todos los nodos y recursos asociados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, dar de baja",
      cancelButtonText: "Cancelar acción",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });
    if (!result.isConfirmed) return;

    try {
      const response = await shutdownCluster(clusterNodesConfig, currentClusterId);
      console.log("RESPONSE SHUTDOWN", response)
      setClusterState("inactive")
      setClusterNodesConfig(null)
      setSubmitContainerName("")
      setOverlayNetworkName("")
      setSessionJobsSubmitted([])
      setResourcesIPs([])
      toast.success("Clúster dado de baja correctamente");
    } catch (err) {
      console.log("Error to try kill the cluster:", err);
      toast.error(`Error al intentar dar de baja el clúster: "${err}"`);
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
        return "Clúster activo";
      case "inactive":
        return "Clúster inactivo";
      case "warning":
        return "Clúster en alerta";
      default:
        return "En construcción";
    }
  };

  // Warning to show when user is trying shutdown the cluster or close session
  const showClusterActiveWarning = (action) => {
  const msg =
    action === "logout"
      ? "No puedes cerrar sesión mientras el clúster está activo."
      : "No puedes cerrar la aplicación mientras el clúster está activo.";

  Swal.fire({
    icon: "warning",
    title: "Acción no permitida",
    text: `${msg} Por favor, da de baja el clúster antes de continuar.`,
    confirmButtonText: "Entendido",
    confirmButtonColor: "#3085d6",
  });
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
    </div>
  );
}

export default Topbar;
