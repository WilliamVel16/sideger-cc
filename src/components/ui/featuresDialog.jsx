import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText, } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function FeaturesDialog({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Lo que puedes hacer con Sideger-CC</DialogTitle>
      <DialogContent dividers>
        <List>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText primary="Detectar y gestionar recursos disponibles en la red de la sala de cómputo." />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText primary="Desplegar automáticamente un clúster de cómputo con HTCondor." />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText primary="Enviar y monitorear trabajos de cómputo distribuido." />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText primary="Visualizar métricas de ejecución y estado de nodos." />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText primary="Guardar resultados y mantener trazabilidad de los clústers desplegados." />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="success" />
            </ListItemIcon>
            <ListItemText primary="Gestionar autenticación y seguridad de acceso al sistema." />
          </ListItem>
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}