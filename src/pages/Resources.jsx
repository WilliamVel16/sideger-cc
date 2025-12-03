import {
  Box, Grid, Paper, Typography, Container,
  FormGroup, TextField, Button, Snackbar, Alert, Select,
  FormControl,
  InputLabel,
  MenuItem,
  CircularProgress
} from '@mui/material';
import { useEffect, useState } from 'react';
import { scriptPermissions, scanInterfaces, scanLanResources, startSshConnection, getMyIp } from "../utils/tauriApi";
import { useAppContext } from '../context/AppContext';
import { ToastContainer, toast } from 'react-toastify'
import VerifiedIcon from '@mui/icons-material/Verified';
import ErrorIcon from '@mui/icons-material/Error';

function Permissions() {
  const { resourcesIPs, setResourcesIPs, resourcesUser, setResourcesUser, LANname, setLANname } = useAppContext();
  const [accepted, setAccepted] = useState(false);
  const [successPermissions, setSuccessPermissions] = useState(false);
  const [errorPermissions, setErrorPermissions] = useState("");
  const [successScan, setSuccessScan] = useState(false);
  const [numberResources, setNumberResources] = useState(0);
  const [localPass, setLocalPass] = useState("");
  const [interfaces, setInterfaces] = useState([]);
  const [resourcesPass, setResourcesPass] = useState();
  const [scanStatus, setScanStatus] = useState("idle"); // "idle" | "success" | "error"
  const [errorScan, setErrorScan] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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

  // validate inputs
  const validate = () => {
    const newErrors = {};
    if (!LANname) newErrors.LANname = "Selecciona una interfaz LAN";
    if (!localPass) newErrors.localPass = "La contraseña es obligatoria";
    if (!resourcesUser) newErrors.resourcesUser = "El usuario es obligatorio";
    if (!resourcesPass) newErrors.resourcesPass = "La contraseña del recurso es obligatoria";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // get the permissions to execute scripts to deploy the cluster
  const handleAccept = async () => {
    try {
      const result = await scriptPermissions();
      console.log(result);
      setSuccessPermissions(true);
      toast.success("Permisos concedidos correctamente");
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error al otorgar permisos");
    } finally {
      setAccepted(true);
    }
  };

  // executes the resources scanning in the LAN
  const handleScanResources = async () => {
    if (!validate()) {
      toast.error("Por favor completa los campos requeridos");
      return;
    }

    setLoading(true)
    setScanStatus("idle");
    setErrorScan("");
    try {
      const allDevicesFound = await scanLanResources(LANname, localPass);
      const thisResourceIp = await getMyIp(LANname);
      const finalResources = allDevicesFound.ips.filter(ip => ip !== thisResourceIp && !ip.endsWith(".1"));
      
      if (finalResources.length === 0) {
        setErrorScan("No se encontraron recursos disponibles en la red.");
        toast.error("No se encontraron recursos disponibles en la red.");
        return;
      }

      setResourcesIPs(finalResources);
      setNumberResources(finalResources.length)
      setScanStatus("success");
      setSuccessScan(true);
      toast.success(`Se encontraron ${finalResources.length} recursos`);
    } catch (err) {
      setErrorScan(err.message || "Error no resuelto al escanear la red");
      toast.error(err.message || "Error no resuelto al escanear la red");
      setScanStatus("error")
    } finally {
      setLoading(false)
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
          sala de cómputo e información sobre la infraestructura física, por favor ingresa el nombre de la
          interfaz de la red LAN y la contraseña del usuario del recurso que estás usando, asimismo debes
          ingresar el usuario y contraseña de los recursos de la red LAN seleccionada.
        </Typography>
        
        <Grid container direction="column" spacing={2} marginTop={3} alignItems={"center"} >
           <Grid item xs={12} md={6} sx={{ width: '30%' }}>
            <FormControl required error={Boolean(errors.LANname)} fullWidth size="small">
              <InputLabel> Interfaz LAN </InputLabel>
              <Select
                value={LANname || ""}
                label="Interfaz LAN"
                onChange={(e) => { setLANname(e.target.value); setErrors(prev => ({ ...prev, LANname: "" })); }}
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
              required
              error={Boolean(errors.localPass)}
              label="Contraseña de usuario"
              variant="outlined"
              type="password"
              fullWidth
              size="small"
              value={localPass}
              onChange={(e) => {
                setLocalPass(e.target.value);
                setErrors(prev => ({ ...prev, localPass: "" }));
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ width: '30%' }}>
            <TextField
              required
              error={Boolean(errors.resourcesUser)}
              label="Usuario de los recursos"
              variant="outlined"
              fullWidth
              size="small"
              value={resourcesUser}
              onChange={(e) => {
                setResourcesUser(e.target.value);
                setErrors(prev => ({ ...prev, resourcesUser: "" }));
              }}
            />
          </Grid>
          <Grid item xs={12} md={6} sx={{ width: '30%' }}>
            <TextField
              required
              error={Boolean(errors.resourcesPass)}
              label="Contraseña de los recursos"
              variant="outlined"
              type="password"
              fullWidth
              size="small"
              value={resourcesPass}
              onChange={(e) => {
                setResourcesPass(e.target.value);
                setErrors(prev => ({ ...prev, resourcesPass: "" }));
              }}
            />
          </Grid>
        </Grid>
        <Box sx={{ textAlign: 'center', mt: 5 }}> 
          <Button variant="contained" color="" disabled={loading} onClick={() => handleScanResources()} sx={{ minWidth: 150 }}>
            {loading ? <CircularProgress size={24} color='inherit' /> : 'Buscar Recursos'}
          </Button>
        </Box>

        {scanStatus === "success" && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <VerifiedIcon color="success" sx={{ fontSize: 60 }} />
            <Typography variant="h6" color="success.main">
              El sistema ha encontrado {numberResources} recursos disponibles en la red
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Puedes dirigirte a la sección "Desplegar"
            </Typography>
          </Box>
        )}
        
        {scanStatus === "error" && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <ErrorIcon color="warning" sx={{ fontSize: 60 }} />
            <Typography variant="h6" color="warning.main">
              {errorScan}
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Asegúrate de elegir una interfaz válida e <br/> ingresar las credenciales correctas
            </Typography>
          </Box>
        )}

      {/*</Paper>*/}
      <ToastContainer position="bottom-right" autoClose={4000} />
    </Container>
  );
}

export default Permissions;