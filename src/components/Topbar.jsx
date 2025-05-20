import { useState, useEffect } from "react";
import { IconButton, Menu, MenuItem, Tooltip, Snackbar, Alert } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CloseIcon from "@mui/icons-material/Close";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

function Topbar() {
  const [anchorMenu, setAnchorMenu] = useState(null);
  const [anchorNotif, setAnchorNotif] = useState(null);
  const [lastNotification, setLastNotification] = useState("Notificación de prueba");
  const [showNotifText, setShowNotifText] = useState(true);
  const [notifications] = useState([
    "Cluster iniciado correctamente.",
    "Nuevo trabajo en cola",
    "3 trabajos finalizados."
  ]);
  const systemStatus = "";

  useEffect(() => {
    const timer = setTimeout(() => setShowNotifText(false), 6000);
    return () => clearTimeout(timer);
  }, []);

  const handleMenuClick = (event) => setAnchorMenu(event.currentTarget);
  const handleNotifClick = (event) => setAnchorNotif(event.currentTarget);
  const handleClose = () => {
    setAnchorMenu(null);
    setAnchorNotif(null);
  };

  // functions to show system state
  const getSystemStateColor = () => {
    switch(systemStatus) {
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
  const getSystemStateText = () => {
    switch(systemStatus) {
      case "active":
        return "Sistema activo";
      case "inactive":
        return "Sistema inactivo";
      case "warning":
        return "Sistema en alerta";
      default:
        return "Herramienta en construcción";
    }
  };

  return (
    <div className="topbar">
      {/* system state */}
      <Tooltip title="Estado del Cluster">
        <div className="system-status" >
          <FiberManualRecordIcon style={{ color: getSystemStateColor(), backgroundColor: 'white', fontSize: '1.5rem', borderRadius: '5px'}} />
          <span className="system-status-text">{getSystemStateText()}</span>
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
      <Menu anchorEl={anchorNotif} open={Boolean(anchorNotif)} onClose={handleClose}>
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
      <Menu anchorEl={anchorMenu} open={Boolean(anchorMenu)} onClose={handleClose}>
        <MenuItem onClick={handleClose}>Reiniciar</MenuItem>
        <MenuItem onClick={handleClose}>Dar de Baja</MenuItem>
        <MenuItem onClick={handleClose}>Salir</MenuItem>
      </Menu>

    </div>
  );
}

export default Topbar;
