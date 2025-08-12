import {
  Box, Grid, Paper, Typography, Container,
  FormGroup, TextField, Button, Snackbar, Alert, Select,
  FormControl,
  InputLabel,
  MenuItem
} from '@mui/material';
import { useEffect, useState } from 'react';
import { scriptPermissions, scanInterfaces, scanLanResources, startSshConnection, getMyIp } from "../utils/tauriApi";
import { useAppContext } from '../context/AppContext';
import VerifiedIcon from '@mui/icons-material/Verified';

function Permissions() {
  const { resourcesIPs, setResourcesIPs, resourcesUser, setResourcesUser, LANname, setLANname } = useAppContext();
  const [accepted, setAccepted] = useState(false);
  const [successPermissions, setSuccessPermissions] = useState(false);
  const [errorPermissions, setErrorPermissions] = useState("");
  const [successScan, setSuccessScan] = useState(false);
  const [errorScan, setErrorScan] = useState("");
  const [numberResources, setNumberResources] = useState(0);
  const [localPass, setLocalPass] = useState("");
  const [interfaces, setInterfaces] = useState([]);
  const [resourcesPass, setResourcesPass] = useState();

  // scans the network interfaces
  useEffect(() => {
    (async () => {
      try {
      const output = await scanInterfaces();
      setInterfaces(output);
      } catch (err) {
        console.error("Error to obtain interfaces:", err);
      }
    })();
  }, []);

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
  const handleScanResources = async () => {
    try {
      const allDevicesFound = await scanLanResources(LANname, localPass);
      const thisResourceIp = await getMyIp(LANname);
      const finalResources = allDevicesFound.ips.filter(ip => ip !== thisResourceIp && !ip.endsWith(".1"));
      setResourcesIPs(finalResources);
      setNumberResources(finalResources.length)
      setSuccessScan(true);
    } catch (err) {
      if (typeof err === "string") {
        console.error("no ok 1", err);
        setErrorScan(err);
      } else if (err && err.message) {
        //console.log("Error 2 during ssh connection:", JSON.stringify(err, null, 2));
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
          const output = await startSshConnection(resourcesUser, resourcesPass, resourcesIPs);
          console.log("results ssh connection:", output);
        } catch (err) {
          console.log("Error during ssh connection:", err);
        }
      })();
    }
  }, [successScan, resourcesIPs]);


  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      {/*<Paper elevation={3} sx={{ p: 4 }}>*/}
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
          sala de cómputo e información sobre la infraestructura física, por favor ingresa el nombre de la interfaz de la red LAN y la contraseña del
          usuario del recurso que estás usando.
        </Typography>
        
        <Grid container direction="column" spacing={2} marginTop={3} alignItems={"center"}>
           <Grid item xs={12} md={6} sx={{ width: '30%' }}>
            <FormControl fullWidth size="small">
              <InputLabel> Interfaz LAN </InputLabel>
              <Select
                value={LANname}
                label="Interfaz LAN"
                onChange={(e) => setLANname(e.target.value)}
                >
                  {interfaces.map((iface) => (
                    <MenuItem key={iface} value={iface}>
                      {iface}
                    </MenuItem>
                  ))}
                </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6} sx={{ width: '30%' }}>
            <TextField
              label="Contraseña de usuario"
              variant="outlined"
              type="password"
              fullWidth
              size="small"
              value={localPass}
              onChange={(e) => setLocalPass(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ width: '30%' }}>
            <TextField
              label="Usuario de los recursos"
              variant="outlined"
              fullWidth
              size="small"
              value={resourcesUser}
              onChange={(e) => setResourcesUser(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ width: '30%' }}>
            <TextField
              label="Contraseña de los recursos"
              variant="outlined"
              type="password"
              fullWidth
              size="small"
              value={resourcesPass}
              onChange={(e) => setResourcesPass(e.target.value)}
            />
          </Grid>
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 5 }}>
          <Button variant="contained" color="black" onClick={() => handleScanResources()}>
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
          onClose={() => setErrorScan("")}
        >
          <Alert onClose={() => setErrorScan("")} severity="error" sx={{ width: '100%' }}>
            {errorScan}
          </Alert>
        </Snackbar>
      {/*</Paper>*/}
    </Container>
  );
}

export default Permissions;