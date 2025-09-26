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

export default function ResultadosLotes() {
  const { state } = useAppContext();
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    // fetch("/api/lotes")  // aquí irá tu endpoint real
    //   .then(res => res.json())
    //   .then(data => setLotes(data))
    //   .finally(() => setLoading(false));

    setTimeout(() => {
      setLotes([
        {
          id: 1,
          nombre: "analisis1",
          ejecuciones: [
            {
              tiempo: "170s",
              resultados: [
                { trabajo: "ejecución 1", resultado: "23" },
                { trabajo: "ejecución 2", resultado: "8" },
              ],
            },
          ],
        },
        {
          id: 2,
          nombre: "analisis2",
          ejecuciones: [
            {
              tiempo: "224s",
              resultados: [
                { trabajo: "trabajo id 3.1", resultado: "5,8" },
                { trabajo: "trabajo id 3.2", resultado: "9" },
                { trabajo: "trabajo id 3.3", resultado: "7" },
              ],
            },
          ],
        },
        {
          id: 3,
          nombre: "python-file",
          ejecuciones: [
            {
              tiempo: "22s",
              resultados: [
                { trabajo: "trabajo 4.1", resultado: "235,89" },
                { trabajo: "trabajo 4.2", resultado: "234,67" },
                { trabajo: "trabajo 4.3", resultado: "234,66" },
              ],
            },
          ],
        },
      ]);
      setLoading(false);
    }, 1000);
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
          {lotes.map((lote) => (
            <Grid item xs={12} sm={6} md={6} key={lote.id} sx={{ minWidth: 400 }}>
              <Paper elevation={3} sx={{ p: 2}}>
                <Accordion sx={{ boxShadow: "none" }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-${lote.id}-content`}
                    id={`panel-${lote.id}-header`}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Lote {lote.nombre}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography
                      variant="body2"
                      sx={{ mb: 1, fontWeight: "bold" }}
                    >
                      Ejecuciones:
                    </Typography>
                    {lote.ejecuciones.map((exec, idx) => (
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
                          Tiempo de ejecución: {exec.tiempo}
                        </Typography>

                        <Box sx={{ mt: 1 }}>
                          {exec.resultados.map((res, i) => (
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
                              {res.trabajo}: {res.resultado}
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