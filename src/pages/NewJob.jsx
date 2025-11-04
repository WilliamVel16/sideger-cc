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
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import TooltipInformation from "../components/ui/tooltip";

function NewJob() {
  const { submitContainerName, sessionJobsSubmitted, setSessionJobsSubmitted } = useAppContext();
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
    console.log(formData);
    const batchName = formData.batch_name?.trim();

    if (!batchName) {
      toast.warning("Debes ingresar un nombre para el lote");
      return;
    }

    // verify duplicates
    const isDuplicate = sessionJobsSubmitted.some(
      (job) => job.batch_name.toLowerCase() === batchName.toLowerCase()
    );
    if (isDuplicate) {
      toast.error("Nombre de lote repetido.");
      toast.info("Tip: ingresa un número al final")
      return;
    }

    const result = await Swal.fire({
      title: '¿Llenaste los campos necesarios para el trabajo?',
      text: `Se enviará el lote "${batchName}" con los datos ingresados.`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#18b654ff',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, quiero enviar',
      cancelButtonText: 'Volver y verificar',
    });

    if (result.isConfirmed) {
      try {

        const response = await submitJob(formData, submitContainerName, outputType, inputFiles);
        console.log(response);

        setSessionJobsSubmitted((prevJobs) => {
          const newJob = {
            batch_name: batchName,
            universe: formData.universe,
            number_jobs: formData.queue,
            output_type: outputType, 
          };
          return [...prevJobs, newJob];
        });

        toast.success(`Lote "${batchName}" enviado exitosamente`);
      } catch (err) {
        console.error("Error trying to submit the new job:", err);
        toast.error(`Ocurrió un error al enviar el lote: "${err}"`);
      }
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
                  <MenuItem value="python">4. Python</MenuItem>
                  <MenuItem value="shell">5. Shell</MenuItem>
                  <MenuItem value="advanced">6. Avanzado</MenuItem>
                </Select>
              </FormControl>

              {(jobType === "executable-args" || jobType === "executable-files" || jobType === "python" ||
              jobType === "executable" || jobType === "advanced" || jobType === "shell") && (
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
              {(jobType === "python") && (
                <>
                  <Typography sx={{ mt: 1 }}> Incluye esta línea al inicio de tu script Python: </Typography>
                  <Box component="code" sx={{ display: "block", color: "green", fontWeight: 600 }}>
                    #!/usr/bin/env python3
                  </Box>
                </> )}
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2}}>
                <FormControl fullWidth size="small" >                                         {/** UNIVERSE */}
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
                <TooltipInformation
                  href={"https://htcondor.readthedocs.io/en/lts/users-manual/choosing-an-htcondor-universe.html"}
                  title="universe"
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2}}>
                <TextField                                                                                 // BATCH_NAME
                  label="Nombre del trabajo"
                  fullWidth
                  size="small"
                  value={formData.batch_name || ""}
                  onChange={(e) => handleFormChange("batch_name", e.target.value)}
                />
                <TooltipInformation
                  href={"https://htcondor.readthedocs.io/en/24.x/man-pages/condor_submit.html#:~:text=double%20quote%20marks.-,%2Dbatch%2Dname%20batch_name,over%20a%20batch%20name%20specified%20in%20the%20submit%20description%20file%20itself.,-%2Dspool"}
                  title="batch_name"
                />
              </Box>
              
              {(jobType !== "shell") && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2}}>
                  <TextField                                                                                 // EXECUTABLE
                    label="Ejecutable"
                    fullWidth
                    size="small"
                    value={formData.executable || ""}
                    onChange={(e) => handleFormChange("executable", e.target.value)}
                  />
                  <TooltipInformation
                    href={"https://htcondor.readthedocs.io/en/24.x/man-pages/condor_submit.html#:~:text=executable%20%3D%20%3Cpathname%3E,command%20is%20issued."}
                    title="executable"
                  />
                </Box>
              )} 
                         
              {(jobType === "advanced" || jobType === "shell") && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2}}>
                  <TextField                                                                                 // SHELL
                    label="Instrucción a ejecutar (shell)"
                    fullWidth
                    size="small"
                    value={formData.shell || ""}
                    onChange={(e) => handleFormChange("shell", e.target.value)}
                  />
                  <TooltipInformation
                    href={"https://htcondor.readthedocs.io/en/24.x/man-pages/condor_submit.html#:~:text=command%20is%20issued.-,%C2%B6,the%20transfer_input%20list%2C%20you%20will%20manually%20need%20to%20add%20those%20programs.,-%C2%B6"}
                    title="shell"
                  />
                </Box>
              )}
              
              {(jobType === "advanced" || jobType === "executable-files" ) && (                             // INPUT
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2}}>
                  <TextField
                    label="Archivo de entrada"
                    fullWidth
                    size="small"
                    value={formData.input}
                    onChange={(e) => handleFormChange("input", e.target.value)}
                  />
                  <TooltipInformation
                    href={"https://htcondor.readthedocs.io/en/24.x/man-pages/condor_submit.html#:~:text=input%20%3D%20%3Cpathname%3E,the%20arguments%20command."}
                    title="input"
                  />
                </Box>
              )}

              {(jobType === "advanced" || jobType === "executable-args") && (                                 // ARGUMENTS
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2}}>
                  <TextField
                    label="Argumentos"
                    fullWidth
                    size="small"
                    value={formData.arguments || ""}
                    onChange={(e) => handleFormChange("arguments", e.target.value)}
                  />
                  <TooltipInformation
                    href={"https://htcondor.readthedocs.io/en/24.x/man-pages/condor_submit.html#:~:text=arguments%20%3D%20%3Cargument_list%3E,of%20Windows%20users."}
                    title="arguments"
                  />
                </Box>
              )}

              {(jobType === "executable-args" || "shell") && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2}}>
                  <TextField                                                                                 // TRANSFER_INPUT_FILES
                    label="Archivos a transfeir"
                    fullWidth
                    size="small"
                    value={formData.transfer_input_files || ""}
                    disabled={true}
                  />
                  <TooltipInformation
                    href={"https://htcondor.readthedocs.io/en/24.x/man-pages/condor_submit.html#:~:text=transfer_input_files%20%3D%20%3C%20file1%2Cfile2,the%20same%20service."}
                    title="transfer_input_files"
                  />
                </Box>
              )}

              {(jobType === "advanced") && (                                                               // SHOULD_TRANSFER_FILES (advanced)         
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2}}>
                  <FormControl fullWidth size="small">
                  <InputLabel>¿Se debe transferir archivos?</InputLabel>
                  <Select        
                    label="¿Transferir archivos?"                                                                       
                    value={formData.should_transfer_files || ""}
                    onChange={(e) => handleFormChange("should_transfer_files", e.target.value)}
                  >
                    <MenuItem value="YES">Sí</MenuItem>
                    <MenuItem value="NO">No</MenuItem>
                    <MenuItem value="IF_NEEDED">Sólo si es necesario</MenuItem>
                  </Select>
                  </FormControl>
                  <TooltipInformation
                    href={"https://htcondor.readthedocs.io/en/24.x/man-pages/condor_submit.html#:~:text=has%20full%20details.-,%C2%B6,should_transfer_files%20is%20not%20supported%20for%20jobs%20submitted%20to%20the%20grid%20universe.,-%C2%B6"}
                    title="should_transfer_files"
                  />
                </Box>
              )}

              {(jobType === "advanced") && (                                                                // TRANSFER_OUTPUT_FILES (advanced)         
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2}}>
                  <TextField                                                                                 
                    label="Obtener otros archivos creados" 
                    fullWidth
                    size="small"
                    value={formData.transfer_output_files || ""}
                    onChange={(e) => handleFormChange("transfer_output_files", e.target.value)}
                  />
                  <TooltipInformation
                    href={"https://htcondor.readthedocs.io/en/24.x/man-pages/condor_submit.html#:~:text=knows%20their%20name.-,%C2%B6,to.%20Transfer%20of%20symbolic%20links%20to%20directories%20is%20not%20currently%20supported.,-%C2%B6"}
                    title="transfer_output_files"
                  />
                </Box>
              )}

              {(jobType === "advanced") && (                                                                // WHEN_TO_TRANSFER_FILES (advanced)         
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2}}>
                  <FormControl fullWidth size="small">
                    <InputLabel>¿Cuándo transferir los archivos?</InputLabel>
                    <Select                                                                                 
                      label="Cuando transferir los archivos" 
                      fullWidth
                      size="small"
                      value={formData.when_to_transfer_files || ""}
                      onChange={(e) => handleFormChange("when_to_transfer_files", e.target.value)}
                    >
                      <MenuItem value="ON_EXIT">Al finalizar la ejecución</MenuItem>
                      <MenuItem value="ON_EXIT_OR_EVICT">Al finalizar o al ser expulsado</MenuItem>
                    </Select>
                  </FormControl>
                  <TooltipInformation
                    href={"https://htcondor.readthedocs.io/en/24.x/man-pages/condor_submit.html#:~:text=when_to_transfer_output%20%3D%20%3C%20ON_EXIT%20%7C%20ON_EXIT_OR_EVICT,at%20transfer%20time."}
                    title="when_to_transfer_files"
                  />
                </Box>
              )}

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2}}>
                <TextField                                                                                   // QUEUE
                  label="Instancias a ejecutar"
                  type="number"
                  fullWidth
                  size="small"
                  value={formData.queue || ""}
                  onChange={(e) => handleFormChange("queue", e.target.value)}
                />
                <TooltipInformation
                  href={"https://htcondor.readthedocs.io/en/24.x/man-pages/condor_submit.html#:~:text=queue%20%5B%3Cint,submit%20description%20file."}
                  title="queue"
                />
              </Box>
            </Grid>

            {/** job's requirements (computing power) */}
            <Grid item size={{ xs: 12, md: 4 }}>                                                           {/** CPU */}
              <Typography variant="h6"> Requerimientos </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2}}>
                <TextField
                  label="CPUs"
                  type="number"
                  size="small"
                  fullWidth
                  value={formData.request_cpus || ""}
                  onChange={(e) => handleFormChange("request_cpus", e.target.value)}
                />
                <TooltipInformation
                  href={"https://htcondor.readthedocs.io/en/24.x/man-pages/condor_submit.html#universe:~:text=request_cpus%20%3D%20%3Cnum%2Dcpus,this%20many%20cores."}
                  title="request_cpus"
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>                           {/** RAM */}
                <TextField
                  label="Memoria RAM (ej: 512M)"
                  size="small"
                  fullWidth
                  value={formData.request_memory || ""}
                  onChange={(e) => handleFormChange("request_memory", e.target.value)}
                />
                <TooltipInformation
                  href="https://htcondor.readthedocs.io/en/24.x/man-pages/condor_submit.html#universe:~:text=request_memory%20%3D%20%3Cquantity%3E,for%20the%20job."
                  title="request_memory"
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2}}>
                <TextField                                                                                   // DISK
                  label="Disco (ej: 1G)"
                  size="small"
                  fullWidth
                  value={formData.request_disk || ""}
                  onChange={(e) => handleFormChange("request_disk", e.target.value)}
                />
                <TooltipInformation
                  href="https://htcondor.readthedocs.io/en/latest/users-manual/request-memory.html"
                  title="request_disk"
                />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2}}>
                <TextField                                                                                   // GPUs
                  label="GPUs"
                  size="small"
                  fullWidth
                  value={formData.request_gpus || ""}
                  onChange={(e) => handleFormChange("request_gpus", e.target.value)}
                />
                <TooltipInformation
                  href="https://htcondor.readthedocs.io/en/24.x/man-pages/condor_submit.html#universe:~:text=request_gpus%20%3D%20%3Cnum%2Dgpus,the%20required%20properties."
                  title="request_gpus"
                />
              </Box>

              {(jobType === "advanced") && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2}}>
                  <TextField                                                                                 // MAX_RETRIES (advanced)
                    label="¿Cuántas veces reintentar trabajo?"
                    size="small"
                    fullWidth
                    value={formData.max_retries || ""}
                    onChange={(e) => handleFormChange("max_retries", e.target.value)}
                  />
                  <TooltipInformation
                    href="https://htcondor.readthedocs.io/en/24.x/man-pages/condor_submit.html#universe:~:text=max_retries%20%3D%20%3Cinteger%3E,the%20retry%20commands."
                    title="max_retries"
                  />
                </Box>
              )}

              {/**  will be managed from backend*/}
              {(jobType === "advanced") && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2}}>
                  <TextField                                                                                 // PERIODIC_REMOVE (advanced)
                    label="Eliminar trabajos retenidos (en segundos)"
                    size="small"
                    fullWidth
                    value={formData.periodic_remove || ""}
                    onChange={(e) => handleFormChange("periodic_remove", e.target.value)}
                  />
                  <TooltipInformation
                    href="https://htcondor.readthedocs.io/en/24.x/man-pages/condor_submit.html#universe:~:text=periodic_remove%20%3D%20%3CClassAd%20Boolean,PERIODIC_EXPR_TIMESLICE%20configuration%20macros."
                    title="periodic_remove"
                  />
                </Box>
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