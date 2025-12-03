import {
  Box,
  Grid,
  Typography,
  Container,
  Button,
  TextField,
  Paper,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
import { useAppContext } from "../context/AppContext";
import { jobsQueue, getJobInformation, removeSpecificJob, removeBatch } from "../utils/tauriApi";

function JobQueue() {
  const { clusterNodesConfig, sessionJobsSubmitted, setSessionJobsSubmitted, submitContainerName, setClusterActiveInfo } = useAppContext();
  const [jobId, setJobId] = useState("");
  const [batchName, setBatchName] = useState("");
  const [jobInfo, setJobInfo] = useState(null);
  const intervalRef = useRef(null)
  const [jobsData, setJobsData] = useState({
    timerequest: null,
    batches: [],
    totals: {total: 0, done: 0, running: 0, idle: 0, held: 0, suspended: 0},
  });
  
  useEffect(() => {
    //let interval;
    const fetchJobs = async () => {
      try {
        const jobs = await jobsQueue(submitContainerName, sessionJobsSubmitted);
        console.log("[RESPONSE jobs TRAB ENV SES]", jobs)
        setJobsData(jobs)
        
        const totals = jobs.totals;
        setClusterActiveInfo(prev => ({
          ...prev,
          jobsTotal: totals.total_jobs,
          jobsRunning: totals.run,
          jobsHeld: totals.held,
          jobsWaiting: totals.idle
        }));

        // update jobs of the session submitted to storage date-hour that job was sent
        if (jobs.batches?.length > 0) {
          const submittedMap = Object.fromEntries(
            jobs.batches.map((b) => [b.batch_name, b.submitted])
          );

          setSessionJobsSubmitted((prev) =>
            prev.map((job) =>
              submittedMap[job.batch_name]
                ? { ...job, submitted: submittedMap[job.batch_name] }
                : job
            )
          );
        } // else {
        //   console.log("without sessionJobsSubmitted (empty)")
        // }

        // if (jobs.totals.total_jobs === 0 && interval) {
        //   clearInterval(interval);
        //   interval = null;
        // }
      } catch (err) {
        console.error("[JobQueue] Error getting jobs:",err);
      }
    };

    if (!submitContainerName) {
      console.log("[JobQueue] No hay contenedor submit aún, acción: deplegar cluser");
      return;
    }

    fetchJobs();
    intervalRef.current = setInterval(fetchJobs, 15000);
    //interval = setInterval(fetchJobs, 15000); // then try with webSockets
    return () => clearInterval(intervalRef.current);
  }, [clusterNodesConfig]); // REVIEW THIS ----------------------------------------------

  // manage remove a specif job from a batch
  const handleDeleteJob = async () => {
    if (!jobId.trim()) {
      alert("Ingrese un ID de trabajo válido (ejemplo: 3.2)");
      return;
    }

    const validFormat = /^\d+\.\d+$/.test(jobId.trim());
    if (!validFormat) {
      alert("El ID debe tener el formato lote.trabajo (ejemplo: 3.2)");
      return;
    }

    if (!submitContainerName) {
      alert("No se encontró el nodo submit para eliminar el trabajo.");
      return;
    }

    if (!window.confirm(`¿Seguro que desea eliminar el trabajo ${jobId}?`)) return;

    try {
      const response = await removeSpecificJob(jobId.trim(), submitContainerName);
      alert(response.message || `Trabajo ${jobId} eliminado correctamente.`);
      setJobId("");
      setJobInfo(null);
    } catch (err) {
      console.error(err);
      alert(`Error al eliminar el trabajo: ${err.message}`);
    }
  };

  // remove all jobs from a batch
  const handleDeleteBatch = async () => {
    if (!submitContainerName) {
      alert("No se encontró el nodo submit.");
      return;
    }

    if (!window.confirm(`¿Eliminar todos los trabajos del lote "${batchName}"?`)) return;

    try {
      const response = await removeBatch(batchName, submitContainerName)
      alert(response.message || `Lote ${batchName} eliminado correctamente.`);
      setBatchName("");
    } catch (err) {
      alert(`Error al eliminar el lote: ${err.message}`);
    }
  };

  // manage show view more information about a specific job
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
    suspended: [],
    //done: [],
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
    { label: "Suspendidos", data: jobsByState.suspended },
    //{ label: "Finalizados", data: jobsByState.done }
  ];

  return (
    <Container maxWidth="md" sx={{ mt: 2, mx: "auto" }}>
      {/* jobs list panel */}
      <Typography variant="h6" sx={{ mb: 2 }}>
        Estado de la Cola de Trabajos
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
          <Box
            sx={{
              backgroundColor: "#fa5c5cff",
              color: "white",
              borderRadius: 1,
              p: 2,
              minHeight: 40,
              maxHeight: 50,
              textAlign: "center",
              mb: 1,
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              Total trabajos
            </Typography>
            <Typography variant="inherit" sx={{  }}>
              {jobsData.totals.total_jobs || 0}
            </Typography>
          </Box>
        </Grid>
      </Paper>

      {/** all batches */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h6">Lotes de Trabajos</Typography>
        {jobsData.batches.map((batch, idx) => {
          const ids = batch.job_ids.split(',').map(id => id.trim());
          const range_ids = ids[0];

          return (
            <Paper key={idx} sx={{ p: 2, mt: 1 }}>
              <Typography variant="subtitle1" marginBottom={1}>
                {batch.batch_name} - {batch.submitted} ({batch.initial_total} trabajos enviados)
              </Typography>
              <Typography variant="body2" marginBottom={1}>
                IDs del lote en cola: {range_ids} {/*Zona de prueba: {batch.job_ids}*/}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt:1 }}>
                {[
                  { label: "Total", value: batch.total, color:"#1976d2" },
                  { label: "Ejecutando", value: batch.run, color:"#2e7d32" },
                  { label: "Espera", value: batch.idle, color:"#ed6c02" },
                  { label: "Retenidos", value: batch.held, color:"#6d1b7b" },
                  { label: "Suspendidos", value: batch.suspended, color:"#fa5c5cff" },
                ].map((item,i)=>(
                  <Box key={i} sx={{
                    backgroundColor:item.color,
                    color:"white",
                    borderRadius:1,
                    px:1.5,
                    py:0.5,
                    fontSize:"0.8rem"
                  }}>
                    {item.label}: {item.value ?? 0}
                  </Box>
                ))}
              </Box>
            </Paper>
          );
        })}
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
        <Button variant="outlined" color="error" onClick={handleDeleteJob} sx={{ mr: 1 }}>
          Eliminar trabajo
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <TextField
          label="Nombre del lote"
          size="small"
          value={batchName}
          onChange={(e) => setBatchName(e.target.value)}
          sx={{ mr: 4 }}
        />
        <Button variant="outlined" color="error" onClick={handleDeleteBatch}>
          Eliminar lote
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