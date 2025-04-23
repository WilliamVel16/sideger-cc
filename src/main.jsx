import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Test from "./Test";
import Test2 from "./Test2";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Test />} />
        <Route path="/test2" element={<Test2 />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
);
