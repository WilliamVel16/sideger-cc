import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";

function Test2() {
  const navigate = useNavigate();
  const [responseScript, setResponseScript] = useState("");
  const [responseScript2, setResponseScript2] = useState("");
  const [responseScript3, setResponseScript3] = useState("");

  async function runScript() {
    try {
      const output = await invoke("run_containers");
      console.log("Script output: ", output);
      setResponseScript(output);
    } catch (err) {
      console.error('Script error: ', err)
    }
  }

  async function runScript2() {
    try {
      const output = await invoke("start_ssh_connection");
      console.log("Script output: ", output);
      setResponseScript2(output);
    } catch (err) {
      console.error('Script error: ', err)
    }
  }

  async function runScript3() {
    try {
      const output = await invoke("start_condor_master");
      console.log("Script output: ", output);
      setResponseScript2(output);
    } catch (err) {
      console.error('Script error: ', err)
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
          runScript();
        }}
      >
        <button type="submit">Correr contenedores</button>
      </form>
      <p>{responseScript}</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          runScript2();
        }}
      >
        <button type="submit">Iniciar acceso SSH</button>
      </form>
      <p>{responseScript2}</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          runScript3();
        }}
      >
        <button type="submit">Iniciar demonio condor_master</button>
      </form>
      <p>{responseScript3}</p>
    </main>
  );
}

export default Test2;