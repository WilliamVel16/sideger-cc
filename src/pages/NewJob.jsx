import {
  Box,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  Container,
  ListItemText,
  Select,
  MenuItem,
  FormControl,
  FormGroup,
  TextField,
  FormControlLabel,
  InputLabel,
  IconButton,
  Button,
  Switch,
  Tooltip,
} from "@mui/material";
import { useState } from "react";
import UploadIcon from "@mui/icons-material/Upload";

function NewJob() {
  // files status
  const [inputFiles, setInputFiles] = useState([]);
  const [shouldTransferFiles, setShouldTransferFiles] = useState(true);
  const [whenToTransferOutput, setWhenToTransferOutput] = useState("ON_EXIT");
  // job data status
  const [jobType, setJobType] = useState("script");
  const [universe, setUniverse] = useState("vanilla");
  const [executable, setExecutable] = useState("");
  const [argumentsStr, setArgumentsStr] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [log, setLog] = useState("");
  const [queueCount, setQueueCount] = useState(1);
  // job requeriments status
  const [cpus, setCpus] = useState(1);
  const [memory, setMemory] = useState("512M");
  const [disk, setDisk] = useState("1G");
  const [osRequirement, setOsRequirement] = useState("LINUX");

  const handleFileChange = (e) => {
    setInputFiles(Array.from(e.target.files));
  };

  const handleNewJob = async () => {
    const fileNames = inputFiles.map((file) => file.name).join(", ");

    let classAd = `
      universe = ${universe}
      executable = ${executable}
      log = ${log}
      output = ${output}
      error = ${error}
    `;

    if (jobType === "args" || jobType === "advanced") {
      classAd += `\narguments = ${argumentsStr}`;
    }

    if (jobType === "files" || jobType === "advanced") {
      const fileNames = inputFiles.map((file) => file.name).join(", ");
      classAd += `\ninput = ${input}`;
      classAd += `\ntransfer_input_files = ${fileNames}`;
    }

    if (jobType === "advanced") {
      classAd += `\nrequest_cpus = ${cpus}`;
      classAd += `\nrequest_memory = ${memory}`;
      classAd += `\nrequest_disk = ${disk}`;
      classAd += `\nrequirements = (OpSys == "${osRequirement}")`;
    }

    classAd += `\nshould_transfer_files = ${shouldTransferFiles ? "YES" : "NO"}`;
    classAd += `\nwhen_to_transfer_output = ${whenToTransferOutput}`;
    classAd += `\nqueue ${queueCount}`;


    console.log("generated classAd:\n", classAd);
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 2, mx: "auto" }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {/** information abouot the page */}
        <Grid item size={{ xs: 6, md: 12 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Información
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            En esta sección tienes la opción de subir archivos y encontrarás una
            plantilla en donde debes establecer los requerimientos para le
            ejecución de tu trabajo.
          </Typography>
        </Grid>

        <Grid item size={{ xs: 6, md: 12 }}>
          <Grid
            container
            spacing={2}
            direction={"row"}
            sx={{ alignItems: "stretch", justifyContent: "space-around" }}
          >

            {/** load files and type of job */}
            <Grid item size={{ xs: 12, md: 2.5 }}>
              <Typography variant="h6"> Tipo de Trabajo </Typography>

              <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                <InputLabel>Tipo de Trabajo</InputLabel>
                <Select
                  value={jobType}
                  label="Tipo de Trabajo"
                  onChange={(e) => setJobType(e.target.value)}
                >
                  <MenuItem value="script">Script</MenuItem>
                  <MenuItem value="script-files">Script con Archivos</MenuItem>
                  <MenuItem value="args">Con Argumentos</MenuItem>
                  <MenuItem value="files">Con Archivos de Entrada</MenuItem>
                  <MenuItem value="advanced">Avanzado</MenuItem>
                </Select>
              </FormControl>

              {(jobType === "files" || jobType === "script" || jobType === "script-files") && (
                <>
                <Button
                  component="label"
                  variant="outlined"
                  startIcon={<UploadIcon />}
                  sx={{ mt: 3 }}
                >
                  Seleccionar Archivos
                  <input
                    hidden
                    multiple
                    type="file"
                    onChange={handleFileChange}
                  />
                </Button>
                <Box sx={{ mt: 1 }}>
                  {inputFiles.length > 0 &&
                    inputFiles.map((file, i) => (
                      <Typography key={i} variant="body2">
                        {file.name}
                      </Typography>
                    ))}
                </Box>
                <FormGroup sx={{ mt: 2 }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={shouldTransferFiles}
                        onChange={() => setShouldTransferFiles((prev) => !prev)}
                      />
                    }
                    label="Transferir archivos"
                  />
                </FormGroup>
                </>
              )}

            </Grid>

            {/** data about the job*/}
            <Grid item size={{ xs: 12, md: 4 }}>
              <Typography variant="h6"> Trabajo </Typography>
              <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                <InputLabel>Universo</InputLabel>
                <Select
                  value={universe}
                  label="Universo"
                  onChange={(e) => setUniverse(e.target.value)}
                >
                  <MenuItem value={"vanilla"}>Vanilla</MenuItem>
                  <MenuItem value={"docker"}>Docker</MenuItem>
                  <MenuItem value={"scheduler"}>Scheduler</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="Ejecutable"
                fullWidth
                size="small"
                sx={{ mt: 2 }}
                value={executable}
                onChange={(e) => setExecutable(e.target.value)}
              />

              {(jobType === "args" || jobType === "advanced" || jobType === "script-files") && (
                <TextField
                  label="Argumentos"
                  fullWidth
                  size="small"
                  sx={{ mt: 2 }}
                  value={argumentsStr}
                  onChange={(e) => setArgumentsStr(e.target.value)}
                />
              )}

              {(jobType === "files" || jobType === "advanced" || jobType === "script-files") && (
                <>
                  <TextField
                    label="Archivo de entrada"
                    fullWidth
                    size="small"
                    sx={{ mt: 2 }}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                  />
                  {/* se mantiene el cargador de archivos */}
                </>
              )}

              <TextField
                label="Instancias a ejecutar"
                type="number"
                fullWidth
                size="small"
                sx={{ mt: 2 }}
                value={queueCount}
                onChange={(e) => setQueueCount(e.target.value)}
              />
            </Grid>

            {/** job's requirements (computing power) */}
            <Grid item size={{ xs: 12, md: 4 }}>
              <Typography variant="h6"> Requerimietnos </Typography>
              <TextField
                label="CPUs"
                type="number"
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                value={cpus}
                onChange={(e) => setCpus(e.target.value)}
              />
              <TextField
                label="Memoria RAM (ej: 1M)"
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
              />
              <TextField
                label="Disco (ej: 1G)"
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                value={disk}
                onChange={(e) => setDisk(e.target.value)}
              />
              
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item size={12}>
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button
            variant="contained"
            color="black"
            onClick={handleNewJob}
            disabled="true"
          >
            Ejecutar Trabajo
          </Button>
        </Box>
      </Grid>
    </Container>
  );
}

export default NewJob;
