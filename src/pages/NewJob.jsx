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
  const [memory, setMemory] = useState("512MB");
  const [disk, setDisk] = useState("1GB");
  const [osRequirement, setOsRequirement] = useState("LINUX");

  const handleFileChange = (e) => {
    setInputFiles(Array.from(e.target.files));
  };

  const handleNewJob = async () => {
    const fileNames = inputFiles.map((file) => file.name).join(", ");

    const classAd = `
universe = ${universe}
executable = ${executable}
arguments = ${argumentsStr}
input = ${input}
output = ${output}
error = ${error}
log = ${log}
should_transfer_files = ${shouldTransferFiles ? "YES" : "NO"}
transfer_input_files = ${fileNames}
when_to_transfer_output = ${whenToTransferOutput}

request_cpus = ${cpus}
request_memory = ${memory}
request_disk = ${disk}
requirements = (OpSys == "${osRequirement}")

queue ${queueCount}
    `.trim();

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
            {/** load files */}
            <Grid item size={{ xs: 12, md: 2.5 }}>
              <Typography variant="h6"> Archivos </Typography>
              <Button
                component="label"
                variant="outlined"
                startIcon={<UploadIcon />}
                sx={{ mt: 1 }}
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
              <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                <InputLabel> Cuando transferir salida </InputLabel>
                <Select
                  value={whenToTransferOutput}
                  label="Cuando transferir salida"
                  onChange={(e) => setWhenToTransferOutput(e.target.value)}
                >
                  <MenuItem value={"ON_EXIT"}> Al salir </MenuItem>
                  <MenuItem value={"ON_SUCCESS"}> Al tener éxito </MenuItem>
                  <MenuItem value={"ON_ERROR"}> Solo en error </MenuItem>
                </Select>
              </FormControl>
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
              <TextField
                label="Argumentos"
                fullWidth
                size="small"
                sx={{ mt: 2 }}
                value={argumentsStr}
                onChange={(e) => setArgumentsStr(e.target.value)}
              />
              <TextField
                label="Archivo de entrada"
                fullWidth
                size="small"
                sx={{ mt: 2 }}
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <TextField
                label="Salida"
                fullWidth
                size="small"
                sx={{ mt: 2 }}
                value={output}
                onChange={(e) => setOutput(e.target.value)}
              />
              <TextField
                label="Error"
                fullWidth
                size="small"
                sx={{ mt: 2 }}
                value={error}
                onChange={(e) => setError(e.target.value)}
              />
              <TextField
                label="Log"
                fullWidth
                size="small"
                sx={{ mt: 2 }}
                value={log}
                onChange={(e) => setLog(e.target.value)}
              />
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
                label="Memoria RAM (ej: 1GB)"
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                value={memory}
                onChange={(e) => setMemory(e.target.value)}
              />
              <TextField
                label="Disco (ej: 1GB)"
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                value={disk}
                onChange={(e) => setDisk(e.target.value)}
              />
              <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                <InputLabel>Sistema Operativo</InputLabel>
                <Select
                  value={osRequirement}
                  label="Sistema Operativo"
                  onChange={(e) => setOsRequirement(e.target.value)}
                >
                  <MenuItem value={"LINUX"}>Linux</MenuItem>
                  <MenuItem value={"WINDOWS"}>Windows</MenuItem>
                  <MenuItem value={"MACOS"}>MacOS</MenuItem>
                </Select>
              </FormControl>
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
