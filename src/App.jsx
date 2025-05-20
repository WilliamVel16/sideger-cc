import { Navigate, BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import Layout from "./components/Layout";
import Resources from "./pages/Resources";
//import FinishedJobs from "./pages/FinishedJobs";
//import JobQueue from "./pages/JobQueue";
//import NewJob from "./pages/NewJob";
import Test from "./Test";
import Test2 from "./Test2";

function App() {
  // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

  return (
    <div >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<div>Home</div>} />
            <Route path="resources" element={<Resources />} />
            <Route path="/test" element={<Test />} />
            <Route path="/test2" element={<Test2 />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;