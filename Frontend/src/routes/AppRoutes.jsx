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

import UsersList from "../pages/admin/utilisateur/UserList";

import UserForm from "../pages/admin/utilisateur/UserForm";

import UserDetail from "../pages/admin/utilisateur/UserDetail";

import StockHome from "../pages/admin/stock/StockHome";

// ======================================================

// STOCK - MATÉRIAUX

// ======================================================

import MateriauxList from "../pages/admin/stock/MateriauxList";

import MateriauForm from "../pages/admin/stock/MateriauForm";

import MateriauDetail from "../pages/admin/stock/MateriauDetail";

// ======================================================

// STOCK - FOURNISSEURS

// ======================================================

import FournisseursList from "../pages/admin/stock/FournisseursList";

import FournisseurForm from "../pages/admin/stock/FournisseurForm";

import FournisseurDetail from "../pages/admin/stock/FournisseurDetail";

// ======================================================

// STOCK - ACHATS

// ======================================================

import AchatsList from "../pages/admin/stock/AchatsList";
import AchatForm from "../pages/admin/stock/AchatForm";

// ======================================================
// STOCK - MOUVEMENTS
// ======================================================

import MouvementsList from "../pages/admin/stock/Mouvementslist";

import MouvementForm from "../pages/admin/stock/Mouvementform";

import MouvementDetail from "../pages/admin/stock/MouvementDetail";

import AchatDetail from "../pages/admin/stock/AchatDetail";

// ======================================================

// CHEF

// ======================================================

import ChefProjects from "../pages/chefprojet/ChefProjects";
import ChefProjectDetails from "../pages/chefprojet/ChefProjectDetails";
import ChefTasks from "../pages/chefprojet/ChefTasks";
import ChefEditTask from "../pages/chefprojet/ChefEditTask";
import ChefCreateTask from "../pages/chefprojet/ChefCreateTask";
import ChefProgress from "../pages/chefprojet/ChefProgress";
import ChefReports from "../pages/chefprojet/ChefReports";
import ChefPhotos from "../pages/chefprojet/ChefPhotos";
import ChefDocuments from "../pages/chefprojet/ChefDocuments";
import ChefEquipe from "../pages/chefprojet/ChefEquipe";
import ChefEquipements from "../pages/chefprojet/ChefEquipements";
import ChefStock from "../pages/chefprojet/ChefStock";

import FinanceDashboard from "../pages/admin/finance/FinanceDashboard";

import BudgetsList from "../pages/admin/finance/BudgetsList";

import BudgetDetail from "../pages/admin/finance/BudgetDetail";

import DepensesList from "../pages/admin/finance/DepensesList";

import DepenseDetail from "../pages/admin/finance/DepenseDetail";

import MaintenanceDashboard from "../pages/admin/Maintenance/MaintenanceDashboard";

import EquipementsList from "../pages/admin/Maintenance/EquipementsList";

import EquipementDetail from "../pages/admin/Maintenance/EquipementDetail";

import AffectationsList from "../pages/admin/Maintenance/AffectationsList";

import MaintenancesList from "../pages/admin/Maintenance/MaintenancesList";

import HRDashboard from "../pages/admin/RH/HRDashboard";

import EmployesList from "../pages/admin/RH/EmployesList";

import EmployeDetail from "../pages/admin/RH/EmployeDetail";

import AffectationsListRH from "../pages/admin/RH/AffectationsListRH";

import AffectationDetail from "../pages/admin/RH/AffectationDetail";

import ContratsList from "../pages/admin/RH/ContratsList";

import ContratDetail from "../pages/admin/RH/ContratDetail";

import CongesList from "../pages/admin/RH/CongesList";

import CongeDetail from "../pages/admin/RH/CongeDetail";

import PointagesList from "../pages/admin/RH/PointagesList";

import PointageDetail from "../pages/admin/RH/PointageDetail";

import RapportsList from "../pages/admin/rapports/RapportsList";

