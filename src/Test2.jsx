import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

function Test2() {
  const [responseScript, setResponseScript] = useState("");

  async function runScript() {
    try {
      const output = await invoke("run_script");
      console.log("Script output: ", output);
      setResponseScript(output);
    } catch (err) {
      console.error('Script error: ', err)
    }
  }

  return (
    <main className="container">
      <h1>Run script</h1>

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
    </main>
  );
}

export default Test2;