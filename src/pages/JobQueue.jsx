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
import { jobsQueue } from "../utils/tauriApi";

function JobQueue() {
  const { clusterNodesConfig } = useAppContext();
  const [jobsData, setJobsData] = useState({
    total: [],
    done: [],
    run: [],
    held: [],
    idle: [],
  });
  const [jobId, setJobId] = useState("");
  const [jobInfo, setJobInfo] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      //find the node with submit role
      const submitContainer = clusterNodesConfig
        .filter(node => node.container_name.startsWith("sub_"))
        .map(node => node.container_name);

      try {
        const data = await jobsQueue(submitContainer[0]);
        const jobs = data.jobs;

        const done = jobs.filter(j => j.JobStatus === 4);
        const run = jobs.filter(j => j.JobStatus === 2);
        const held = jobs.filter(j => j.JobStatus === 5);
        const idle = jobs.filter(j => j.JobStatus === 1);

        setJobsData({
          total: jobs,
          done,
          run,
          held,
          idle,
        });
      } catch (err) {
        console.error(err);
      }
    };

    const interval = setInterval(fetchJobs, 5000); // then try with webSockets
    return () => clearInterval(interval);
  }, []);

  const tempData = [
            { label: "Enviados", data: jobsData.total },
            { label: "Finalizados", data: jobsData.done },
            { label: "En ejecución", data: jobsData.run },
            { label: "Retenidos", data: jobsData.held },
            { label: "En espera", data: jobsData.idle },
  ]

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
    const jobFound = jobsData.total.find((j) => j.id === jobId);
    if (jobFound) {
      setJobInfo({
        id: jobId,
        estado: "En ejecución",
        nodo: "Nodo-01",
        descripcion: "Este es un trabajo de prueba para mostrar información",
      });
    } else {
      setJobInfo(null);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2, mx: "auto" }}>
      {/* jobs list panel */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Lista de Trabajos
      </Typography>

      <Paper center elevation={3} sx={{ p: 2, mb: 4 }}>
        <Grid container margin={2} spacing={2} justifyContent={"center"} sx={{ display: "flex" }}>
          {tempData.map((col, idx) => (
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
                  {col.label}
                </Typography>
                <Typography variant="inherit" sx={{  }}>
                  {col.data.length}
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
                {col.data.map((job) => (
                  <Box
                    key={job.id}
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

      {/* control panel */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Panel de Control
      </Typography>

      <Grid container direction={"column"} justifyContent={"center"} spacing={2}>
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2  }} >
            <Typography variant="body1" sx={{ flex: 1 }}>
              Cancelar todos los trabajos de la cola
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={handleCancelAll}
            >
              Cancelar
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body1" sx={{ flex: 1 }}>
              Ingresa el ID del trabajo
            </Typography>
            <TextField
              label="ID del trabajo"
              size="small"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
            />
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body1" sx={{ flex: 1 }}>
              Eliminar el trabajo de la lista
            </Typography>
            <Button variant="outlined" color="error" onClick={handleDeleteJob}>
              Eliminar
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body1" sx={{ flex: 1 }}>
              Ver en qué nodo se ejecuta el trabajo
            </Typography>
            <Button variant="outlined" color="black" onClick={handleCheckNode}>
              Consultar
            </Button>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 2, display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body1" sx={{ flex: 1 }}>
              Ver más información del trabajo
            </Typography>
            <Button variant="outlined" color="black" onClick={handleViewInfo}>
              Consultar
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* view more */}
      {jobInfo && (
        <Box
          sx={{
            mt: 3,
            p: 2,
            border: "1px solid #ccc",
            borderRadius: 1,
            backgroundColor: "#f7cbcbff",
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            Información del Trabajo ID: {jobInfo.id}
          </Typography>
          <Typography variant="body2">Estado: {jobInfo.estado}</Typography>
          <Typography variant="body2">Nodo: {jobInfo.nodo}</Typography>
          <Typography variant="body2">
            Descripción: {jobInfo.descripcion}
          </Typography>
        </Box>
      )}
    </Container>
  );
}

export default JobQueue;