import RapportDetail from "../pages/admin/rapports/RapportDetail";
import NotificationsPage from "../pages/admin/notifications/NotificationsPage";
import RHDashboard from "../pages/rh/RHDashboard";
import RHEmployesList from "../pages/rh/EmployesList";
import RHEmployeDetail from "../pages/rh/EmployeDetail";
import RHEmployeForm from "../pages/rh/EmployeForm";
import RHContratsList from "../pages/rh/ContratsList";
import RHContratDetail from "../pages/rh/ContratDetail";
import RHContratForm from "../pages/rh/ContratForm";
import RHCongesList from "../pages/rh/CongesList";
import RHCongeDetail from "../pages/rh/CongeDetail";
import RHCongeForm from "../pages/rh/CongeForm";
import RHPointagesList from "../pages/rh/PointagesList";
import RHPointageDetail from "../pages/rh/PointageDetail";
import RHPointageForm from "../pages/rh/PointageForm";
import MTDashboard from "../pages/maintenance/MTDashboard";
import MTEquipementsList from "../pages/maintenance/MTEquipementsList";
import MTEquipementDetail from "../pages/maintenance/MTEquipementDetail";
import MTEquipementForm from "../pages/maintenance/MTEquipementForm";
import MTAffectationsList from "../pages/maintenance/MTAffectationsList";
import MTAffectationForm from "../pages/maintenance/MTAffectationForm";
import MTMaintenancesList from "../pages/maintenance/MTMaintenancesList";
import MTMaintenanceForm from "../pages/maintenance/MTMaintenanceForm";
import MTDemandesList from "../pages/maintenance/MTDemandesList";
import MTDemandeDetail from "../pages/maintenance/MTDemandeDetail";
import MTDemandeForm from "../pages/maintenance/MTDemandeForm";
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
        }}>
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

          LOGIN

      ================================================== */}

      <Route

        path="/login"

        element={<Login />}

      />

      {/* ==================================================

          RACINE

      ================================================== */}

      <Route

        path="/"

        element={<RoleRedirect />}

      />

      {/* ==================================================

          APPLICATION PROTÉGÉE

      ================================================== */}

      <Route

        element={

          <ProtectedRoute>

            <DashboardLayout />

          </ProtectedRoute>

        }

      > 
         {/* NOTIFICATIONS */}
        <Route path="/admin/notifications" element={<NotificationsPage />}
        />
        
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

        {/* ==================================================

            PROJETS

        ================================================== */}

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

        {/* ==================================================

            UTILISATEURS

        ================================================== */}

        <Route

          path="/admin/utilisateurs"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <UsersList />

            </RoleRoute>

          }

        />

        <Route

          path="/admin/utilisateurs/nouveau"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <UserForm />

            </RoleRoute>

          }

        />

        <Route

          path="/admin/utilisateurs/:id"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <UserDetail />

            </RoleRoute>

          }

        />

        <Route

          path="/admin/utilisateurs/:id/modifier"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <UserForm />

            </RoleRoute>

          }

        />

        {/* ==================================================

            STOCK

            MATÉRIAUX

        ================================================== */}

        <Route

  path="/admin/stock"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <StockHome />

    </RoleRoute>

  }

