import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import TicketViewer from "./pages/TicketViewer";
import Layout from "./components/Layout";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/tickets"
        element={
          <PrivateRoute>
            <Layout>
              <TicketViewer />
            </Layout>
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
