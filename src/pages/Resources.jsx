import { useEffect, useState } from 'react';
import {
  List, ListItem, ListItemIcon, ListItemText, ListSubheader, Switch,
  Typography, Select, MenuItem, IconButton, Grid
} from '@mui/material';
import ComputerIcon from '@mui/icons-material/Computer';
import DeleteIcon from '@mui/icons-material/Delete';
import { invoke } from "@tauri-apps/api/core";

function Resources() {
  const [checkedServers, setCheckedServers] = useState([]);
  const [servers, setServers] = useState([]);

  // requests to backend for all able resources
  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchNodesData = await invoke("show_resources_specs");
        setServers(fetchNodesData);
        console.log(fetchNodesData)
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
    console.log(newChecked)

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

  return (
    <List
      sx={{ width: '100%', maxWidth: 600, bgcolor: 'background.paper' }}
      subheader={<ListSubheader>Recursos Disponibles</ListSubheader>}
    >
      {servers.map((server) => (
        <ListItem key={server.ip} divider>
          <ListItemIcon>
            <ComputerIcon />
          </ListItemIcon>
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
            onChange={handleToggle(server.ip)}
            checked={checkedServers.includes(server.ip)}
            inputProps={{
              'aria-labelledby': `switch-list-label-${server.ip}`,
            }}
          />
        </ListItem>
      ))}
    </List>
  );
}

export default Resources;