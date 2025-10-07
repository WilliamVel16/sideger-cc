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
import StoragedJobs from "./pages/StoragedJobs";
import UserClusters from "./pages/UserClusters"
import { ProtectedRoute } from "./services/ProtectedRoute"

function App() {

  return (
    <div >
      <AppProvider>
        <BrowserRouter>
          <Routes>
            {/** public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            {/** protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Layout />}>
                <Route index element={<div>Home</div>} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/initialize-cluster" element={<InitializeCluster />} />
                <Route path="/jobs/new" element={<NewJob />} />
                <Route path="/jobs/queue" element={<JobQueue />} />
                <Route path="/jobs/finished" element={<FinishedJobs />} />
                <Route path="/registers/jobs" element={<StoragedJobs />} />
                <Route path="/registers/clusters" element={<UserClusters />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </div>
  );
}

export default App;