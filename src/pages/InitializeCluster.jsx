import {
  Box, Grid, Paper, Typography, List, ListItem, ListItemIcon, Container,
  ListItemText, Select, MenuItem, FormControl, FormGroup, TextField,
  FormControlLabel, InputLabel, IconButton, Button, Switch, Tooltip, CircularProgress
} from '@mui/material';
import { use, useState } from 'react';
import ComputerIcon from '@mui/icons-material/Computer';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VerifiedIcon from '@mui/icons-material/Verified';
import { ToastContainer, toast } from 'react-toastify'
import { showResourcesSpecs, initializeCluster, showMySpecs, saveClusterInformation } from "../utils/tauriApi";
import { useAppContext } from '../context/AppContext';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router";


function InitializeCluster() {
  const { resourcesIPs, resourcesUser, setClusterState, LANname, setClusterNodesConfig, overlayNetworkName, setOverlayNetworkName, setSubmitContainerName, setCurrentClusterId, setClusterActiveInfo } = useAppContext();
  const [checkedServers, setCheckedServers] = useState([]);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deployingCluster, setDeployingCluster] = useState(false)
  const [sysDefineAll, setSysDefineAll] = useState(false);
  const [numExecutionNodes, setNumExecutionNodes] = useState(1);
  const [sysDefineResources, setSysDefineResources] = useState(false);
  const [keepCluster, setKeepCluster] = useState(false);
  const [deployStatus, setDeployStatus] = useState(""); // "" | "idle" | "success" | "error"
  const [errorDeploy, setErrorDeploy] = useState("")
  const [clusterNameNotFilled, setClusterNameNotFilled] = useState(false);
  let navigate = useNavigate();

  // requests to backend for view all available resources
  const fetchData = async () => {
    if (resourcesIPs.length === 0){
      const result = await Swal.fire({
        title: 'Acción no permitida',
        text: `Primero debes buscar los recursos de cómputo en la sección "Recursos"`,
        icon: 'info',
        showCancelButton: true,
        confirmButtonColor: '#18b654ff',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Ir a buscar',
        cancelButtonText: 'Entendido',
      });

      if (result.isConfirmed) {
        navigate("/resources")
      } 
    }

    setLoading(true);
    console.log(resourcesIPs)
    try {
      const resourcesData = await showResourcesSpecs(resourcesIPs, resourcesUser);
      const myData = await showMySpecs(LANname);
      setServers(resourcesData);
      setCheckedServers([...checkedServers, {...myData, role: "sub"}]);
    } catch (err) {
      console.error("Script error showResourcesSpecs: ", err);
    }
    setLoading(false);
  }

  // permits to identify which resources has been selected using its ip
  const handleAdd = (server) => {
    console.log(server);
    setCheckedServers([...checkedServers, { ...server, role: "" }]);
    setServers(servers.filter(s => s.ip !== server.ip));
  };

  // permits to define roles to nodes
  const handleRoleChange = (ip, role) => {
    setCheckedServers(
      checkedServers.map(s => s.ip == ip? { ...s, role } : s)
    );
  };

  // permits to remove nodes from 'resoruces to use' that finally will not be use
  // and add that server to "available resources"
  const handleRemove = (server) => {
    setCheckedServers(checkedServers.filter(s => s.ip !== server.ip));
    setServers([...servers, server]);
  };

  // save in the database the deployed cluster information
  const handleSaveClusterData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user")); // review 
      const clusterPayload = {
        name: overlayNetworkName,             
        number_nodes: checkedServers.length,
        user_id: user.id,               
      };

      const response = await saveClusterInformation(clusterPayload);
      
      setClusterActiveInfo(prev => ({
        ...prev,                     
        numberNodes: checkedServers.length,
        createdAt: new Date().toLocaleString(),
      }));

      return response
    } catch (err) {
      console.error("Error guardando información del cluster:", err);
    }
  }

  // sends the request ([{ip:role},]) to asign roles to every selected resource
  // and start cluster
  const handleSendRequest = async () => {
    setDeployingCluster(true);
    setErrorDeploy("");
    const dataCheckedServers = checkedServers.map(s => ({ ip: s.ip, role: s.role, }));
    try {
      const initializeResponse = await initializeCluster(dataCheckedServers, resourcesUser, overlayNetworkName);
      
      console.log("RESPONSE INITIALIZE", initializeResponse);
      setClusterNodesConfig(initializeResponse.map(node => node.config));

      const submitContainer = initializeResponse
        .filter(node => node.config.container_name.startsWith("sub_"))
        .map(node => node.config.container_name);

      setSubmitContainerName(submitContainer[0])
      setClusterState("active");
      setDeployStatus("success")
      toast.success(`Cluster desplegado y listo para usar`);
      try {
        const saveResponse = await handleSaveClusterData();
        console.log("RESPONSE SAVE", saveResponse, saveResponse.cluster_id)
        setCurrentClusterId(saveResponse.cluster_id)
        toast.success(`Información del cluster guardada`)
      } catch (err) {
        //console.error("Error guardando información del cluster:", err);
        setErrorDeploy(err.message || "Error no resuelto al guardar información del clúster");
        toast.error(err.message || "Error no resuelto al guardar información del clúster");
      }

    } catch (err) {
      console.error("Error deploying:", err);
      setErrorDeploy(err.message || "Error no resulto al desplegar el clúster");
      toast.error(err.message || "Error no resulto al desplegar el clúster");
    } finally {
      setDeployingCluster(false);
    }
  };

  const confirmClusterDeployment = async () => {
    if (!overlayNetworkName.trim()) {
      setClusterNameNotFilled(true);
      toast.error("Debes ingresar un nombre para el clúster");
      return;
    }

    const result = await Swal.fire({
      title: '¿Desplegar clúster?',
      text: `Se desplegará el clúster "${overlayNetworkName}" con la configuración actual.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#18b654ff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Quiero desplegar',
      cancelButtonText: 'Volver y editar',
    });

    if (result.isConfirmed) {
      handleSendRequest();
      toast.info("Despliegue lanzado por el usuario")
    } else {
      toast.info("Despliegue cancelado por el usuario");
    }
  };


  return (
    <Container maxWidth="xl" sx={{ mt: 2, mx: "auto" }} >
      <Grid container spacing={4} sx={{ mb: 4 }}>
        {/* information + instructions */}
        <Grid item size={{ xs: 6, md: 4}}>
          <Typography variant="h6" mb={1}> Información </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            En esta sección puedes ver y configurar los recursos para posteriormente desplegar el clúster. Sideger es capaz de elegir
            los recursos y sus roles por tí, sin embargo, tienes la oportunidad de elegirlos tú mismo. Ten presente las
            opciones y gestiona el cluster según tus necesidades.<br/>
          </Typography>
          {/*<Typography variant="body1" sx={{ mb: 2 }}>
            Para ver los recursos disponibles actualmente da click en el siguiente botón.
          </Typography>*/}
          <Button variant='contained' color='' disabled={loading} onClick={fetchData} sx={{ minWidth: 150 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Ver Recursos'}
          </Button>
        </Grid>
        
        <Grid item size={{ xs:6, md:8}}>
          <Typography variant="h6" mb={1}> Opciones </Typography>
          {/* options */}
          <Grid container spacing={2}>
            <Grid item size={{ xs:6, md:6.5}}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Automática: Sideger elige recursos y sus roles, solamente debes ingresar el número de recursos a utilizar. <br/>
                Manual: Tú eliges los recursos que quieras usar, así como sus roles, hazlo desde las cuadrillas inferiores. <br/>
                Mantener Cluster: pendiente.  <br/>
                Nombre: Ingresa un nombre para identificar tu cluster
              </Typography>
            </Grid>

            {/* controls */}
            <Grid item size={{ xs:6, md:4}}>
              <Typography variant="h6" mb={1}> Gestiónar Cluster </Typography>
              <FormGroup sx={{ ml: 1, mb: 1 }}>
                <Grid container alignItems="stretch" justifyContent="flex-start" spacing={2} sx={{ mb: 1}}>
                  <Grid item xs={7}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={sysDefineAll}
                          onChange={(e) => setSysDefineAll(e.target.checked)}
                          size="small"
                          disabled={sysDefineResources}
                        />
                      }
                      label="Automática"
                    />
                  </Grid>
                  {sysDefineAll && (
                    <Grid item xs={5}>
                      <FormControl size="small">
                        <Select
                          value={numExecutionNodes}
                          size="small"
                          onChange={(e) => setNumExecutionNodes(parseInt(e.target.value))}
                          fullWidth
                        >
                          {Array.from({ length: servers.length - 2 }, (_, i) => (
                            <MenuItem key={i + 1} value={i + 1}> {i + 1} </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </Grid>
              </FormGroup>
              <FormGroup sx={{ ml: 1, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={sysDefineResources}
                      onChange={(e) => setSysDefineResources(e.target.checked)}
                      size="small"
                      disabled={sysDefineAll}
                    />
                  }
                  label="Manual"
                />
              </FormGroup>
              <FormGroup sx={{ ml: 1, mb: 2 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={keepCluster}
                      onChange={(e) => setKeepCluster(e.target.checked)}
                      size="small"
                    />
                  }
                  label="Mantener cluster"
                />
              </FormGroup>
              <FormGroup sx={{ mb: 2 }}>
                <TextField
                  required
                  error={Boolean(clusterNameNotFilled)}
                  label="Nombre del Clúster"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={overlayNetworkName}
                  onChange={(e) => {
                    setOverlayNetworkName(e.target.value);
                    if (e.target.value.trim()) setClusterNameNotFilled(false);
                  }}
                />
              </FormGroup>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid container direction="row" spacing={2} sx={{ mb: 4, alignItems: "stretch" }}>
        {/* available resources */}
        <Grid item size={{ xs: 12, md: 6}}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom> Recursos Disponibles </Typography>
            <List sx={{ height: 500, overflowY: 'auto'}}>
              {servers.map((server) => (
                <ListItem key={server.ip} divider>
                  <ListItemIcon><ComputerIcon /></ListItemIcon>
                  <ListItemText
                    primary={`${server.hostname} (${server.ip})`}
                    secondary={
                      <>
                        CPU: {server.cpu} | RAM: {server.ram_mb}MB<br />
                        SO: {server.os} | DISK: {server.disk.map(d => d.size).join(', ')}<br />
                        GPU: {server.gpu}
                      </>
                    }
                  />
                  <IconButton sx={{ marginRight:'10px' }} edge="end" onClick={() => handleAdd(server)} >
                    <AddIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* resources to use */}
        <Grid item size={{ xs: 12, md: 6}}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom> Recursos a Usar </Typography>
            <List sx={{ height: 500, overflowY: 'auto'}}>
              {checkedServers.map((server) => (
                <ListItem key={server.ip} divider>
                  <ListItemText
                    primary={`${server.hostname} (${server.ip})`}
                    secondary={
                      <>
                        CPU: {server.cpu} | RAM: {server.ram_mb}MB<br />
                        SO: {server.os} | DISK: {server.disk.map(d => d.size).join(', ')}<br />
                        GPU: {server.gpu}
                      </>
                    }
                  />

                  <Select
                    value={server.role || ""}
                    disabled={server.role === "sub"}
                    onChange={(e) => handleRoleChange(server.ip, e.target.value)}
                    displayEmpty
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <MenuItem value=""> Elegir rol </MenuItem>
                    <MenuItem value="sub"> Envío </MenuItem>
                    <MenuItem value="cm"> Administrador </MenuItem>
                    <MenuItem value="exe"> Ejecución </MenuItem>
                  </Select>
                  <IconButton edge="end" onClick={() => handleRemove(server)} disabled={server.role === "sub"}>
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 2}}>
        <Grid item size={12} >
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="black"
              onClick={confirmClusterDeployment}
              disabled={checkedServers.length < 3 || checkedServers.some(s => !s.role) || deployingCluster}
              sx={{ minWidth: 160 }}
            >
              {deployingCluster ? <CircularProgress size={24} color='inherit' /> : 'Inicializar Clúster'}
            </Button>
          </Box>
        </Grid>
      </Grid>

      {deployStatus === "success" && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <VerifiedIcon color="success" sx={{ fontSize: 60 }} />
          <Typography variant="h6" color="success.main">
            El cluster {overlayNetworkName} ha sido desplegado satistactoriamente
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Puedes dirigirte a la sección "Nuevo Trabajo" <br />
            y enviar tus trabajos al clúster.
          </Typography>
        </Box>
      )}
      
      {deployStatus === "error" && (
        <Box sx={{ textAlign: 'center', mt: 4 }}>
          <ErrorIcon color="warning" sx={{ fontSize: 60 }} />
          <Typography variant="h6" color="warning.main">
            {errorDeploy}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Si el mensaje indica error en el despliegue, inténtalo nuevamente. <br/><br/> 
            Si el error esta relacionado con guardar la información del <br />
            clúster, puedes ejecutar trabajos sin tener la opción de guardarlos.
          </Typography>
        </Box>
      )}
      {/** <ToastContainer position="bottom-right" autoClose={4000} /> */}
    </Container> 
  );
}

export default InitializeCluster;