import {
  Box,
  Grid,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Chip,
  Button,
  MenuItem,
  IconButton,
  Select,
  Stack,
  List,
  ListItemButton,
  ListItemText,
  Divider,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
  getUserClusters,
  deleteCluster,
  deleteJob,
  deleteResult,
} from "../utils/tauriApi";

export default function StoragedJobs() {
  const [clusters, setClusters] = useState([]);
  const [selectedClusterId, setSelectedClusterId] = useState("");
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchClusters = async () => {
      setLoading(true);
      try {
        const data = await getUserClusters();
        console.log(data)
        setClusters(data);
      } catch (err) {
        console.error("Error cargando clusters:", err);
        toast.error(`Error al cargar clusters: ${err}`);
      } finally {
        setLoading(false);
      }
    };
    fetchClusters();
  }, []);

  const selectedCluster = clusters.find((c) => c.id === Number(selectedClusterId)) ?? null;
  const selectedJob = selectedCluster?.jobs?.find((j) => j.id === Number(selectedJobId)) ?? null;

  // handle to delete a specific cluster
  const handleClusterDelete = async (clusterId) => {
    const result = await Swal.fire({
      title: "¿Eliminar este cluster?",
      text: "Esto eliminará todos los trabajos y resultados asociados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (result.isConfirmed) {
      try {
        await deleteCluster(clusterId);
        setClusters((prev) => prev.filter((c) => c.id !== clusterId));
        setSelectedClusterId("");
        setSelectedJobId(null);
        toast.success("Cluster eliminado correctamente");
      } catch (err) {
        toast.error("Error eliminando cluster");
      }
    }
  };

  const handleJobDelete = async (clusterId, jobId) => {
    const result = await Swal.fire({
      title: "¿Eliminar este trabajo?",
      text: "Los resultados también serán eliminados.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
    });

    if (result.isConfirmed) {
      try {
        await deleteJob(jobId);
        setClusters((prev) =>
          prev.map((cluster) =>
            cluster.id === clusterId
              ? { ...cluster, jobs: cluster.jobs.filter((j) => j.id !== jobId) }
              : cluster
          )
        );
        if (selectedJobId === jobId) setSelectedJobId(null);
        toast.success("Trabajo eliminado");
      } catch (err) {
        toast.error("Error eliminando trabajo");
      }
    }
  };

  const handleResultDelete = async (clusterId, jobId, resultId) => {
    const result = await Swal.fire({
      title: "¿Eliminar este resultado?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Eliminar",
    });

    if (result.isConfirmed) {
      try {
        await deleteResult(resultId);
        setClusters((prev) =>
          prev.map((cluster) =>
            cluster.id === clusterId
              ? {
                  ...cluster,
                  jobs: cluster.jobs.map((job) =>
                    job.id === jobId
                      ? {
                          ...job,
                          results: job.results.filter((r) => r.id !== resultId),
                        }
                      : job
                  ),
                }
              : cluster
          )
        );
        toast.success("Resultado eliminado");
      } catch (err) {
        toast.error("Error eliminando resultado");
      }
    }
  };

  return (
    <Container spacing={3} maxWidth="lg" sx={{ mt: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Gestión de Clusters y Trabajos Guardados
      </Typography>

      {/* select + actions */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={3} sx={{ mb: 3 }}>
        <Select
          value={selectedClusterId}
          onChange={(e) => {
            setSelectedClusterId(e.target.value);
            setSelectedJobId(null); // reset job selection when changes the cluster
          }}
          displayEmpty
          sx={{ minWidth: 320 }}d
        >
          <MenuItem value="" disabled>
            Selecciona un cluster
          </MenuItem>
          {clusters.map((cluster) => (
            <MenuItem key={cluster.id} value={cluster.id}>
              {cluster.name}
            </MenuItem>
          ))}
        </Select>

        {selectedClusterId && (
          <Box 
            sx={{
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            alignItems: { xs: "flex-start", sm: "center" },
            justifyContent: "space-between",
            flexGrow: 1,
            gap: 2,
          }}>
            <Stack
              direction={{ xs: "column", sm: "column" }}
              sx={{ flexWrap: "wrap" }}
            >
              <Typography variant="body" color="text.secondary" >
                <strong>Creado:</strong> {new Date(selectedCluster.created_at).toLocaleString()}
              </Typography>
              <Typography variant="body" color="text.secondary" >
                <strong>Detenido:</strong> {new Date(selectedCluster.shutdown_at).toLocaleString()}
              </Typography>
              <Typography variant="body" color="text.secondary" >
                <strong>Nodos utilizados:</strong> {selectedCluster.number_nodes}
              </Typography>
            </Stack>

            <Button
              variant="outlined"
              color="error"
              onClick={() => handleClusterDelete(selectedClusterId)}
              sx={{ whiteSpace: "nowrap" }}
            >
              Eliminar Cluster
            </Button>
          </Box>
        )}

        
      </Stack>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : selectedCluster ? (
        <Grid container spacing={3} >
          {/* left - jobs list */}
          <Grid item size={3.5}  md={4}>
            <Paper sx={{ p: 2, height: "70vh", overflowY: "auto" }} elevation={3}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Trabajos ({selectedCluster.jobs.length})
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <List disablePadding>
                {selectedCluster.jobs.map((job) => (
                  <ListItemButton
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    selected={Number(selectedJobId) === job.id}
                    sx={{
                      mb: 1,
                      alignItems: "stretch",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      p: 1.25,
                    }}
                  >
                    <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", gap: 1 }}>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle1" sx={{ fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {job.job_name} 
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body" sx={{ display: "block", color: "text.secondary" }}>
                            {new Date(job.execution_date).toLocaleString()}
                          </Typography>
                        }
                        
                      />
                      <Chip color="info" label={job.universe} size="small" sx={{ alignSelf: "start" }} />
                    </Box>

                    <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                      <Typography variant="body" >{job.results.length} Resultados</Typography>
                      <IconButton
                        size="medium"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation(); // to can delete the job inside of the list
                          handleJobDelete(selectedCluster.id, job.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* right - results of the selected job */}
          <Grid item size="grow"  md={8}>
            <Paper sx={{ p: 2, height: "70vh", display: "flex", flexDirection: "column" }} elevation={3}>
              {!selectedJob ? (
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography variant="body1" color="text.secondary">
                    Selecciona un trabajo en la columna izquierda para ver sus resultados.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box direction={"column"}>
                      <Typography variant="h6">{selectedJob.job_name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Ejecutado:</strong> {new Date(selectedJob.execution_date).toLocaleString()} <strong>Tiempo:</strong> {selectedJob.execution_total_time ?? "N/A"}
                      </Typography>
                    </Box>

                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Resultados del trabajo: {selectedJob.results.length}
                    </Typography>
                  </Box>

                  <Divider sx={{ mb: 1 }} />

                  <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
                    {selectedJob.results.length === 0 && (
                      <Typography variant="body2">Sin resultados</Typography>
                    )}

                    {selectedJob.results.map((r) => (
                      <Paper
                        key={r.id}
                        sx={{
                          p: 1,
                          mb: 1,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            //space to buttons
                          }}
                          title={r.result}
                        >
                          {r.result}
                        </Typography>

                        <Box>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleResultDelete(selectedCluster.id, selectedJob.id, r.id)}
                          >
                            Eliminar
                          </Button>
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      ) : (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Selecciona un cluster para ver sus trabajos.
        </Typography>
      )}
    </Container>
  );
}