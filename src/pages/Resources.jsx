import { useEffect, useState } from 'react';
import {
  Box, Grid, Paper, Typography, List, ListItem, ListItemIcon,
  ListItemText, ListSubheader, Switch, Select, MenuItem,
  IconButton, Button, Container
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { invoke } from "@tauri-apps/api/core";

function Resources() {
  const [checkedServers, setCheckedServers] = useState([]);
  const [servers, setServers] = useState([]);

  // requests to backend for all available resources
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchNodesData = await invoke("show_resources_specs");
        setServers(fetchNodesData);
      } catch (err) {
        console.error("Script error showResourcesSpecs: ", err);
      }
    }
    fetchData();
  }, [])

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
  const handleRemove = (ip) => {
    setCheckedServers(checkedServers.filter(s => s.ip !== ip));
  };

  // sends the request to asign roles to every selected resource and start cluster
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
    <Container maxWidth="lg" sx={{ mt: 2, mx: "auto" }} >
      {/* Sección superior: Configuración + Info */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} md={6}>
          <Typography variant="h6">Configuración</Typography>
          <Typography variant="body2">Aquí podrías colocar opciones como el número máximo de nodos, preferencias, etc.</Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6">Información</Typography>
          <Typography variant="body2">
            Página para seleccionar los recursos disponibles, asignar roles y desplegar el clúster.
          </Typography>
        </Grid>
      </Grid>

      {/* Sección principal: recursos */}
      <Grid container spacing={2}>
        {/* Recursos disponibles */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Recursos Disponibles</Typography>
            <List>
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
                  <IconButton edge="end" onClick={() => handleAdd(server)}>
                    <AddIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recursos a usar */}
        <Grid item xs={12} md={6}>
        <Paper elevation={3} sx={{ p: 2, width: '100%' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h6" gutterBottom>Recursos a Usar</Typography>
            <List sx={{ flexGrow: 1 }}>
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
                  <IconButton edge="end" onClick={() => handleRemove(server.ip)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </Paper>
      </Grid>
      </Grid>

      {/* Sección inferior: botón */}
      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAssignRoles}
          disabled={checkedServers.length === 0 || checkedServers.some(s => !s.role)}
        >
          Inicializar Clúster
        </Button>
      </Box>
    </Container>
  );
}

export default Resources;