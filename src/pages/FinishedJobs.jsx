import {
  Box,
  Grid,
  Typography,
  Container,
  Paper,
  CircularProgress,
  Button,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  Chip,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { jobsResults, saveJob, downloadResults } from "../utils/tauriApi";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

export default function FinishedJobs() {
  const { sessionJobsSubmitted, token, submitContainerName, currentClusterId } = useAppContext();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [selectedBatchName, setSelectedBatchName] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadingBatch, setDownloadingBatch] = useState(null);

  
  const selectedBatch = batches.find((b) => b.batch_name === selectedBatchName) ?? null;

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        console.log("data enviada", sessionJobsSubmitted, submitContainerName)
        const results = await jobsResults(sessionJobsSubmitted, submitContainerName);
        
        setBatches(results);
      } catch (err) {
        console.error(err);
        toast.error("Error al cargar los resultados")
      } finally {
        setLoading(false);
      }
    };
    if (submitContainerName) fetchResults();
  }, [sessionJobsSubmitted, submitContainerName]);

  // transform batch in payload to backend
  const buildPayload = (batch) => {
    const results = (batch.executions || [])
      .flatMap((exec) =>
        (exec.results || []).map((r) => ({
          result: r.result,
        }))
      );

    return {
      universe: batch.universe,
      job_name: batch.batch_name,
      execution_date: batch.submitted,
      execution_total_time: batch.total_time,
      cluster_id: currentClusterId,
      results,
    };
  };

  const handleSaveJob = async (batch) => {
    setLoading(true)
    try {
      console.log("BATCH",batch)
      const payload = buildPayload(batch);
      await saveJob(payload);
      
      const result = await Swal.fire({
      title: 'Trabajo Guardado',
      text: `El trabajo con nombre de lote "${batch.batch_name}" ha sido guardado`,
      icon: 'success',
      confirmButtonColor: '#18b654ff',
      confirmButtonText: 'Entendido',
    });

    if (result.isConfirmed) {
      return
    } 
    } catch (err) {
      console.error(err);
      alert("Error saving job");
    } finally {
      setSavingId(null);
      setLoading(false);
    }
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // handle job downloads considering output type for download a selected job
  const handleDownloadResults = async (batchName) => {
    const jobInfo = sessionJobsSubmitted.find(
      (job) => job.batch_name === batchName
    );

    const outputType = jobInfo?.output_type

    if (!outputType) {
      await Swal.fire({
        title: "Error",
        text: "No se pudo determinar el tipo de salida del trabajo.",
        icon: "error",
        confirmButtonColor: "#e53935",
        confirmButtonText: "Entendido",
      });
      console.warn("Job encontrado:", jobInfo);
      return;
    }

    try {
      setDownloading(true);
      setDownloadingBatch(batchName);

      // loading download swal
      Swal.fire({
        title: "Preparando resultados...",
        text: "Por favor espera mientras se genera el archivo ZIP.",
        allowOutsideClick: false,
        allowEscapeKey: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      await sleep(3000);

      await downloadResults(batchName, outputType);

      //Swal.close();
      setDownloading(false);

      await Swal.fire({
        title: "Descarga finalizada",
        text: `El archivo con los resultados de "${batchName}" ha sido guardado en el directorio de Descargas.`,
        icon: "success",
        confirmButtonColor: "#18b654ff",
        confirmButtonText: "Entendido",
      });
    } catch (err) {
      console.error(err);
      toast.error("Error al descargar los resultados");
    } finally {
      setDownloadingBatch(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Resultados de Trabajos Finalizados
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress color="error" />
        </Box>
      ) : batches.length === 0 ? (
        <Typography variant="body2" sx={{ mt: 2 }}>
          No hay trabajos finalizados disponibles.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {/* left panel: list of batches */}
          <Grid item size={3.5} md={4}>
            <Paper sx={{ p: 2, height: "70vh", overflowY: "auto" }} elevation={3}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Trabajos ({batches.length})
              </Typography>
              <Divider sx={{ mb: 1 }} />

              <List disablePadding>
                {batches.map((batch) => (
                  <ListItemButton
                    key={batch.batch_name}
                    onClick={() => setSelectedBatchName(batch.batch_name)}
                    selected={selectedBatchName === batch.batch_name}
                    sx={{
                      mb: 1,
                      flexDirection: "column",
                      alignItems: "flex-start",
                      p: 1.25,
                    }}
                  >
                    <Box sx={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
                      <ListItemText
                        primary={
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: "bold", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            {batch.batch_name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {batch.submitted}
                          </Typography>
                        }
                      />
                      <Chip color="info" label={batch.universe} size="small" />
                    </Box>
                  </ListItemButton>
                ))}
              </List>
            </Paper>
          </Grid>

          {/* right panel: selected batch details */}
          <Grid item size="grow" md={8}>
            <Paper sx={{ p: 2, height: "70vh", display: "flex", flexDirection: "column" }} elevation={3}>
              {!selectedBatch ? (
                <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Typography variant="body1" color="text.secondary">
                    Selecciona un trabajo en la columna izquierda para ver sus resultados.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                      <Typography variant="h6">{selectedBatch.batch_name} </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Ejecuciones:</strong> {selectedBatch.number_jobs} - <strong>Tiempo:</strong> {selectedBatch.total_time} 
                      </Typography>
                    </Box>
                  </Box>

                  <Divider sx={{ mb: 1 }} />

                  <Box sx={{ flex: 1, overflowY: "auto", pr: 1 }}>
                    {selectedBatch.executions.length === 0 && (
                      <Typography variant="body2">Sin resultados</Typography>
                    )}

                    {selectedBatch.executions.map((exec, idx) => (
                      <Paper
                        key={idx}
                        sx={{
                          p: 1,
                          mb: 1,
                          backgroundColor: "#f7cbcbff",
                        }}
                      >
                        {exec.results.map((res, i) => (
                          <Box
                            key={i}
                            sx={{
                              backgroundColor: "white",
                              border: "1px solid #ccc",
                              borderRadius: 1,
                              p: 0.5,
                              mb: 0.5,
                              textAlign: "center",
                              fontSize: "0.8rem",
                              boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                            }}
                          >
                            {res.job}: {res.result}
                          </Box>
                        ))}
                      </Paper>
                    ))}
                  </Box>

                  {/* save job - download job */}
                  <Button
                    variant="contained"
                    color="error"
                    fullWidth
                    disabled={savingId === selectedBatch.batch_name}
                    onClick={() => handleSaveJob(selectedBatch)}
                    sx={{ mt: 2, alignSelf: "center", width: "40%"}}
                  >
                    {savingId === selectedBatch.batch_name ? "Guardando..." : "Guardar este trabajo"}
                  </Button>
                  <Button
                    variant="outlined"
                    color=""
                    fullWidth
                    sx={{ mt: 1, alignSelf: "center", width: "40%" }}
                    onClick={() => handleDownloadResults(selectedBatch.batch_name)}
                    disabled={downloading && downloadingBatch === selectedBatch.batch_name}
                  >
                    {downloading && downloadingBatch === selectedBatch.batch_name ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} color="primary" />
                        Preparando zip...
                      </>
                    ) : (
                      "Descargar resultados"
                    )}
                  </Button>

                </>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
