import { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, Container,
  FormGroup, TextField, Button, Snackbar, Alert
} from '@mui/material';
import VerifiedIcon from '@mui/icons-material/Verified';
import { scriptPermissions, scanLanResources, startSshConnection, getLocalIp } from "../utils/tauriApi";
import { useAppContext } from '../context/AppContext';

function Permissions() {
  const { resourcesIPs, setResourcesIPs, user, setUser, pass, setPass } = useAppContext();
  const [interfaceLanName, setInterfaceLanName] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [successPermissions, setSuccessPermissions] = useState(false);
  const [errorPermissions, setErrorPermissions] = useState("");
  const [successScan, setSuccessScan] = useState(false);
  const [errorScan, setErrorScan] = useState("");
  const [numberResources, setNumberResources] = useState(0);
  const [localPass, setLocalPass] = useState("");

  // get the permissions to execute scripts to deploy the cluster
  const handleAccept = async () => {
    try {
      const result = await scriptPermissions();
      console.log("GOOD", result);
      setSuccessPermissions(true);
    } catch (err) {
      console.error("BAD", err);
      setErrorPermissions(err.message || "Unresolved error");
    } finally {
      setAccepted(true);
    }
  };

  // executes the resources scanning in the LAN
  const handleScanResources = async (localPass) => {
    try {
      const allDevicesFound = await scanLanResources(interfaceLanName, localPass);
      const thisResourceIp = await getLocalIp(interfaceLanName);
      console.log(thisResourceIp)
      const finalResources = allDevicesFound.ips.filter(ip => ip !== thisResourceIp && !ip.endsWith(".1"));
      console.log("Ressss:",finalResources);
      setResourcesIPs(finalResources);
      setNumberResources(finalResources.length)
      //setSuccessScan(true);
    } catch (err) {
      if (typeof err === "string") {
        console.error("no ok 1", err);
        setErrorScan(err);
      } else if (err && err.message) {
        console.error("no ok 2", err.message);
        setErrorScan(err.message);
      } else {
        console.error("no ok 3", "Unresolved error");
        setErrorScan("Unresolved error");
      }
    }
  }

  // executes ssh connection after resources scanning
  useEffect(() => {
    if (successScan && resourcesIPs.length > 0) {
      (async () => {
        try {
          const output = await startSshConnection(user, pass, resourcesIPs);
          console.log("results ssh connection:", output);
        } catch (err) {
          console.log("Error during ssh connection:", err);
        }
      })();
    }
  }, [successScan, resourcesIPs]);


  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/** permisos */}
        <Typography variant="h5" gutterBottom>
          Permitir ejecución de scripts
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Para proceder con el despliegue del clúster, se requiere que otorgues permisos para ejecutar scripts seguros
          en tu máquina. Esto es necesario para configurar correctamente la red y los servicios necesarios.
        </Typography>
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button variant="contained" color="black" onClick={handleAccept}>
            Dar permiso y continuar
          </Button>
        </Box>

        {accepted && successPermissions && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <VerifiedIcon color="success" sx={{ fontSize: 60 }} />
            <Typography variant="h6" color="success.main">
              Permisos concedidos correctamente
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Por favor continúa con el siguiente requerimiento
            </Typography>
          </Box>
        )}

        <Snackbar
          open={Boolean(errorPermissions)}
          autoHideDuration={6000}
          onClose={() => setErrorPermissions("")}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert onClose={() => setErrorPermissions("")} severity="error" sx={{ width: '100%' }}>
            {errorPermissions}
          </Alert>
        </Snackbar>

        {/** scan LAN */}
        <Typography variant="h5" gutterBottom marginTop={6}>
          Información sobre la red local (LAN)
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Para continuar con el procedimiento se requiere el nombre de la interfaz de la red local de la
          sala de cómputo e información sobre la infraestructura física, por favor ingresa el nombre y la 
          contraseña del usuario remoto, luego el nombre de la interfaz de la red LAN y la contraseña del
          usuario del pc que estás usando.
        </Typography>

        <Grid container direction="column" spacing={2} marginTop={3} alignItems={"center"}>
          <Grid item xs={12} md={6}>
            <TextField
              label="Nombre de usuario"
              variant="outlined"
              fullWidth
              size="small"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Contraseña de usuario remoto"
              variant="outlined"
              type="password"
              fullWidth
              size="small"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
            />
          </Grid>
           <Grid item xs={12} md={6}>
            <TextField
              label="Interfaz LAN"
              variant="outlined"
              fullWidth
              size="small"
              value={interfaceLanName}
              onChange={(e) => setInterfaceLanName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              label="Contraseña de usuario local"
              variant="outlined"
              type="password"
              fullWidth
              size="small"
              value={localPass}
              onChange={(e) => setLocalPass(e.target.value)}
            />
          </Grid>
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Button variant="contained" color="black" onClick={() => handleScanResources(localPass)}>
            Buscar Recursos
          </Button>
        </Box>

        {successScan && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <VerifiedIcon color="success" sx={{ fontSize: 60 }} />
            <Typography variant="h6" color="success.main">
              El sistema ha encontrado {numberResources} recursos disponibles en la red
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Ya puedes dirigirte a la sección "Desplegar"
            </Typography>
          </Box>
        )}

        <Snackbar
          open={Boolean(errorScan)}
          autoHideDuration={6000}
          onClose={() => setErrorPermissions("")}
        >
          <Alert onClose={() => setErrorPermissions("")} severity="error" sx={{ width: '100%' }}>
            {errorScan}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
}

export default Permissions;
