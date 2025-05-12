import { useEffect, useState } from 'react';
import {
  List, ListItem, ListItemIcon, ListItemText, ListSubheader, Switch,
  Typography, Select, MenuItem, IconButton, Grid
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import DeleteIcon from '@mui/icons-material/Delete';
import { invoke } from "@tauri-apps/api/core";
import { Button } from '@mui/material';

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
  const handleToggle = (ip) => () => {
    const currentIndex = checkedServers.indexOf(ip);
    const newChecked = [...checkedServers];

    if (currentIndex === -1) {
      newChecked.push(ip);
    } else {
      newChecked.splice(currentIndex, 1);
    }
    setCheckedServers(newChecked);
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
    const dataCheckedServers = checkedServers.map(s => ({
      ip: s.ip,
      role: s.role,
    }));

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
    <Grid container spacing={3}>
      {/* recursos disponibles */}
      <Grid item xs={6}>
        <List subheader={<ListSubheader>Recursos Disponibles</ListSubheader>}>
          {servers.map((server) => (
            <ListItem key={server.ip} divider>
              <ListItemIcon><ComputerIcon /></ListItemIcon>
              <ListItemText
                primary={`${server.hostname} ${server.ip}`} 
                secondary={
                  <Typography component="div" variant="body2" color="text.primary">
                    <Typography component="span" variant="body2">
                      CPU: {server.cpu} | RAM: {server.ram_mb}
                    </Typography><br/>
                    <Typography component="span" variant="body2">
                      SO: {server.os} | DISK: {server.disk.map(d => d.size).join(', ')}
                    </Typography>
                  </Typography>
                }
              />
              <Switch
                edge="end"
                onChange={handleToggle(server)}
                checked={checkedServers.some(s => s.ip === server.ip)}
              />
            </ListItem>
          ))}
        </List> 
      </Grid>

      {/* recursos a usar */}
      <Grid item xs={6}>
        <List subheader={<ListSubheader>Recursos a Usar</ListSubheader>}>
          {checkedServers.map((server) => (
            <ListItem key={server.ip} divider>
              <ListItemText primary={`${server.hostname} ${server.ip}`} />
              <Select
                value={server.role}
                onChange={(e) => handleRoleChange(server.ip, e.target.value)}
                displayEmpty
                size="small"
                sx={{ mr: 1 }}
              >
                <MenuItem value="">Elegir rol</MenuItem>
                <MenuItem value="sub">Envio</MenuItem>
                <MenuItem value="exe">Ejecución</MenuItem>
                <MenuItem value="cm">Administrador</MenuItem>
              </Select>
              <IconButton edge="end" onClick={() => handleRemove(server.ip)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ))}
        </List>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAssignRoles}
          disabled={checkedServers.length === 0 || checkedServers.some(s => !s.role)}
        >
          Inicializar Cluster
        </Button>
      </Grid>
    </Grid>
  );
}

export default Resources;