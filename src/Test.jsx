import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useNavigate } from "react-router-dom";

function Test() {
  const navigate = useNavigate();
  const [responseCommand, setResponseCommand] = useState("");
  const [SSHReq, setSSHReq] = useState({
    host: "",
    username: "",
    command: "",
  });

  /**
  async function executeCommand() {
    try {
      const res = await fetch("http://localhost:3000/ssh", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(SSHReq),
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || "Error al ejecutar el comando");
      }
  
      const output = await res.text(); // porque estás devolviendo un String en el backend
      setResponseCommand(output);
    } catch (err) {
      setResponseCommand("Error: " + err.message);
    }
  }
   */

  async function executeCommand() {
    console.log(SSHReq)
    try {
      const output = await invoke("execute_ssh", {
        req: SSHReq,
      });
      setResponseCommand(output);
    } catch (err) {
      setResponseCommand("Error: " + err);
    }
  }

  const updateSSH = (e) => {
    const { name, value } = e.target;
    setSSHReq((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  return (
    <main className="container">
      <button onClick={() => navigate("/test2")}>Ir a la pagina de scripts</button>
      <h1>Simple test SSH</h1>

      <p>Datos requeridos</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          executeCommand();
        }}
      >
        <input
          name="host"
          value={SSHReq.host}
          onChange={updateSSH}
          placeholder="IP remota..."
        />
        <input
          name="username"
          value={SSHReq.username}
          onChange={updateSSH}
          placeholder="username..."
        />
        <input
          name="command"
          value={SSHReq.command}
          onChange={updateSSH}
          placeholder="command..."
        />
        <button type="submit">Lanzar</button>
      </form>
      <p>{responseCommand}</p>
    </main>
  );
}

export default Test;
