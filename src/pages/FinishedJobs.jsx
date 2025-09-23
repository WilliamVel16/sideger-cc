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

function FinishedJobs() {

  return (
    <Container maxWidth="md" sx={{ mt: 2, mx: "auto" }}>
      <Typography>
          Trabajos terminados
      </Typography>
    </Container>
  )
}

export default FinishedJobs;