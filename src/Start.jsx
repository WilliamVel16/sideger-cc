import { useState } from "react";
import { runContainers, sshConnection, startCondorMaster } from "./utils/tauriApi";

function Start() {
  const [resRunContainers, setResRunContainers] = useState("");
  const [resSshConnection, setResSshConnection] = useState("");
  const [resCondorMaster, setResCondorMaster] = useState("");

  async function handleRunContainers() {
    try {
      const response = await runContainers();
      setResRunContainers(response);
    } catch (err) {
      console.error("Script error handleRunContainers: ", err);
    }
  }

  async function handleSshConnection() {
    try {
      const response = await sshConnection();
      setResSshConnection(response);
    } catch (err) {
      console.error("Script error handleSshConnection: ", err);
    }
  }

  async function handleStartCondorMaster() {
    try {
      const response = await startCondorMaster();
      setResCondorMaster(response);
    } catch (err) {
      console.error("Script error handleStartCondorMaster: ", err);
    }
  }

  return (
    <main className="container">
      <h1>Run scripts</h1>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          handleRunContainers();
        }}
      >
        <button type="submit">Correr contenedores</button>
      </form>
      <p>{resRunContainers}</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          handleSshConnection();
        }}
      >
        <button type="submit">Iniciar acceso SSH</button>
      </form>
      <p>{resSshConnection}</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          handleStartCondorMaster();
        }}
      >
        <button type="submit">Iniciar demonio condor_master</button>
      </form>
      <p>{resCondorMaster}</p>
    </main>
  );
}

export default Start;
