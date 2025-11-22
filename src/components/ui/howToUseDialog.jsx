import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function HowToUseDialog({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Cómo usar Sideger-CC</DialogTitle>

      <DialogContent dividers>
        <List>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="info" />
            </ListItemIcon>
            <ListItemText
              primary="1. Escanear recursos en la red"
              secondary="En la pestaña 'Recursos', ejecuta el escaneo para detectar los equipos disponibles en la sala de cómputo."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="info" />
            </ListItemIcon>
            <ListItemText
              primary="2. Seleccionar recursos y desplegar el clúster"
              secondary="Ve a la sección 'Desplegar', elige los equipos detectados y configura los roles para iniciar un clúster HTCondor."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="info" />
            </ListItemIcon>
            <ListItemText
              primary="3. Enviar trabajos de cómputo"
              secondary="Cuando el clúster esté activo (visible en la barra superior), usa 'Nuevo trabajo' para enviar ejecutables o scripts a HTCondor."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="info" />
            </ListItemIcon>
            <ListItemText
              primary="4. Monitorear el estado de los trabajos"
              secondary="'Estado de trabajos' permite ver el progreso en cola de cada ejecución enviada al clúster."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="info" />
            </ListItemIcon>
            <ListItemText
              primary="5. Revisar resultados de trabajos finalizados"
              secondary="En 'Finalizados' puedes visualizar las salidas generadas por HTCondor y descargarlas o guardarlas
              en la base de datossi lo deseas."
            />
          </ListItem>

          <ListItem>
            <ListItemIcon>
              <CheckCircleIcon color="info" />
            </ListItemIcon>
            <ListItemText
              primary="6. Consultar clusters anteriores"
              secondary="'Clusters anteriores' muestra despliegues previos, junto a los trabajos y resultados que hayas guardado manualmente."
            />
          </ListItem>

        </List>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
