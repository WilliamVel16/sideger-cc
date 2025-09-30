import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import Resources from "./pages/Resources";
import InitializeCluster from "./pages/InitializeCluster";
import FinishedJobs from "./pages/FinishedJobs";
import { AppProvider } from "./context/AppContext";
import NewJob from "./pages/NewJob";
import JobQueue from "./pages/JobQueue";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function App() {

  return (
    <div >
      <AppProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<div>Home</div>} />
              <Route path="/resources" element={<Resources />} />
              <Route path="/initialize-cluster" element={<InitializeCluster />} />
              <Route path="/jobs/new" element={<NewJob />} />
              <Route path="/jobs/queue" element={<JobQueue />} />
              <Route path="/jobs/finished" element={<FinishedJobs />} />

              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </div>
  );
}

export default App;