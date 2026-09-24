import { Navigate, Route, Routes } from "react-router-dom";
import Login from "../pages/Login";

function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1>
      <p>Connexion réussie.</p>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route path="/dashboard" element={<Dashboard />} />

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default AppRoutes;