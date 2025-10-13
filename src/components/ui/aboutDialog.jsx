// src/components/AboutDialog.jsx
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from "@mui/material";

export default function AboutDialog({ open, onClose }) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Sobre Sideger</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body1" paragraph>
          <strong>Sideger</strong> es una plataforma que permite desplegar y
          administrar clústers de cómputo HTCondor sobre los recursos
          disponibles en una sala de cómputo.
        </Typography>
        <Typography variant="body1" paragraph>
          A través de una interfaz
          sencilla e intuitiva, Sideger automatiza la detección de máquinas,
          la configuración de la infraestructura y la gestión de trabajos
          computacionales, optimizando así el uso de recursos para tareas de
          alta capacidad de procesamiento (HTC).
        </Typography>
        <Typography variant="body1">
          Su objetivo es facilitar a estudiantes, docentes e investigadores el
          acceso a potencia de cómputo distribuida sin necesidad de
          configuraciones complejas.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
}
