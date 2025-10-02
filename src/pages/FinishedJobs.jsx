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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { jobsResults } from "../utils/tauriApi";

export default function ResultadosLotes() {
  const { sessionJobsSubmitted } = useAppContext();
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const { data } = await jobsResults(sessionJobsSubmitted);
        console.log(data)
        setBatches(data)
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);
    

  return (
    <Container maxWidth="md" sx={{ mt: 2, mx: "auto" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Resultados Generados
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress color="red" />
        </Box>
      ) : (
        // grid of results
        <Grid container spacing={2}>
          {batches.map((batch) => (
            <Grid item xs={12} sm={6} md={6} key={batch.id} sx={{ minWidth: 400 }}>
              <Paper elevation={3} sx={{ p: 2}}>
                <Accordion sx={{ boxShadow: "none" }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-${batch.id}-content`}
                    id={`panel-${batch.id}-header`}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Lote {batch.batch_name} - Tiempo total {batch.total_time}
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