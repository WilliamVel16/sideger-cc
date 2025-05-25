import { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, List, ListItem, ListItemIcon, Container,
  ListItemText, Select, MenuItem, FormControl, FormGroup, ToggleButton,
  FormControlLabel, InputLabel, IconButton, Button, Switch, Tooltip
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { invoke } from "@tauri-apps/api/core";

function Resources() {
  const [checkedServers, setCheckedServers] = useState([]);
  const [servers, setServers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sysDefineAll, setSysDefineAll] = useState(false);
  const [numExecutionNodes, setNumExecutionNodes] = useState(1);
  const [sysDefineResources, setSysDefineResources] = useState(false);
  const [keepCluster, setKeepCluster] = useState(false);


  // requests to backend for all available resources
  const fetchData = async () => {
    setLoading(true);

    try {
      const fetchNodesData = await invoke("show_resources_specs");
      setServers(fetchNodesData);
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
    const serverWithoutRole = delete server["role"];
    setServers([...servers, server]);
  };

  // sends the request ([{ip:role},]) to asign roles to every selected resource and start cluster
  const handleAssignRoles = async () => {
    console.log(checkedServers)
    const dataCheckedServers = checkedServers.map(s => ({ ip: s.ip, role: s.role, }));

    try {
      const response = await invoke("assign_roles", { nodes: dataCheckedServers });
      console.log(response);
      alert("Roles asignados correctamente");
    } catch (err) {
      console.error("Error al asignar roles:", err);
      alert("Error al asignar roles");
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mx: "sys" }} >
      {/* information + instructions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item size={{ xs: 6, md: 7}}>
          <Typography variant="h6"> Información </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Sección para mostrar información sobre la selección de recursos, explicando los controles del lado derecho, como
            el número máximo de nodos, se informa que por defecto el user debe elegir recursos, preferencias, etc.
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Para ver los recursos disponibles actualmente da click en el siguiente botón.
          </Typography>
          <Button variant='contained' color='gray' endIcon={<SearchIcon />}  disabled={loading} onClick={fetchData}>
            {loading ? 'Cargando...' : 'Buscar Recursos'}
          </Button>
        </Grid>
        
        {/* configuración del cluster */}
        <Grid item size={{ xs:6, md:5}}>
          <Typography variant="h6"> Gestiónar Cluster </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Define la configuración del clúster.
          </Typography>
          
          <FormGroup sx={{ mb: 1 }}>
            <Grid container alignItems="center" spacing={2}>
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
                  label="El sistema define recursos y roles"
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

          <FormGroup sx={{ mb: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={sysDefineResources}
                  onChange={(e) => setSysDefineResources(e.target.checked)}
                  size="small"
                  disabled={sysDefineAll}
                />
              }
              label="El sistema define solo recursos"
            />
          </FormGroup>

          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={keepCluster}
                  onChange={(e) => setKeepCluster(e.target.checked)}
                  size="small"
                />
              }
              label="Mantener clúster"
            />
          </FormGroup>
        </Grid>
      </Grid>

      <Grid container direction="row" spacing={2} sx={{ mb: 4, alignItems: "stretch" }}>
        {/* available resources */}
        <Grid item size={{ xs: 12, md: 6}}>
          <Paper elevation={3} sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6" gutterBottom> Recursos Disponibles </Typography>
            <List sx={{ height: 500, overflowY: 'sys'}}>
              {servers.map((server) => (
                <ListItem key={server.ip} divider>
                  <ListItemIcon><ComputerIcon /></ListItemIcon>
                  <ListItemText
                    primary={`${server.hostname} (${server.ip})`}
                    secondary={
                      <>
                        CPU: {server.cpu} | RAM: {server.ram_mb}MB<br />
                        SO: {server.os} | DISK: {server.disk.map(d => d.size).join(', ')}
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
            <List sx={{ height: 500, overflowY: 'sys'}}>
              {checkedServers.map((server) => (
                <ListItem key={server.ip} divider>
                  <ListItemText
                    primary={`${server.hostname} (${server.ip})`}
                    secondary={
                      <>
                        CPU: {server.cpu} | RAM: {server.ram_mb}MB<br />
                        SO: {server.os} | DISK: {server.disk.map(d => d.size).join(', ')}
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
              onClick={handleAssignRoles}
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

export default Resources;