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
import VerifiedIcon from '@mui/icons-material/Verified';
import { ToastContainer, toast } from 'react-toastify'
import { showResourcesSpecs, initializeCluster, showMySpecs, saveClusterInformation, addNewNodes, getAutomaticRoles } from "../utils/tauriApi";
import { useAppContext } from '../context/AppContext';
import Swal from 'sweetalert2';
import { useNavigate } from "react-router";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

function InitializeCluster() {
  const {
    resourcesIPs, resourcesUser, clusterState, setClusterState, LANname, setClusterNodesConfig,
    overlayNetworkName, setOverlayNetworkName, setSubmitContainerName, setCurrentClusterId,
    setClusterActiveInfo, checkedServers, setCheckedServers, servers, setServers, swarmToken, setSwarmToken,
    autoAssigned, setAutoAssigned, sysDefineAll, setSysDefineAll
  } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [deployingCluster, setDeployingCluster] = useState(false)
  const [numNodesToUse, setNumNodesToUse] = useState(2);
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
        confirmButtonColor: '#0a913dff',
        cancelButtonColor: '#b61010ff',
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
    setCheckedServers([...checkedServers, { ...server, role: "", isNew: true  }]);
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

  // sends the request to the system choose the cluster config automaticaly
  const handleAutomaticAssignment = async () => {
    try {
      if (!sysDefineAll) return;

      Swal.fire({
        title: "Asignando roles...",
        text: "El sistema está determinando el nodo Central Manager y los nodos Execute.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const response = await getAutomaticRoles(servers.map(s => s.ip), numNodesToUse, resourcesUser);

      const mergedSelectedNodes = response.selected_nodes.map(n => {
        const originalNode = servers.find(s => s.ip === n.ip);
        return { ...originalNode, role: n.role };
      });

      setCheckedServers(prev => [...prev, ...fullMerged]);
      setServers(prev => prev.filter(s => !mergedSelectedNodes.some(f => f.ip === s.ip)));
      setAutoAssigned(true);
      
      Swal.fire({
        icon: "success",
        title: "Asignación completada",
        text: "Los roles fueron asignados automáticamente, inicializa el clúster",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      toast.error(`Error asignando roles automáticamente ${err}`);
      console.error(err);
    }
  };


  // sends the request ([{ip, role},]) to asign roles to every selected resource
  // and start cluster
  const handleSendRequest = async () => {
    setDeployingCluster(true);
    setErrorDeploy("");
    const dataCheckedServers = checkedServers.map(s => ({ ip: s.ip, role: s.role, }));
    try {
      const initializeResponse = await initializeCluster(dataCheckedServers, resourcesUser, overlayNetworkName);
      
      setClusterNodesConfig(initializeResponse.nodes.map(node => node.config));
      setSwarmToken(initializeResponse.token);

      const submitContainer = initializeResponse
        .filter(node => node.config.container_name.startsWith("sub_"))
        .map(node => node.config.container_name);

      setSubmitContainerName(submitContainer[0])
      setClusterState("active");
      setDeployStatus("success")
      setCheckedServers(prev =>
        prev.map(n =>
          n.isNew ? { ...n, isNew: false } : n
        )
      );

      try {
        const saveResponse = await handleSaveClusterData();
        setCurrentClusterId(saveResponse.cluster_id)
      } catch (err) {
        //console.error("Error guardando información del cluster:", err);
        Swal.close();
        setErrorDeploy(err.message || "Error no resuelto al guardar información del clúster");
        toast.error(err.message || "Error no resuelto al guardar información del clúster");
      }
      Swal.close();

      await Swal.fire({
        title: "Clúster desplegado",
        text: `El clúster "${overlayNetworkName}" está listo para usar.`,
        icon: "success",
        confirmButtonColor: "#0a913dff",
        confirmButtonText: "Entendido",
      });

    } catch (err) {
      Swal.close();
      console.error("Error deploying:", err);
      setErrorDeploy(err.message || "Error no resulto al desplegar el clúster");
      toast.error(err.message || "Error no resulto al desplegar el clúster");
    } finally {
      setDeployingCluster(false);
    }
  };

  const confirmClusterDeployment = async () => {
    const nameRegex = /^[A-Za-z0-9_-]+$/;

    if (!overlayNetworkName.trim()) {
      setClusterNameNotFilled(true);
      toast.error("Debes ingresar un nombre para el clúster");
      console.log("1")
      return;
    }

    if (!nameRegex.test(overlayNetworkName)) {
      setClusterNameNotFilled(true);
      toast.error("Nombre inválido: usa solo letras, números, guion (-) y guion bajo (_).");
      return;
    }

    const result = await Swal.fire({
      title: '¿Desplegar clúster?',
      text: `Se desplegará el clúster "${overlayNetworkName}" con la configuración actual.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#0a913dff',
      cancelButtonColor: '#b61010ff',
      confirmButtonText: 'Quiero desplegar',
      cancelButtonText: 'Volver y editar',
    });

    if (result.isConfirmed) {
      Swal.fire({
      title: "Desplegando clúster...",
      text: "Por favor espera unos minutos mientras Sideger despliega tu clúster",
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => { Swal.showLoading(); },
    });

    handleSendRequest();
    } else {
      toast.info("Despliegue cancelado por el usuario");
    }
  };

  const handleAddNodes = async () => {
    try {
      const newNodes = checkedServers.filter(n => n.isNew && n.role && n.role.trim() !== "");
      if (newNodes.length === 0) {
        toast.info("No hay nodos nuevos para agregar.");
        return;
      }

      const titleSwal = newNodes.length === 1  ? "Agregando nodo..." : "Agregando nodos...";
      const titleSwal2 = newNodes.length === 1 ? "Nodo agregado" : "Nodos agregados"
      const numberExecuteNodesUp = checkedServers.filter(
        n => !n.isNew && n.role === "exe"
      ).length;

      Swal.fire({
        title: titleSwal,
        text: "Por favor espera mientras Sideger escala tu clúster",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => Swal.showLoading(),
      });

      const addNodesResponse = await addNewNodes(newNodes, resourcesUser, overlayNetworkName, swarmToken, numberExecuteNodesUp);
      console.log(addNodesResponse)
      setClusterNodesConfig(prev => [
        ...prev,
        ...addNodesResponse.map(n => n.config)
      ]);
      Swal.close();

      await Swal.fire({
        title: titleSwal2,
        text: "Número de nodos del clúster actualizado",
        icon: "success",
        confirmButtonColor: "#0a913dff",
      });

      setCheckedServers(prev =>
        prev.map(n =>
          n.isNew ? { ...n, isNew: false } : n
        )
      );

    } catch (err) {
      Swal.close();
      toast.error(err.message || "Error inesperado al agregar nodos");
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mx: "auto" }} >
      <Grid container spacing={4} sx={{ mb: 1 }}>
        {/* information + instructions */}
        <Grid item size={{ xs: 6, md: 4}}>
          <Typography variant="h6" mb={1}> Información </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            En esta sección puedes ver y configurar los recursos para posteriormente desplegar el clúster. Sideger es capaz de elegir
            los recursos y sus roles por tí, sin embargo, tienes la oportunidad de elegirlos tú mismo. Ten presente las
            opciones y gestiona el cluster según tus necesidades.<br/>
          </Typography>
        </Grid>
        
        <Grid item size={{ xs:6, md:8}}>
          <Typography variant="h6" mb={1}> Opciones </Typography>
          {/* options */}
          <Grid container spacing={2}>
            <Grid item size={{ xs:6, md:6.5}}>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <Typography component="span" fontWeight={550}>Automática:</Typography> Sideger elige recursos y sus roles, solamente debes ingresar el número de recursos a utilizar. <br/>
                <Typography component="span" fontWeight={550}>Manual:</Typography> Tú eliges los recursos que quieras usar, así como sus roles, hazlo desde las cuadrillas inferiores. <br/>
                <Typography component="span" fontWeight={550}>Nombre:</Typography> Ingresa un nombre para tu clúster, por favor lee el tooltip (i).
              </Typography>
            </Grid>

            {/* controls */}
            <Grid item size={{ xs:6, md:4}}>
              <FormGroup sx={{ ml: 1, mb: 1 }}>
                <Grid container alignItems="stretch" justifyContent="flex-start" spacing={2} sx={{ mb: 1}}>
                  <Grid item xs={7}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={sysDefineAll}
                          onChange={(e) => {
                            setSysDefineAll(e.target.checked)
                          }}
                          size="small"
                          disabled={sysDefineAll}
                        />
                      }
                      label="Automática"
                    />
                  </Grid>
                  {sysDefineAll && (
                    <Grid item xs={5}>
                      <FormControl size="small">
                        <Select
                          value={numNodesToUse}
                          size="small"
                          onChange={(e) => setNumNodesToUse(parseInt(e.target.value))}
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
                      checked={!sysDefineAll}
                      onChange={(e) => setSysDefineAll(!e.target.checked)}
                      size="small"
                      disabled={!sysDefineAll}
                    />
                  }
                  label="Manual"
                />
              </FormGroup>
              <FormGroup sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2}}>
                  <TextField
                    required
                    error={Boolean(clusterNameNotFilled)}
                    label="Nombre (sin espacios)"
                    variant="outlined"
                    size="small"
                    fullWidth
                    value={overlayNetworkName}
                    onChange={(e) => {
                      setOverlayNetworkName(e.target.value);
                      if (e.target.value.trim()) setClusterNameNotFilled(false);
                    }}
                  />
                  <Tooltip title="Sólo texto (sin ñ), números, guion (-) y guion bajo (_)." arrow>
                    <IconButton size='medium' sx={{ ml: 1, color: "primary.main", p: 0.5 }}>
                      <InfoOutlinedIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </FormGroup>
            </Grid>
          </Grid>
        </Grid>
      </Grid>


      <Button variant='contained' color='' disabled={loading} onClick={fetchData} sx={{ minWidth: 150 }}>
        {loading ? (
          <CircularProgress size={24} color="inherit" />
        ) : clusterState === "active" ? (
          "Ver nuevos recursos"
        ) : (
          "Ver Recursos"
        )}
      </Button>
      {clusterState === "active" && (
        <Typography variant="body1" color='gray' sx={{ mt: 2, textAlign: "center" }} >
          Para ver recursos encendidos recientemente, ve a la sección "Recursos", realiza la búsqueda, regresa a esta sección
          y lanza "ver nuevos recursos."
        </Typography>
      )}

      <Grid container direction="row" spacing={2} sx={{ mt: 2, mb: 4, alignItems: "stretch" }}>
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
            {clusterState !== "active" ? (
              <>
                {/* automatic config */}
                {sysDefineAll && !autoAssigned && (
                  <Button
                    variant="contained"
                    color=""
                    onClick={handleAutomaticAssignment}
                    disabled={servers.length < numNodesToUse}
                    sx={{ minWidth: 200 }}
                  >
                    Enviar solicitud de eleccion automatica
                  </Button>
                )}

                {sysDefineAll && autoAssigned && (
                  <Button
                    variant="contained"
                    color=""
                    onClick={confirmClusterDeployment}
                    sx={{ minWidth: 200 }}
                  >
                    Inicializar clúster
                  </Button>
                )}

                {/* manual config */}
                {!sysDefineAll && (
                  <Button
                    variant="contained"
                    color=""
                    onClick={confirmClusterDeployment}
                    disabled={
                      checkedServers.length < 3 ||
                      checkedServers.some((s) => !s.role)
                    }
                    sx={{ minWidth: 200 }}
                  >
                    Inicializar clúster
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="contained"
                color="black"
                onClick={handleAddNodes}  
                disabled={checkedServers.some(s => !s.role)}  
                sx={{ minWidth: 160 }}
              >
                Agregar nodo(s) al clúster
              </Button>
            )}
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
      <ToastContainer position="bottom-right" autoClose={4000} />
    </Container> 
  );
}

export default InitializeCluster;