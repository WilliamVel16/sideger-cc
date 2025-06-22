import { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, List, ListItem, ListItemIcon, Container,
  ListItemText, Select, MenuItem, FormControl, FormGroup, TextField,
  FormControlLabel, InputLabel, IconButton, Button, Switch, Tooltip
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { showResourcesSpecs, initializeCluster } from "../utils/tauriApi";
import { useAppContext } from '../context/AppContext';

function InitializeCluster() {
  const { resourcesIPs, user, setUser, pass, setPass } = useAppContext();
  const [checkedServers, setCheckedServers] = useState([]);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sysDefineAll, setSysDefineAll] = useState(false);
  const [numExecutionNodes, setNumExecutionNodes] = useState(1);
  const [sysDefineResources, setSysDefineResources] = useState(false);
  const [keepCluster, setKeepCluster] = useState(false);
  const [onetName, setOnetName] = useState("sidegerOnet");  

  // requests to backend for all available resources
  const fetchData = async () => {
    setLoading(true);
    console.log(resourcesIPs)
    try {
      const data = await showResourcesSpecs(resourcesIPs, user);
      setServers(data);
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

  // sends the request ([{ip:role},]) to asign roles to every selected resource
  // and start cluster
  const handleSendRequest = async () => {
    console.log(checkedServers)
    const dataCheckedServers = checkedServers.map(s => ({ ip: s.ip, role: s.role, }));

    try {
      const response = await initializeCluster(dataCheckedServers, user, onetName);
      console.log(response);
    } catch (err) {
      console.error("Error al asignar roles:", err);
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
          <Button variant='contained' color='gray' endIcon={<VisibilityIcon />}  disabled={loading} onClick={fetchData}>
            {loading ? 'Cargando...' : 'Ver Recursos'}
          </Button>
        </Grid>
        
        {/* cluster options and settings */}
        <Grid item size={{ xs:6, md:8}}>
          <Typography variant="h6" mb={1}> Opciones </Typography>
          <Grid container spacing={2}>
            <Grid item size={{ xs:6, md:6.5}}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Automática: Sideger elige recursos y sus roles, solamente debes ingresar el número de recursos a utilizar. <br/>
                Manual: Tú eliges los recursos que quieras usar, así como sus roles, hazlo desde las cuadrillas inferiores. <br/>
                Mantener Cluster: pendiente.  <br/>
                Nombre: Ingresa un nombre para identificar tu cluster
              </Typography>
            </Grid>
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
                  value={onetName}
                  onChange={(e) => setOnetName(e.target.value)}
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
                    onChange={(e) => handleRoleChange(server.ip, e.target.value)}
                    displayEmpty
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <MenuItem value="">Elegir rol</MenuItem>
                    <MenuItem value="sub">Envío</MenuItem>
                    <MenuItem value="exe">Ejecución</MenuItem>
                    <MenuItem value="cm">Administrador</MenuItem>
                  </Select>
                  <IconButton edge="end" onClick={() => handleRemove(server)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>

      {/* controls */}
      <Grid container spacing={2} sx={{ mb: 2}}>
        <Grid item size={12} >
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="black"
              onClick={handleSendRequest}
              disabled={checkedServers.length === 0 || checkedServers.some(s => !s.role)}
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