/>

        <Route

          path="/admin/stock/materiaux"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <MateriauxList />

            </RoleRoute>

          }

        />

        <Route

          path="/admin/stock/materiaux/nouveau"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <MateriauForm />

            </RoleRoute>

          }

        />

        <Route

          path="/admin/stock/materiaux/:id"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <MateriauDetail />

            </RoleRoute>

          }

        />

        <Route

          path="/admin/stock/materiaux/:id/modifier"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <MateriauForm />

            </RoleRoute>

          }

        />

        {/* ==================================================

            STOCK

            FOURNISSEURS

        ================================================== */}

        <Route

          path="/admin/stock/fournisseurs"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <FournisseursList />

            </RoleRoute>

          }

        />

        <Route

          path="/admin/stock/fournisseurs/nouveau"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <FournisseurForm />

            </RoleRoute>

          }

        />

        <Route

          path="/admin/stock/fournisseurs/:id"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <FournisseurDetail />

            </RoleRoute>

          }

        />

        <Route

          path="/admin/stock/fournisseurs/:id/modifier"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <FournisseurForm />

            </RoleRoute>

          }

        />

        {/* ==================================================

            STOCK

            ACHATS

        ================================================== */}

        <Route

          path="/admin/stock/achats"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <AchatsList />

            </RoleRoute>

          }

        />

        <Route path="/admin/stock/achats/:id" element={ <RoleRoute allowedRoles={["ADMINISTRATEUR"]}> <AchatDetail /> </RoleRoute> } />

        <Route

          path="/admin/stock/achats/nouveau"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <AchatForm />

            </RoleRoute>

          }

        />

        <Route

          path="/admin/stock/achats/:id/modifier"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <AchatForm />

            </RoleRoute>

          }

        />

        {/* ==================================================

            STOCK

            MOUVEMENTS

        ================================================== */}

        <Route

          path="/admin/stock/mouvements"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <MouvementsList />

            </RoleRoute>

          }

        />

        <Route

          path="/admin/stock/mouvements/nouveau"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <MouvementForm />

            </RoleRoute>

          }

        />

        <Route

          path="/admin/stock/mouvements/:id"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <MouvementDetail />

            </RoleRoute>

          }

        />

        <Route

          path="/admin/stock/mouvements/:id/modifier"

          element={

            <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

              <MouvementForm />

            </RoleRoute>

          }

        />

        {/* ==================================================

            FINANCE ADMIN

        ================================================== */}

        <Route

  path="/admin/finance"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <FinanceDashboard />

    </RoleRoute>

  }

/>

<Route

  path="/admin/finance/budgets"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <BudgetsList />

    </RoleRoute>

  }

/>

<Route

  path="/admin/finance/budgets/:id"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <BudgetDetail />

    </RoleRoute>

  }

/>

<Route

  path="/admin/finance/depenses"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <DepensesList />

    </RoleRoute>

  }

/>

<Route

  path="/admin/finance/depenses/:id"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <DepenseDetail />

    </RoleRoute>

  }

/>

        {/* ==================================================

            MAINTENANCE ADMIN

        ================================================== */}

        <Route

  path="/admin/maintenance"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <MaintenanceDashboard />

    </RoleRoute>

  }

/>

<Route

  path="/admin/maintenance/equipements"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <EquipementsList />

    </RoleRoute>

  }

/>

<Route

  path="/admin/maintenance/equipements/:id"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <EquipementDetail />

    </RoleRoute>

  }

/>

<Route

  path="/admin/maintenance/affectations"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <AffectationsList />

    </RoleRoute>

  }

/>

<Route

  path="/admin/maintenance/maintenances"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <MaintenancesList />

    </RoleRoute>

  }

/>

        {/* ==================================================

            RH ADMIN

        ================================================== */}

        <Route

  path="/admin/rh"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <HRDashboard />

    </RoleRoute>

  }

/>

        <Route

  path="/admin/rh/employes"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <EmployesList />

    </RoleRoute>

  }

/>

<Route

  path="/admin/rh/employes/:id"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <EmployeDetail />

    </RoleRoute>

  }

/>

<Route

  path="/admin/rh/affectations"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <AffectationsListRH />

    </RoleRoute>

  }

/>

<Route

  path="/admin/rh/affectations/:id"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <AffectationDetail />

    </RoleRoute>

  }

/>

<Route

  path="/admin/rh/contrats"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <ContratsList />

    </RoleRoute>

  }

/>

<Route

  path="/admin/rh/contrats/:id"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <ContratDetail />

    </RoleRoute>

  }

/>

<Route

  path="/admin/rh/conges-absences"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <CongesList />

    </RoleRoute>

  }

/>

<Route

  path="/admin/rh/conges-absences/:id"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <CongeDetail />

    </RoleRoute>

  }

