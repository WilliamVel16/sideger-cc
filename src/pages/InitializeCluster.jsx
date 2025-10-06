import {
  Box, Grid, Paper, Typography, List, ListItem, ListItemIcon, Container,
  ListItemText, Select, MenuItem, FormControl, FormGroup, TextField,
  FormControlLabel, InputLabel, IconButton, Button, Switch, Tooltip, CircularProgress
} from '@mui/material';
import { useState } from 'react';
import ComputerIcon from '@mui/icons-material/Computer';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { showResourcesSpecs, initializeCluster, showMySpecs } from "../utils/tauriApi";
import { useAppContext } from '../context/AppContext';

function InitializeCluster() {
  const { resourcesIPs, resourcesUser, setClusterState, LANname, setClusterNodesConfig, overlayNetworkName, setOverlayNetworkName, setSubmitContainerName, setCurrentClusterId } = useAppContext();
  const [checkedServers, setCheckedServers] = useState([]);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sysDefineAll, setSysDefineAll] = useState(false);
  const [numExecutionNodes, setNumExecutionNodes] = useState(1);
  const [sysDefineResources, setSysDefineResources] = useState(false);
  const [keepCluster, setKeepCluster] = useState(false);

  // requests to backend for view all available resources
  const fetchData = async () => {
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

    await saveClusterInformation(clusterPayload);
    console.log("Cluster registrado correctamente en la base de datos.");
  } catch (err) {
    console.error("Error guardando información del cluster:", err);
  }
  }

  // sends the request ([{ip:role},]) to asign roles to every selected resource
  // and start cluster
  const handleSendRequest = async () => {
    const dataCheckedServers = checkedServers.map(s => ({ ip: s.ip, role: s.role, }));
    try {
      const response = await initializeCluster(dataCheckedServers, resourcesUser, overlayNetworkName);
      setClusterState("active");
      console.log(response);
      console.log(response[0].config);
      setClusterNodesConfig(response.map(node => node.config));

      try {
        const response = await handleSaveClusterData();
        console.log(response)
        setCurrentClusterId(response.cluster_id) // REVIEW RETURN
        enqueueSnackbar("Clúster registrado correctamente.", { variant: "success" }); //temp
      } catch (err) {
        //console.error("Error guardando información del cluster:", err);
        enqueueSnackbar("Error al guardar el clúster.", { variant: "error" }); //temp
      }

      const submitContainer = response
        .filter(node => node.config.container_name.startsWith("sub_"))
        .map(node => node.container_name);

      setSubmitContainerName(submitContainer[0])
    } catch (err) {
      console.error("Error deploying:", err);
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
          <Button variant='outlined' color='' disabled={loading} onClick={fetchData} sx={{ minWidth: 150 }}>
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
                  label="Nombre del Clúster"
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={overlayNetworkName}
                  onChange={(e) => setOverlayNetworkName(e.target.value)}
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
              onClick={handleSendRequest}
              disabled={checkedServers.length < 3 || checkedServers.some(s => !s.role)}
            >
              Inicializar Clúster
            </Button>
          </Box>
        </Grid>
      </Grid>
      
    </Container> 
  );
}

export default InitializeCluster;