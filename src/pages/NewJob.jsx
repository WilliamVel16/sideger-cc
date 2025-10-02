import {
  Box,
  Grid,
  Typography,
  Container,
  Select,
  MenuItem,
  FormControl,
  TextField,
  InputLabel,
  IconButton,
  Button,
} from "@mui/material";
import { useState } from "react";
import UploadIcon from "@mui/icons-material/Upload";
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { useAppContext } from "../context/AppContext";
import { submitJob } from "../utils/tauriApi";

function NewJob() {
  const { clusterNodesConfig, setSessionJobsSubmitted } = useAppContext();
  const [inputFiles, setInputFiles] = useState([]);
  const [jobType, setJobType] = useState("executable");
  const [input, setInput] = useState("");
  const [formData, setFormData] = useState({})
  const [outputType, setOutputType] = useState("a_directory");

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectFile = (e) => {
    const newFiles = Array.from(e.target.files);
    console.log("Archivos seleccionados:", newFiles);

    const allFiles = [...inputFiles, ...newFiles];
    const uniqueFiles = Array.from(new Set(allFiles.map(f => f.name)))
      .map(name => allFiles.find(f => f.name === name));

    setInputFiles(uniqueFiles);

    const fileNames = uniqueFiles.map((file) => file.name).join(", ");

    // updates formData
    setFormData((prev) => ({
      ...prev,
      transfer_input_files: fileNames,
    }));
  };

  const handleRemoveFile = (fileNameToRemove) => {
    const updatedFiles = inputFiles.filter((file) => file.name !== fileNameToRemove);
    setInputFiles(updatedFiles);

    const updatedFileNames = updatedFiles.map((file) => file.name).join(", ");

    setFormData((prev) => ({
      ...prev,
      transfer_input_files: updatedFileNames,
    }));
  };


  const handleSubmitNewJob = async () => {
    //find the node with submit role
    const submitContainer = clusterNodesConfig
      .filter(node => node.container_name.startsWith("sub_"))
      .map(node => node.container_name);

    try {
      const response = await submitJob(formData, submitContainer[0], outputType);
      console.log(response);
      
      setSessionJobsSubmitted(prevJobs => {
      const newJob = { batch_name: formData.batch_name, output_type: outputType };
      const filtered = prevJobs.filter(job => job.name !== newJob.name);
      return [...filtered, newJob];
    });
    } catch (err) {
      console.log("Error trying submit the new job:", err);
    }
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

            {/** load files and type of job and output */}
            <Grid item size={{ xs: 12, md: 2.5 }}>
              <Typography variant="h6"> Sobre el Trabajo </Typography>
              <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                <InputLabel>Tipo de Salida</InputLabel>
                <Select
                  value={outputType}
                  label="Tipo de Salida"
                  onChange={(e) => setOutputType(e.target.value)}
                >
                  <MenuItem value="a_directory">Unico directorio</MenuItem>
                  <MenuItem value="n_directories">Multiples directorios</MenuItem>
                </Select>
              </FormControl>
              
              <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                <InputLabel>Tipo de Trabajo</InputLabel>
                <Select
                  value={jobType}
                  label="Tipo de Trabajo"
                  onChange={(e) => setJobType(e.target.value)}
                >
                  <MenuItem value="executable">1. Ejecutable</MenuItem>
                  <MenuItem value="executable-args">2. Con argumentos</MenuItem>
                  <MenuItem value="executable-files">3. Con archivos de entrada</MenuItem>
                  <MenuItem value="executable-args-files">4. Incluye  "2" y "3"</MenuItem>
                  <MenuItem value="shell">5. Shell</MenuItem>
                  <MenuItem value="advanced">6. Avanzado</MenuItem>
                </Select>
              </FormControl>

              {(jobType === "executable-args" || jobType === "executable-files" || 
              jobType === "advanced" || jobType === "shell" || jobType === "executable-args-files") && (
                <>
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      sx={{ mt: 3 }}
                      color="black"
                    >
                      Subir Archivo
                      <input
                        hidden
                        multiple
                        type="file"
                        onChange={handleSelectFile}
                      />
                    </Button>
                  </Box>
                  <Box sx={{ mt: 2 }}>
                    {inputFiles.length > 0 &&
                      inputFiles.map((file, i) => (
                        <Box
                          key={i}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            border: "1px solid #ccc",
                            borderRadius: 1,
                            padding: "4px 8px",
                            mb: 1,
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <InsertDriveFileIcon fontSize="small" />
                            <Typography variant="body2">{file.name}</Typography>
                          </Box>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleRemoveFile(file.name)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      ))}
                  </Box>
                </>
              )}

            </Grid>

            {/** data about the job*/}
            <Grid item size={{ xs: 12, md: 4 }}>
              <Typography variant="h6"> Trabajo </Typography>
              <FormControl fullWidth size="small" sx={{ mt: 2 }}>                                         {/** UNIVERSE */}
                <InputLabel>Universo</InputLabel>
                <Select
                  value={formData.universe || ""}
                  label="Universo"
                  onChange={(e) => handleFormChange("universe", e.target.value)}
                >
                  <MenuItem value={"vanilla"}>Vanilla</MenuItem>
                  <MenuItem value={"java"}>Java</MenuItem>
                  <MenuItem value={"parallel"}>Parallel</MenuItem>
                </Select>
              </FormControl>

              <TextField                                                                                 // BATCH_NAME
                label="Nombre de la ejecución"
                fullWidth
                size="small"
                sx={{ mt: 2 }}
                value={formData.batch_name || ""}
                onChange={(e) => handleFormChange("batch_name", e.target.value)}
              />
              
              {(jobType !== "shell") && (
                <TextField                                                                                 // EXECUTABLE
                  label="Ejecutable"
                  fullWidth
                  size="small"
                  sx={{ mt: 2 }}
                  value={formData.executable || ""}
                  onChange={(e) => handleFormChange("executable", e.target.value)}
                />
              )}            

              {(jobType === "advanced" || jobType === "shell") && (
                <TextField                                                                                 // SHELL
                  label="Instrucción a ejecutar (shell)"
                  fullWidth
                  size="small"
                  sx={{ mt: 2 }}
                  value={formData.shell || ""}
                  onChange={(e) => handleFormChange("shell", e.target.value)}
                />
              )}
              
              {(jobType === "advanced" || jobType === "executable-files" || jobType === "executable-args-files") && (         // INPUT
                <TextField
                  label="Archivo de entrada"
                  fullWidth
                  size="small"
                  sx={{ mt: 2 }}
                  value={formData.input}
                  onChange={(e) => handleFormChange("input", e.target.value)}
                />
              )}

              {(jobType === "advanced" || jobType === "executable-args" || jobType === "executable-args-files") && (                                 // ARGUMENTS
                <TextField
                  label="Argumentos"
                  fullWidth
                  size="small"
                  sx={{ mt: 2 }}
                  value={formData.arguments || ""}
                  onChange={(e) => handleFormChange("arguments", e.target.value)}
                />
              )}

              {(jobType === "executable-args" || "shell") && (
                <TextField                                                                                 // TRANSFER_INPUT_FILES
                  label="Archivos a transfeir"
                  fullWidth
                  size="small"
                  sx={{ mt: 2 }}
                  value={formData.transfer_input_files || ""}
                  disabled={true}
                />
              )}

              {(jobType === "advanced") && (                                                               // SHOULD_TRANSFER_FILES (advanced)         
                <TextField                                                                                 
                  label="¿Se deben transferir archivos?" 
                  fullWidth
                  size="small"
                  sx={{ mt: 2 }}
                  value={formData.should_transfer_files || ""}
                  onChange={(e) => handleFormChange("should_transfer_files", e.target.value)}
                />
              )}

              {(jobType === "advanced") && (                                                                // TRANSFER_OUTPUT_FILES (advanced)         
                <TextField                                                                                 
                  label="Archivos de subdirectorios (traer)" 
                  fullWidth
                  size="small"
                  sx={{ mt: 2 }}
                  value={formData.transfer_output_files || ""}
                  onChange={(e) => handleFormChange("transfer_output_files", e.target.value)}
                />
              )}

              {(jobType === "advanced") && (                                                                // WHEN_TO_TRANSFER_FILES (advanced)         
                <TextField                                                                                 
                  label="Cuando transferir los archivos" 
                  fullWidth
                  size="small"
                  sx={{ mt: 2 }}
                  value={formData.when_to_transfer_files || ""}
                  onChange={(e) => handleFormChange("when_to_transfer_files", e.target.value)}
                />
              )}

              <TextField                                                                                   // QUEUE
                label="Instancias a ejecutar"
                type="number"
                fullWidth
                size="small"
                sx={{ mt: 2 }}
                value={formData.queue || ""}
                onChange={(e) => handleFormChange("queue", e.target.value)}
              />
            </Grid>

            {/** job's requirements (computing power) */}
            <Grid item size={{ xs: 12, md: 4 }}>                                                           {/** CPU */}
              <Typography variant="h6"> Requerimientos </Typography>
              <TextField
                label="CPUs"
                type="number"
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                value={formData.request_cpus || ""}
                onChange={(e) => handleFormChange("request_cpus", e.target.value)}
              />

              <TextField                                                                                   // RAM
                label="Memoria RAM (ej: 512M)"
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                value={formData.request_memory || ""}
                onChange={(e) => handleFormChange("request_memory", e.target.value)}
              />

              <TextField                                                                                   // DISK
                label="Disco (ej: 1G)"
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                value={formData.request_disk || ""}
                onChange={(e) => handleFormChange("request_disk", e.target.value)}
              />

              <TextField                                                                                   // GPUs
                label="GPUs"
                size="small"
                fullWidth
                sx={{ mt: 2 }}
                value={formData.request_gpus || ""}
                onChange={(e) => handleFormChange("request_gpus", e.target.value)}
              />

              {(jobType === "advanced") && (
                <TextField                                                                                 // OUTPUT (advanced)
                  label="Directorio para la salida"
                  size="small"
                  fullWidth
                  sx={{ mt: 2 }}
                  value={formData.output || ""}
                  onChange={(e) => handleFormChange("output", e.target.value)}
                />
              )}

              {(jobType === "advanced") && (
                <TextField                                                                                 // ERROR (advanced)
                  label="Directorio para el error"
                  size="small"
                  fullWidth
                  sx={{ mt: 2 }}
                  value={formData.error || ""}
                  onChange={(e) => handleFormChange("error", e.target.value)}
                />
              )}

              {(jobType === "advanced") && (
                <TextField                                                                                 // LOG (advanced)
                  label="Directorio para los logs"
                  size="small"
                  fullWidth
                  sx={{ mt: 2 }}
                  value={formData.log || ""}
                  onChange={(e) => handleFormChange("log", e.target.value)}
                />
              )}

              {(jobType === "advanced") && (
                <TextField                                                                                 // MAX_RETRIES (advanced) no implemented
                  label="Cuantas veces reintentar trabajo"
                  size="small"
                  fullWidth
                  sx={{ mt: 2 }}
                  value={formData.max_retries || ""}
                  onChange={(e) => handleFormChange("max_retries", e.target.value)}
                />
              )}

              {/**  will be managed from backend*/}
              {(jobType === "advanced") && (
                <TextField                                                                                 // PERIODIC_REMOVE (advanced)
                  label="Eliminar trabajos retenidos (en segundos)"
                  size="small"
                  fullWidth
                  sx={{ mt: 2 }}
                  value={formData.max_retries || ""}
                  onChange={(e) => handleFormChange("max_retries", e.target.value)}
                />
              )}
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item size={12}>
        <Box sx={{ mt: 4, textAlign: "center" }}>
          <Button
            variant="contained"
            color="black"
            onClick={handleSubmitNewJob}
            
          >
            Ejecutar Trabajo
          </Button>
        </Box>
      </Grid>
    </Container>
  );
}

export default NewJob;