/>

<Route

  path="/admin/rh/pointages"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <PointagesList />

    </RoleRoute>

  }

/>

<Route

  path="/admin/rh/pointages/:id"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <PointageDetail />

    </RoleRoute>

  }

/>

        {/* ==================================================

            RAPPORTS ADMIN

        ================================================== */}

        <Route

  path="/admin/rapports"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <RapportsList />

    </RoleRoute>

  }

/>

<Route

  path="/admin/rapports/:id"

  element={

    <RoleRoute allowedRoles={["ADMINISTRATEUR"]}>

      <RapportDetail />

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
          path="/chef/projets/:id"
          element={
            <RoleRoute allowedRoles={["CHEF_CHANTIER"]}>
              <ChefProjectDetails />
            </RoleRoute>
          }
        />

        <Route
          path="/chef/taches"
          element={
            <RoleRoute allowedRoles={["CHEF_CHANTIER"]}>
              <ChefTasks />
            </RoleRoute>
          }
        />

        <Route
          path="/chef/taches/nouvelle"
          element={
            <RoleRoute allowedRoles={["CHEF_CHANTIER"]}>
              <ChefCreateTask />
            </RoleRoute>
          }
        />

        <Route
          path="/chef/taches/:id/modifier"
          element={
            <RoleRoute allowedRoles={["CHEF_CHANTIER"]}>
              <ChefEditTask />
            </RoleRoute>
          }
        />

        <Route

          path="/chef/equipe"

          element={

            <RoleRoute allowedRoles={["CHEF_CHANTIER"]}>

              <ChefEquipe />

            </RoleRoute>

          }

        />

        <Route

          path="/chef/stock"

          element={

            <RoleRoute allowedRoles={["CHEF_CHANTIER"]}>

              <ChefStock />

            </RoleRoute>

          }

        />

        <Route

          path="/chef/equipements"

          element={

            <RoleRoute allowedRoles={["CHEF_CHANTIER"]}>

              <ChefEquipements />

            </RoleRoute>

          }

        />

        <Route

          path="/chef/avancement"

          element={

            <RoleRoute allowedRoles={["CHEF_CHANTIER"]}>

              <ChefProgress />

            </RoleRoute>

          }

        />

                <Route
          path="/chef/rapports"
          element={
            <RoleRoute allowedRoles={["CHEF_CHANTIER"]}>
              <ChefReports />
            </RoleRoute>
          }
        />

        <Route
          path="/chef/photos"
          element={
            <RoleRoute allowedRoles={["CHEF_CHANTIER"]}>
              <ChefPhotos />
            </RoleRoute>
          }
        />

        <Route
          path="/chef/documents"
          element={
            <RoleRoute allowedRoles={["CHEF_CHANTIER"]}>
              <ChefDocuments />
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
        {/* RESPONSABLE MAINTENANCE */}
        <Route path="/maintenance/dashboard" element={<RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}><MTDashboard /></RoleRoute>} />
        <Route path="/maintenance/equipements" element={<RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}><MTEquipementsList /></RoleRoute>} />
        <Route path="/maintenance/equipements/nouveau" element={<RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}><MTEquipementForm /></RoleRoute>} />
        <Route path="/maintenance/equipements/:id" element={<RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}><MTEquipementDetail /></RoleRoute>} />
        <Route path="/maintenance/equipements/:id/modifier" element={<RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}><MTEquipementForm /></RoleRoute>} />
        <Route path="/maintenance/affectations" element={<RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}><MTAffectationsList /></RoleRoute>} />
        <Route path="/maintenance/affectations/nouveau" element={<RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}><MTAffectationForm /></RoleRoute>} />
        <Route path="/maintenance/affectations/:id/modifier" element={<RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}><MTAffectationForm /></RoleRoute>} />
        <Route path="/maintenance/interventions" element={<RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}><MTMaintenancesList /></RoleRoute>} />
        <Route path="/maintenance/interventions/nouveau" element={<RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}><MTMaintenanceForm /></RoleRoute>} />
        <Route path="/maintenance/interventions/:id/modifier" element={<RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}><MTMaintenanceForm /></RoleRoute>} />
        <Route path="/maintenance/demandes" element={<RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}><MTDemandesList /></RoleRoute>} />
        <Route path="/maintenance/demandes/nouveau" element={<RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}><MTDemandeForm /></RoleRoute>} />
        <Route path="/maintenance/demandes/:id" element={<RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}><MTDemandeDetail /></RoleRoute>} />
        <Route path="/maintenance/demandes/:id/modifier" element={<RoleRoute allowedRoles={["RESPONSABLE_MAINTENANCE"]}><MTDemandeForm /></RoleRoute>} />
        {/* ==================================================

            RESPONSABLE RH

        ================================================== */}
        <Route
  path="/rh/dashboard"
  element={
    <RoleRoute allowedRoles={["RESPONSABLE_RH"]}>
      <RHDashboard />
    </RoleRoute>
  }
