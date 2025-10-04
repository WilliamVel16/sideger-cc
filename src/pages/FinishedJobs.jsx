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
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { jobsResults, saveJob } from "../utils/tauriApi";

// parser de tiempo de ejecución desde el string
const parseExecutionTime = (resultText) => {
  if (!resultText) return null;
  const m = resultText.match(/execution time:\s*([\d.]+)/i);
  return m ? parseFloat(m[1]) : null;
};

export default function ResultadosLotes() {
  const { sessionJobsSubmitted, token } = useAppContext();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const data = await jobsResults(sessionJobsSubmitted);
        console.log(data.results)
        setBatches(data.results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, []);

  // transform batch in payload to backend
  const buildPayload = (batch) => {
    const results = (batch.executions || [])
      .flatMap((exec) =>
        (exec.results || []).map((r) => ({
          result: r.result,
          execution_time: parseExecutionTime(r.result),
        }))
      );

    const execTotal =
      results.reduce((acc, r) => acc + (r.execution_time || 0), 0) || null;

    return {
      universe: batch.id,
      job_name: batch.batch_name,
      execution_total_time: execTotal,
      results,
    };
  };

  const handleSaveJob = async (batch) => {
    const confirmSave = window.confirm(
      `¿Deseas guardar el trabajo "${batch.batch_name}" en la base de datos?`
    );
    if (!confirmSave) return;

    setSaving(true);
    try {
      const payload = buildPayload(batch);
      await saveJob(payload, token);
      alert("job saved");
    } catch (err) {
      console.error(err);
      alert("Error saving job");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 2, mx: "auto" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Resultados Generados
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress color="error" />
        </Box>
      ) : (
        <Grid container spacing={2} alignItems="flex-start">
          {batches.map((batch) => (
            <Grid item xs={12} sm={6} md={6} key={batch.id}>
              <Paper
                elevation={3}
                sx={{ p: 2, maxHeight: 450, overflowY: "auto" }}
              >
                <Accordion sx={{ boxShadow: "none" }} disableGutters>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-${batch.id}-content`}
                    id={`panel-${batch.id}-header`}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      {batch.batch_name} - Trabajos enviados: {batch.number_jobs}  - Tiempo total: {batch.total_time}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, fontWeight: "bold" }}
                    >
                      Ejecuciones:
                    </Typography>
                    {batch.executions.map((exec, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          border: "1px solid #ddd",
                          borderRadius: 1,
                          p: 1,
                          mb: 1,
                          backgroundColor: "#f7cbcbff",
                        }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                          Tiempo de ejecución: {exec.time}
                        </Typography>

                        <Box sx={{ mt: 1 }}>
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
                        </Box>
                      </Box>
                    ))}

                    {/* button to save the job */}
                    <Button
                      variant="contained"
                      color="error"
                      fullWidth
                      disabled={saving}
                      onClick={() => handleSaveJob(batch)}
                      sx={{ mt: 2 }}
                    >
                      {saving ? "Guardando..." : "Guardar este trabajo"}
                    </Button>
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
