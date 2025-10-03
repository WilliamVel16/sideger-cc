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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useState, useEffect } from "react";
import { getUserJobs } from "../utils/tauriApi";

export default function StoragedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      try {
        const { jobs } = await getUserJobs();
        setJobs(jobs);
      } catch (err) {
        console.error("Error charging storaged jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 2, mx: "auto" }}>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Mis Trabajos Guardados
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : (
        <Grid container spacing={2}>
          {jobs.map((job) => (
            <Grid item xs={12} sm={6} md={6} key={job.id} sx={{ minWidth: 400 }}>
              <Paper elevation={3} sx={{ p: 2 }}>
                <Accordion sx={{ boxShadow: "none" }}>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel-${job.id}-content`}
                    id={`panel-${job.id}-header`}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
                      Lote {job.batch_name}
                    </Typography>
                    <Chip
                      label={job.status}
                      size="small"
                      color={job.status === "completed" ? "success" : "warning"}
                      sx={{ ml: 2 }}
                    />
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2">
                      Tipo de salida: <b>{job.output_type}</b>
                    </Typography>
                    <Typography variant="body2">
                      Creado: {new Date(job.created_at).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      Tiempo total: {job.total_time ?? "N/A"}
                    </Typography>
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