/>

        <Route
  path="/rh/employes"
  element={
    <RoleRoute allowedRoles={["RESPONSABLE_RH"]}>
      <RHEmployesList />
    </RoleRoute>
  }
/>

        <Route
  path="/rh/employes/nouveau"
  element={
    <RoleRoute allowedRoles={["RESPONSABLE_RH"]}>
      <RHEmployeForm />
    </RoleRoute>
  }
/>

        <Route
  path="/rh/employes/:id"
  element={
    <RoleRoute allowedRoles={["RESPONSABLE_RH"]}>
      <RHEmployeDetail />
    </RoleRoute>
  }
/>

        <Route
  path="/rh/employes/:id/modifier"
  element={
    <RoleRoute allowedRoles={["RESPONSABLE_RH"]}>
      <RHEmployeForm />
    </RoleRoute>
  }
/>

        <Route path="/rh/contrats" element={<RoleRoute allowedRoles={["RESPONSABLE_RH"]}><RHContratsList /></RoleRoute>} />
        <Route path="/rh/contrats/nouveau" element={<RoleRoute allowedRoles={["RESPONSABLE_RH"]}><RHContratForm /></RoleRoute>} />
        <Route path="/rh/contrats/:id" element={<RoleRoute allowedRoles={["RESPONSABLE_RH"]}><RHContratDetail /></RoleRoute>} />
        <Route path="/rh/contrats/:id/modifier" element={<RoleRoute allowedRoles={["RESPONSABLE_RH"]}><RHContratForm /></RoleRoute>} />

        <Route path="/rh/conges" element={<RoleRoute allowedRoles={["RESPONSABLE_RH"]}><RHCongesList /></RoleRoute>} />
        <Route path="/rh/conges/nouveau" element={<RoleRoute allowedRoles={["RESPONSABLE_RH"]}><RHCongeForm /></RoleRoute>} />
        <Route path="/rh/conges/:id" element={<RoleRoute allowedRoles={["RESPONSABLE_RH"]}><RHCongeDetail /></RoleRoute>} />
        <Route path="/rh/conges/:id/modifier" element={<RoleRoute allowedRoles={["RESPONSABLE_RH"]}><RHCongeForm /></RoleRoute>} />

        <Route path="/rh/pointages" element={<RoleRoute allowedRoles={["RESPONSABLE_RH"]}><RHPointagesList /></RoleRoute>} />
        <Route path="/rh/pointages/nouveau" element={<RoleRoute allowedRoles={["RESPONSABLE_RH"]}><RHPointageForm /></RoleRoute>} />
        <Route path="/rh/pointages/:id" element={<RoleRoute allowedRoles={["RESPONSABLE_RH"]}><RHPointageDetail /></RoleRoute>} />
        <Route path="/rh/pointages/:id/modifier" element={<RoleRoute allowedRoles={["RESPONSABLE_RH"]}><RHPointageForm /></RoleRoute>} />
    

      

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