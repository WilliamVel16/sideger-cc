import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";

function Test2() {
  const navigate = useNavigate();
  const [resRunContainers, setResRunContainers] = useState("");
  const [resSshConnection, setResSshConnection] = useState("");
  const [resShowResources, setResShowResources] = useState([]);
  const [resCondorMaster, setResCondorMaster] = useState("");

  async function runContainers() {
    try {
      const output = await invoke("run_containers");
      setResRunContainers(output);
    } catch (err) {
      console.error("Script error runContainers: ", err);
    }
  }

  async function sshConnection() {
    try {
      const output = await invoke("start_ssh_connection");
      setResSshConnection(output);
    } catch (err) {
      console.error("Script error sshConnection: ", err);
    }
  }

  async function showResourcesSpecs() {
    try {
      const output = await invoke("show_resources_specs");
      setResShowResources(output);
      console.log("type of data:", typeof output);
    } catch (err) {
      console.error("Script error showResourcesSpecs: ", err);
    }
  }

  async function startCondorMaster() {
    try {
      const output = await invoke("start_condor_master");
      setResCondorMaster(output);
    } catch (err) {
      console.error("Script error startCondorMaster: ", err);
    }
  }

  return (
    <main className="container">
      <button onClick={() => navigate("/")}>Ir a página del comando</button>
      <h1>Run scripts</h1>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          runContainers();
        }}
      >
        <button type="submit">Correr contenedores</button>
      </form>
      <p>{resRunContainers}</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          sshConnection();
        }}
      >
        <button type="submit">Iniciar acceso SSH</button>
      </form>
      <p>{resSshConnection}</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          showResourcesSpecs();
        }}
      >
        <button type="submit">Mostrar recursos disponibles</button>
      </form>
      <div>
        {resShowResources.map((node, idx) => (
          <div key={idx}>
            <h3>{node.hostname}</h3>
            <p>OS: {node.os}</p>
            <p>CPU: {node.cpu}</p>
            <p>RAM: {node.ram_mb} MB</p>
            <p>GPU: {node.gpu}</p>
            <ul>
              DISK: {node.disk.map((d, i) => (
                <li key={i}>
                  {d.name}: {d.size}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          startCondorMaster();
        }}
      >
        <button type="submit">Iniciar demonio condor_master</button>
      </form>
      <p>{resCondorMaster}</p>
    </main>
  );
}

export default Test2;
