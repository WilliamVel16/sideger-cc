import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { executeCommand } from "./utils/tauriApi";

function command() {
  const navigate = useNavigate();
  const [responseCommand, setResponseCommand] = useState("");
  const [SSHReq, setSSHReq] = useState({
    host: "",
    username: "",
    command: "",
  });

  /**
  async function handleExecuteCommand() {
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

  async function handleExecuteCommand() {
    console.log(SSHReq)
    try {
      const response = await executeCommand(SSHReq);
      setResponseCommand(response);
    } catch (err) {
      setResponseCommand("Error command: " + err);
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
      <h1>Simple command SSH</h1>

      <p>Datos requeridos</p>

      <form
        className="row"
        onSubmit={(e) => {
          e.preventDefault();
          handleExecuteCommand();
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

export default command;
