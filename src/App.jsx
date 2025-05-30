import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import Resources from "./pages/Resources";
import InitializeCluster from "./pages/InitializeCluster";
//import FinishedJobs from "./pages/FinishedJobs";
//import JobQueue from "./pages/JobQueue";
//import NewJob from "./pages/NewJob";
import Command from "./Command";
import Start from "./Start";

function App() {
  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

  return (
    <div >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div>Home</div>} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/initialize-cluster" element={<InitializeCluster />} />
            <Route path="/command" element={<Command />} />
            <Route path="/start" element={<Start />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;