import {
  Box,
  Grid,
  Typography,
  Container,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  CircularProgress,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState, useEffect } from "react";
import { getUserClusters, getClusterJobs, getJobResults } from "../utils/tauriApi";

export default function UserClusters() {
  const [clusters, setClusters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedCluster, setExpandedCluster] = useState(null);
  const [clusterJobs, setClusterJobs] = useState({});
  const [jobResults, setJobResults] = useState({});
  const [loadingJobs, setLoadingJobs] = useState({});
  const [loadingResults, setLoadingResults] = useState({});

  // Load clusters once
  useEffect(() => {
    const fetchClusters = async () => {
      setLoading(true);
      try {
        const { clusters } = await getUserClusters();
        setClusters(clusters);
      } catch (err) {
        console.error("Error loading clusters:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClusters();
  }, []);

  const handleClusterExpand = async (clusterId) => {
    if (expandedCluster === clusterId) {
      setExpandedCluster(null);
      return;
    }
    setExpandedCluster(clusterId);

    // lazy load jobs for cluster
    if (!clusterJobs[clusterId]) {
      setLoadingJobs((prev) => ({ ...prev, [clusterId]: true }));
      try {
        const { jobs } = await getClusterJobs(clusterId);
        setClusterJobs((prev) => ({ ...prev, [clusterId]: jobs }));
      } catch (err) {
        console.error("Error loading jobs for cluster:", err);
      } finally {
        setLoadingJobs((prev) => ({ ...prev, [clusterId]: false }));
      }
    }
  };

  const handleJobExpand = async (jobId) => {
    // lazy load results for job
    if (!jobResults[jobId]) {
      setLoadingResults((prev) => ({ ...prev, [jobId]: true }));
      try {
        const { results } = await getJobResults(jobId);
        setJobResults((prev) => ({ ...prev, [jobId]: results }));
      } catch (err) {
        console.error("Error loading job results:", err);
      } finally {
        setLoadingResults((prev) => ({ ...prev, [jobId]: false }));
      }
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Mis Clusters Desplegados
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {clusters.map((cluster) => (
            <Grid item xs={12} key={cluster.id}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Accordion
                  expanded={expandedCluster === cluster.id}
                  onChange={() => handleClusterExpand(cluster.id)}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {cluster.name}
                    </Typography>
                    <Chip
                      label={`${cluster.number_nodes ?? 0} nodos`}
                      size="small"
                      color="primary"
                      sx={{ ml: 2 }}
                    />
                  </AccordionSummary>

                  <AccordionDetails>
                    <Typography variant="body2">
                      Creado: {new Date(cluster.created_at).toLocaleString()}
                    </Typography>
                    {cluster.shutdown_at && (
                      <Typography variant="body2">
                        Apagado: {new Date(cluster.shutdown_at).toLocaleString()}
                      </Typography>
                    )}

                    <Divider sx={{ my: 2 }} />

                    {loadingJobs[cluster.id] ? (
                      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                        <CircularProgress size={24} />
                      </Box>
                    ) : (
                      <>
                        <Typography variant="subtitle2" sx={{ mb: 1 }}>
                          Trabajos del cluster:
                        </Typography>
                        {(clusterJobs[cluster.id] ?? []).length === 0 ? (
                          <Typography variant="body2" color="text.secondary">
                            No hay trabajos registrados.
                          </Typography>
                        ) : (
                          (clusterJobs[cluster.id] ?? []).map((job) => (
                            <Accordion
                              key={job.id}
                              sx={{ boxShadow: "none", border: "1px solid #eee", mb: 1 }}
                              onChange={() => handleJobExpand(job.id)}
                            >
                              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                <Typography variant="body2">
                                  {job.job_name}
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails>
                                <Typography variant="body2">
                                  Universo: {job.universe}
                                </Typography>
                                <Typography variant="body2">
                                  Fecha: {new Date(job.execution_date).toLocaleString()}
                                </Typography>
                                <Typography variant="body2">
                                  Tiempo total: {job.execution_total_time ?? "N/A"}
                                </Typography>

                                <Divider sx={{ my: 1 }} />

                                <Typography variant="subtitle2">Resultados:</Typography>
                                {loadingResults[job.id] ? (
                                  <CircularProgress size={20} />
                                ) : (jobResults[job.id] ?? []).length === 0 ? (
                                  <Typography variant="body2" color="text.secondary">
                                    No hay resultados disponibles.
                                  </Typography>
                                ) : (
                                  <List dense>
                                    {jobResults[job.id].map((res) => (
                                      <ListItem key={res.id}>
                                        <ListItemText primary={res.result} />
                                      </ListItem>
                                    ))}
                                  </List>
                                )}
                              </AccordionDetails>
                            </Accordion>
                          ))
                        )}
                      </>
                    )}
                  </AccordionDetails>
                </Accordion>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}
