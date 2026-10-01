import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import DashboardLayout from "../components/layout/layout/DashboardLayout";
import Login from "../pages/Login";

import Dashboard from "../pages/admin/Dashboard";
import ChefDashboard from "../pages/chefprojet/ChefDashboard";
import PlaceholderPage from "../pages/PlaceholderPage";
import ProjectsList from "../pages/admin/projects/ProjectsList";
import ProjectForm from "../pages/admin/projects/ProjectForm";
import ProjectDetail from "../pages/admin/projects/ProjectDetail";
import ChefProjects from "../pages/chefprojet/ChefProjects";
// ======================================================
// PROTECTION DES ROUTES
// ======================================================

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#eef1f4",
          color: "#536273",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Vérification de la session...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// ======================================================
// PROTECTION PAR RÔLE
// ======================================================

function RoleRoute({ allowedRoles, children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}


// ======================================================
// REDIRECTION APRÈS CONNEXION
// ======================================================

function RoleRedirect() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#eef1f4",
          color: "#536273",
          fontFamily: "Arial, sans-serif",
        }}
      >
        Chargement...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case "ADMINISTRATEUR":
      return <Navigate to="/admin/dashboard" replace />;

    case "CHEF_CHANTIER":
      return <Navigate to="/chef/dashboard" replace />;

    case "RESPONSABLE_FINANCIER":
      return <Navigate to="/finance/dashboard" replace />;

    case "RESPONSABLE_MAINTENANCE":
      return <Navigate to="/maintenance/dashboard" replace />;

    case "RESPONSABLE_RH":
      return <Navigate to="/rh/dashboard" replace />;

    default:
      return <Navigate to="/login" replace />;
  }
}


// ======================================================
// ROUTES
// ======================================================

function AppRoutes() {
  return (
    <Routes>

      {/* ==================================================
          PAGE LOGIN
      ================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />


      {/* ==================================================
          RACINE
          Si connecté → dashboard selon rôle
          Sinon → login
      ================================================== */}

      <Route
        path="/"
        element={<RoleRedirect />}
      />


      {/* ==================================================
          APPLICATION PROTÉGÉE
          Le DashboardLayout contient Sidebar + Topbar
      ================================================== */}

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >

        {/* ==================================================
            ADMINISTRATEUR
        ================================================== */}

        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>
              <Dashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/projets"
          element={
            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>
              <ProjectsList />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/projets/nouveau"
          element={
            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>
              <ProjectForm />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/projets/:id"
          element={
            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>
              <ProjectDetail />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/projets/:id/modifier"
          element={
            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>
              <ProjectForm />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/utilisateurs"
          element={
            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/stock"
          element={
            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/finance"
          element={
            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/maintenance"
          element={
            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/rh"
          element={
            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/admin/rapports"
          element={
            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />


        {/* ==================================================
            CHEF DE CHANTIER
        ================================================== */}

        <Route
          path="/chef/dashboard"
          element={
            <RoleRoute allowedRoles={["CHEF_CHANTIER"]}>
              <ChefDashboard />
            </RoleRoute>
          }
        />

        <Route
          path="/chef/projets"
          element={
            <RoleRoute allowedRoles={["CHEF_CHANTIER"]}>
              <ChefProjects />
            </RoleRoute>
          }
        />

        <Route
          path="/chef/equipe"
          element={
            <RoleRoute allowedRoles={["CHEF_CHANTIER"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/chef/stock"
          element={
            <RoleRoute allowedRoles={["CHEF_CHANTIER"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/chef/equipements"
          element={
            <RoleRoute allowedRoles={["CHEF_CHANTIER"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/chef/avancement"
          element={
            <RoleRoute allowedRoles={["CHEF_CHANTIER"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/chef/rapports"
          element={
            <RoleRoute allowedRoles={["CHEF_CHANTIER"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />


        {/* ==================================================
            RESPONSABLE FINANCIER
        ================================================== */}

        <Route
          path="/finance/dashboard"
          element={
            <RoleRoute allowedRoles={["RESPONSABLE_FINANCIER"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/finance/budgets"
          element={
            <RoleRoute allowedRoles={["RESPONSABLE_FINANCIER"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/finance/depenses"
          element={
            <RoleRoute allowedRoles={["RESPONSABLE_FINANCIER"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/finance/achats"
          element={
            <RoleRoute allowedRoles={["RESPONSABLE_FINANCIER"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/finance/fournisseurs"
          element={
            <RoleRoute allowedRoles={["RESPONSABLE_FINANCIER"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/finance/paiements"
          element={
            <RoleRoute allowedRoles={["RESPONSABLE_FINANCIER"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />


        {/* ==================================================
            RESPONSABLE MAINTENANCE
        ================================================== */}

        <Route
          path="/maintenance/dashboard"
          element={
            <RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/maintenance/equipements"
          element={
            <RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/maintenance/pannes"
          element={
            <RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/maintenance/interventions"
          element={
            <RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/maintenance/demandes"
          element={
            <RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />


        {/* ==================================================
            RESPONSABLE RH
        ================================================== */}

        <Route
          path="/rh/dashboard"
          element={
            <RoleRoute allowedRoles={["RESPONSABLE_RH"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/rh/employes"
          element={
            <RoleRoute allowedRoles={["RESPONSABLE_RH"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/rh/contrats"
          element={
            <RoleRoute allowedRoles={["RESPONSABLE_RH"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/rh/conges"
          element={
            <RoleRoute allowedRoles={["RESPONSABLE_RH"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

        <Route
          path="/rh/pointages"
          element={
            <RoleRoute allowedRoles={["RESPONSABLE_RH"]}>
              <PlaceholderPage />
            </RoleRoute>
          }
        />

      </Route>


      {/* ==================================================
          URL INCONNUE
      ================================================== */}

      <Route
        path="*"
        element={<RoleRedirect />}
      />

    </Routes>
  );
}

export default AppRoutes;