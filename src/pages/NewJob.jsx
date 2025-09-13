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
import DeleteIcon from "@mui/icons-material/Delete";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import { submitJob } from "../utils/tauriApi";

function NewJob() {
  // files status
  const [inputFiles, setInputFiles] = useState([]);

  // job data status
  const [jobType, setJobType] = useState("script");
  const [transferInputFiles, setTransferInputFiles] = useState([]);
  const [input, setInput] = useState("");

  // fields to construct the new ClassAd
  const [formData, setFormData] = useState({})

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectFile = (e) => {
    const newFiles = Array.from(e.target.files);
    console.log("Archivos seleccionados:", newFiles);

    // Evitar duplicados usando nombres de archivo
    const allFiles = [...inputFiles, ...newFiles];
    const uniqueFiles = Array.from(new Set(allFiles.map(f => f.name)))
      .map(name => allFiles.find(f => f.name === name));

    // Actualiza estado de archivos
    setInputFiles(uniqueFiles);

    // Construye el string con nombres separados por coma
    const fileNames = uniqueFiles.map((file) => file.name).join(", ");

    // Actualiza formData
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
    console.log("formData:\n", formData);
    try {
      const response = await submitJob(formData);
      console.log(response);
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
                  <MenuItem value="script">Archivo</MenuItem>
                  <MenuItem value="script-args">Archivo con Argumentos</MenuItem>
                  <MenuItem value="script-files">Script con Archivos</MenuItem>
                  <MenuItem value="files">Con Archivos de Entrada</MenuItem>
                  <MenuItem value="advanced">Avanzado</MenuItem>
                </Select>
              </FormControl>

              {(jobType === "files" || jobType === "script" || jobType === "script-args" || jobType === "script-files") && (
                <>
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<UploadIcon />}
                      sx={{ mt: 3 }}
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
                  <MenuItem value={"docker"}>Docker</MenuItem>
                  <MenuItem value={"scheduler"}>Scheduler</MenuItem>
                </Select>
              </FormControl>

              <TextField                                                                                 // EXECUTABLE
                label="Ejecutable"
                fullWidth
                size="small"
                sx={{ mt: 2 }}
                value={formData.executable || ""}
                onChange={(e) => handleFormChange("executable", e.target.value)}
              />

              {(jobType === "advanced" || jobType === "script-args") && (                                 // ARGUMENTS
                <TextField
                  label="Argumentos"
                  fullWidth
                  size="small"
                  sx={{ mt: 2 }}
                  value={formData.arguments || ""}
                  onChange={(e) => handleFormChange("arguments", e.target.value)}
                />
              )}

              <TextField                                                                                 // TRANSFER_INPUT_FILES
                label="Archivos a transfeir"
                fullWidth
                size="small"
                sx={{ mt: 2 }}
                value={formData.transfer_input_files || ""}
                disabled={true}
              />

              {(jobType === "files" || jobType === "advanced" || jobType === "script-files") && (         // INPUT
                <>
                  <TextField
                    label="Archivo de entrada"
                    fullWidth
                    size="small"
                    sx={{ mt: 2 }}
                    value={"ninguno por ahora"}
                    onChange={(e) => setInput(e.target.value)}
                  />
                </>
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
                label="Memoria RAM (ej: 1M)"
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
