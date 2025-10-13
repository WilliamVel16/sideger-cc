import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import "./App.css";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Resources from "./pages/Resources";
import InitializeCluster from "./pages/InitializeCluster";
import FinishedJobs from "./pages/FinishedJobs";
import NewJob from "./pages/NewJob";
import JobQueue from "./pages/JobQueue";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import StoragedJobs from "./pages/StoragedJobs";
import { ProtectedRoute } from "./services/ProtectedRoute"
import { ToastContainer } from 'react-toastify'

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
                <Route index element={<Home />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/initialize-cluster" element={<InitializeCluster />} />
                <Route path="/jobs/new" element={<NewJob />} />
                <Route path="/jobs/queue" element={<JobQueue />} />
                <Route path="/jobs/finished" element={<FinishedJobs />} />
                <Route path="/registers/jobs" element={<StoragedJobs />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>

        <ToastContainer
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />

      </AppProvider>
    </div>
  );
}

export default App;