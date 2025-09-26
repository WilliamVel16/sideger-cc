import {
  Box,
  Grid,
  Typography,
  Container,
  Button,
  TextField,
  Paper,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { jobsQueue } from "../utils/tauriApi";

function JobQueue() {
  const { clusterNodesConfig } = useAppContext();
  const [jobId, setJobId] = useState("");
  const [jobInfo, setJobInfo] = useState(null);
  const [jobsData, setJobsData] = useState({
    timerequest: null,
    batches: [],
    totals: {total: 0, done: 0, running: 0, idle: 0, held: 0},
  });
  
  useEffect(() => {
    let interval;
    const fetchJobs = async () => {
      //find the node with submit role
      const submitContainer = clusterNodesConfig
        .filter(node => node.container_name.startsWith("sub_"))
        .map(node => node.container_name);

      try {
        const data = await jobsQueue(submitContainer[0]);
        console.log(data.jobs)
        setJobsData(data.jobs)

        if (data.totals.total_jobs === 0) {
          clearInterval(interval);
          interval = null;
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchJobs();
    interval = setInterval(fetchJobs, 15000); // then try with webSockets
    return () => clearInterval(interval);
  }, [clusterNodesConfig]); // REVIEW THIS


  const handleCancelAll = () => {
    console.log("Cancelar todos los trabajos");
  };

  const handleDeleteJob = () => {
    console.log("Eliminar trabajo ID:", jobId);
  };

  const handleCheckNode = () => {
    console.log("Consultar nodo de trabajo ID:", jobId);
  };

  const handleViewInfo = () => {
    // search job id for evey batch
    let found = null;
    for (const batch of jobsData.batches) {
      found = batch.jobs.find(j => j.job_id === jobId);
      if (found) break;
    }

    if (found) {
      setJobInfo({
        id: found.job_id,
        estado: found.status,
        nodo: found.node || "Nodo desconocido",
        descripcion: `Trabajo ${found.job_id} en lote ${found.batch_name}`,
      });
    } else {
      setJobInfo(null);
    }
  };

  // jobs by state and build job id with returned data
  const jobsByState = {
    run: [],
    idle: [],
    held: [],
    done: [],
    //suspended: [],
  };
  jobsData.batches.forEach(batch => {
    batch.jobs.forEach(job => {
      const state = job.status.toLowerCase();
      if (jobsByState[state]) {
        jobsByState[state].push({
        id: `${job.cluster_id}.${job.proc_id}`,
        batch: batch.batch_name,
      });
      }
    });
  });

  const dataToShow = [
    { label: "En ejecución", data: jobsByState.run },
    { label: "En espera", data: jobsByState.idle },
    { label: "Retenidos", data: jobsByState.held },
    { label: "Finalizados", data: jobsByState.done },
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 2, mx: "auto" }}>
      {/* jobs list panel */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Estado de la cola de Trabajos
      </Typography>

      {jobsData.timerequest && (
        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
          Ultima actualización: {new Date(jobsData.timerequest).toLocaleString()}
        </Typography>
      )}

      {/** totals */}
      <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
        <Grid container margin={2} spacing={2} justifyContent={"center"} sx={{ display: "flex" }}>
          {dataToShow.map((item, idx) => (
            <Grid key={idx} item xs={12} md  sx={{ flex: 1 }}>
              <Box
                sx={{
                  backgroundColor: "#fa5c5cff",
                  color: "white",
                  borderRadius: 1,
                  p: 2,
                  minHeight: 40,
                  textAlign: "center",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                  {item.label}
                </Typography>
                <Typography variant="inherit" sx={{  }}>
                  {item.data.length}
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: "#f7cbcbff",
                  borderRadius: 1,
                  p: 1,
                  minHeight: 200,
                  maxHeight: 300,
                  overflowY: "auto",
                }}
              >
                {item.data.map((job, jdx) => (
                  <Box
                    key={`${job.id}-${jdx}`}
                    sx={{
                      backgroundColor: "white",
                      border: "1px solid #ccc",
                      borderRadius: 1,
                      p: 0.5,
                      mb: 0.5,
                      textAlign: "center",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                      fontSize: "0.8rem",
                    }}
                  >
                    {job.id}
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/** all batches */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Batches de trabajos</Typography>
        {jobsData.batches.map((batch, idx) => (
          <Paper key={idx} sx={{ p: 2, mt: 1 }}>
            <Typography variant="subtitle1">
              {batch.batch_name} — Total: {batch.total} (Ejecutando: {batch.running}, Espera: {batch.idle})
            </Typography>
            <ul>
              {batch.jobs.map(job => (
                <li key={job.job_id}>
                  Job {job.job_id} — Estado: {job.status}
                </li>
              ))}
            </ul>
          </Paper>
        ))}
      </Box>

      {/** control panel */}
      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Panel de Control
      </Typography>

      <Box sx={{ mt: 4 }}>
        <TextField
          label="ID del Trabajo"
          size="small"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          sx={{ mr: 4 }}
        />
        <Button variant="outlined" color="" onClick={handleViewInfo} sx={{ mr: 1 }}>
          Ver más información
        </Button>
        <Button variant="outlined" color="" onClick={handleCheckNode} sx={{ mr: 1 }}>
          Consultar Nodo
        </Button>
        <Button variant="outlined" color="error" onClick={handleDeleteJob} >
          Eliminar Trabajo
        </Button>
      </Box>

      {jobInfo && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6">Información del Trabajo</Typography>
          <Typography>ID: {jobInfo.id}</Typography>
          <Typography>Estado: {jobInfo.estado}</Typography>
          <Typography>Nodo: {jobInfo.nodo}</Typography>
          <Typography>Descripción: {jobInfo.descripcion}</Typography>
        </Paper>
      )}
    </Container>
  );
}

export default JobQueue;