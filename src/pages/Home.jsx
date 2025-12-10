import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import BrightnessHighIcon from '@mui/icons-material/BrightnessHigh';
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { useAppContext } from "../context/AppContext";
import AboutDialog from "../components/ui/aboutDialog";
import FeaturesDialog from "../components/ui/featuresDialog";
import HowToUseDialog from "../components/ui/howToUseDialog";
import { getUserClusters } from "../utils/tauriApi";
import { useNavigate } from "react-router";

export default function HomePage() {
  const { clusterState, overlayNetworkName, clusterActiveInfo } = useAppContext()
  const [openAbout, setOpenAbout] = useState(false);
  const [openFeatures, setOpenFeatures] = useState(false);
  const [openHotToUse, setOpenHowToUse] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    fetchClusterHistory();
  }, []);

  const fetchClusterHistory = async () => {
    setLoading(true);
    try {
      const data = await getUserClusters();
      setHistory(data);
    } catch (err) {
      console.error(err);
      toast.error(`Error al obtener el historial. ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleGoToManagement = () => {
    navigate("/resources")
  };

  return (
    <Box p={3}>
      {/* welcome header */}
      <Box mb={4} display={"flex"} justifyContent="space-between" alignItems="" flexWrap="wrap">
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Bienvenido a SIDEGER-CC
          </Typography>
          <Typography variant="h5" color="text.secondary" paddingBottom={2}>
            Sistema de gestión de recursos y clúster computacional
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" paddingBottom={2}>
            Enciende tus recursos de cómputo, despliega tu clúster y envía tus trabajos.
          </Typography>
          <Box mt={2}>
            <Chip
              label={clusterState === "active" ? "Clúster activo" : "Clúster inactivo"}
              color={clusterState === "active" ? "success" : "default"}
              sx={{ fontWeight: "bold", mr: 2 }}
            />
            {clusterState === "inactive" ? (
              <Button
                variant="outlined"
                color="success"
                onClick={handleGoToManagement}
              >
                Ir a desplegar mi clúster
              </Button>
            ) : (
              <Typography marginTop={1}> El clúster {overlayNetworkName} actualmente está listo para recibir trabajos </Typography>
            )}
          </Box>
        </Box>

        {/** informative section (right side) */}
        <Box mt={{ xs: 2, md: 0 }}>
          <Tooltip title="Más información sobre Sideger">
            <Button
              variant="text"
              color="info"
              startIcon={<InfoIcon />}
              onClick={() => setOpenAbout(true)}
              sx={{ marginRight: 2}}
            >
              Sobre Sideger
            </Button>
          </Tooltip>
          <Tooltip title="Descubre las funcionalidades principales">
            <Button
              variant="text"
              color="info"
              startIcon={<TipsAndUpdatesIcon />}
              onClick={() => setOpenFeatures(true)}
              sx={{ marginRight: 2}}
            >
              Lo que puedes hacer
            </Button>
          </Tooltip>
          <Tooltip title="Pasos para el uso de la herramienta">
            <Button
              variant="text"
              color="info"
              startIcon={<BrightnessHighIcon />}
              onClick={() => setOpenHowToUse(true)}
            >
              ¿Cómo hacerlo?
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {/* dialog: about sideger*/}
      <AboutDialog open={openAbout} onClose={() => setOpenAbout(false)} />

      {/* dialog: what you can with sideger */}
      <FeaturesDialog open={openFeatures} onClose={() => setOpenFeatures(false)} />

      {/* dialog: hot to use it? */}
      <HowToUseDialog open={openHotToUse} onClose={() => setOpenHowToUse(false)} />
    
      {/** general state panel */}
      {clusterState === "active" && (
        <Grid container spacing={2} mb={3} alignItems="stretch">
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "90%"}}>
              <CardContent sx={{ textAlign: "center" }}>
                <Tooltip title="Número total de nodos activos en este clúster">
                  <Typography variant="h6">Nodos activos</Typography>
                </Tooltip>
                <Typography variant="h4" fontWeight="bold">
                  {clusterActiveInfo.numberNodes}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "90%"}}>
              <CardContent sx={{ textAlign: "center" }}>
                <Tooltip title="Fecha de despliegue del clúster">
                  <Typography variant="h6">Fecha de despliegue</Typography>
                </Tooltip>
                <Typography variant="body1">
                  {clusterActiveInfo.createdAt ? clusterActiveInfo.createdAt : "—"}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "90%"}}>
              <CardContent sx={{ textAlign: "center" }}>
                <Tooltip title="Trabajos totales enviados a este clúster">
                  <Typography variant="h6">Trabajos totales en cola</Typography>
                </Tooltip>
                <Typography variant="h4" fontWeight="bold">
                  {clusterActiveInfo.jobsTotal}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: "90%"}}>
              <CardContent sx={{ textAlign: "center" }}>
                <Tooltip title="Jobs en ejecución / completados / fallidos">
                  <Typography variant="h6">Estado de trabajos</Typography>
                </Tooltip>
                <Typography variant="body1">
                  {clusterActiveInfo.jobsRunning} en ejecución
                </Typography>
                <Typography variant="body1">
                  {clusterActiveInfo.jobsWaiting} en espera
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* fast actions */}
      <Box mb={3}>
        <Typography variant="h6" gutterBottom>
          Acciones rápidas
        </Typography>
        <Grid container spacing={2}>
          {clusterState === "active" && (
            <>
              <Grid item>
                <Button
                  variant="contained"
                  size="small"
                  color=""
                  onClick={() => navigate("/jobs/new")}
                >
                  Enviar trabajo
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  size="small"
                  color=""
                  onClick={() => navigate("/jobs/queue")}
                >
                  Ver jobs en cola
                </Button>
              </Grid>
            </>
          )}
          <Grid item>
            <Button
              variant="contained"
              size="small"
              color=""
              onClick={() => navigate("/registers/jobs")}
            >
              Ver historial de clusters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* summary history */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Últimos clusters desplegados
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Nombre</TableCell>
                <TableCell>Fecha</TableCell>
                <TableCell>Nodos</TableCell>
                <TableCell>Trabajos guardados</TableCell>
                <TableCell>Estado</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {history.length > 0 ? (
                history.slice(0, 5).map((cluster, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{cluster.name}</TableCell>
                    <TableCell>{new Date(cluster.created_at).toLocaleString()}</TableCell>
                    <TableCell>{cluster.number_nodes}</TableCell>
                    <TableCell>{cluster.jobs.length}</TableCell>
                    <TableCell>
                      <Chip
                        label={cluster.shutdown_at ? "Dado de baja" : "Activo"}
                        color={cluster.shutdown_at ? "error" : "success"}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'No hay historial disponible.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
}
