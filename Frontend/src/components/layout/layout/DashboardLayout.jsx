import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import "./DashboardLayout.css";

function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const role = user?.role;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const getRoleLabel = () => {
    switch (role) {
      case "ADMINISTRATEUR":
        return "Administration";

      case "CHEF_CHANTIER":
        return "Chef de chantier";

      case "RESPONSABLE_FINANCIER":
        return "Responsable financier";

      case "RESPONSABLE_MAINTENANCE":
        return "Responsable maintenance";

      case "RESPONSABLE_RH":
        return "Ressources humaines";

      default:
        return "Utilisateur";
    }
  };

  const getMenuItems = () => {
    switch (role) {
      case "ADMINISTRATEUR":
        return [
          {
            label: "Dashboard",
            path: "/admin/dashboard",
            icon: "⌂",
          },
          {
            label: "Projets",
            path: "/admin/projets",
            icon: "▣",
          },
          {
            label: "Utilisateurs",
            path: "/admin/utilisateurs",
            icon: "♙",
          },
          {
            label: "Stock",
            path: "/admin/stock",
            icon: "▤",
          },
          {
            label: "Finance",
            path: "/admin/finance",
            icon: "€",
          },
          {
            label: "Maintenance",
            path: "/admin/maintenance",
            icon: "⚙",
          },
          {
            label: "Ressources humaines",
            path: "/admin/rh",
            icon: "♙",
          },
          {
            label: "Rapports",
            path: "/admin/rapports",
            icon: "▥",
          },
        ];

      case "CHEF_CHANTIER":
        return [
          {
            label: "Dashboard",
            path: "/chef/dashboard",
            icon: "⌂",
          },
          {
            label: "Mes projets",
            path: "/chef/projets",
            icon: "▣",
          },
          {
            label: "Équipe",
            path: "/chef/equipe",
            icon: "♙",
          },
          {
            label: "Équipements",
            path: "/chef/equipements",
            icon: "⚙",
          },
          {
            label: "Stock",
            path: "/chef/stock",
            icon: "▤",
          },
          {
            label: "Avancement",
            path: "/chef/avancement",
            icon: "▥",
          },
          {
            label: "Rapports",
            path: "/chef/rapports",
            icon: "▥",
          },
        ];

      case "RESPONSABLE_FINANCIER":
        return [
          {
            label: "Dashboard",
            path: "/finance/dashboard",
            icon: "⌂",
          },
          {
            label: "Budgets",
            path: "/finance/budgets",
            icon: "€",
          },
          {
            label: "Dépenses",
            path: "/finance/depenses",
            icon: "€",
          },
          {
            label: "Achats",
            path: "/finance/achats",
            icon: "▤",
          },
          {
            label: "Fournisseurs",
            path: "/finance/fournisseurs",
            icon: "♙",
          },
          {
            label: "Paiements",
            path: "/finance/paiements",
            icon: "€",
          },
        ];

      case "RESPONSABLE_MAINTENANCE":
        return [
          {
            label: "Dashboard",
            path: "/maintenance/dashboard",
            icon: "⌂",
          },
          {
            label: "Équipements",
            path: "/maintenance/equipements",
            icon: "⚙",
          },
          {
            label: "Pannes",
            path: "/maintenance/pannes",
            icon: "!",
          },
          {
            label: "Interventions",
            path: "/maintenance/interventions",
            icon: "⚙",
          },
          {
            label: "Demandes",
            path: "/maintenance/demandes",
            icon: "▤",
          },
        ];

      case "RESPONSABLE_RH":
        return [
          {
            label: "Dashboard",
            path: "/rh/dashboard",
            icon: "⌂",
          },
          {
            label: "Employés",
            path: "/rh/employes",
            icon: "♙",
          },
          {
            label: "Contrats",
            path: "/rh/contrats",
            icon: "▣",
          },
          {
            label: "Congés",
            path: "/rh/conges",
            icon: "▤",
          },
          {
            label: "Pointages",
            path: "/rh/pointages",
            icon: "◷",
          },
        ];

      default:
        return [];
    }
  };

  const menuItems = getMenuItems();

  const firstName = user?.prenom || "";
  const lastName = user?.nom || "";

  const initials =
    `${firstName.charAt(0)}${lastName.charAt(0)}`
      .trim()
      .toUpperCase() || "U";

  return (
    <div className="dashboard-layout">

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="dashboard-sidebar">

        <div className="sidebar-logo">
          <div className="logo-icon">
            B
          </div>

          <div className="logo-text">
            <span>BTP</span>
            <small>Management</small>
          </div>
        </div>

        <div className="sidebar-menu">

          <p className="menu-title">
            MENU PRINCIPAL
          </p>

          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `menu-item ${isActive ? "active" : ""}`
              }
            >
              <span className="menu-icon">
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>
            </NavLink>
          ))}

          <p className="menu-title menu-title-other">
            AUTRES
          </p>

          <button
            type="button"
            className="menu-item"
            onClick={() => {}}
          >
            <span className="menu-icon">
              ●
            </span>

            <span>
              Notifications
            </span>

            <span className="notification-count">
              3
            </span>
          </button>

          <button
            type="button"
            className="menu-item"
            onClick={() => {}}
          >
            <span className="menu-icon">
              ⚙
            </span>

            <span>
              Paramètres
            </span>
          </button>

        </div>

        {/* AIDE */}

        <div className="sidebar-help">

          <div className="help-box">

            <div className="help-icon">
              ?
            </div>

            <div>
              <strong>
                Besoin d'aide ?
              </strong>

              <p>
                Contactez l'administrateur
              </p>
            </div>

          </div>

        </div>

        {/* DECONNEXION */}

        <div className="sidebar-bottom">

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            <span>
              ↪
            </span>

            <span>
              Déconnexion
            </span>
          </button>

        </div>

      </aside>


      {/* =====================================================
          CONTENU PRINCIPAL
      ===================================================== */}

      <main className="main-content">

        {/* TOPBAR */}

        <header className="topbar">

          <div className="search-container">

            <span className="search-icon">
              ⌕
            </span>

            <input
              type="text"
              placeholder="Rechercher un projet, chantier..."
            />

          </div>


          <div className="topbar-right">

            <button
              type="button"
              className="notification-button"
            >
              <span>
                ♢
              </span>

              <i></i>
            </button>

            <div className="profile-divider"></div>


            <div className="profile-area">

              <div className="profile-avatar">
                {initials}
              </div>

              <div className="profile-info">

                <strong>
                  {firstName} {lastName}
                </strong>

                <span>
                  {getRoleLabel()}
                </span>

              </div>

              <span className="profile-arrow">
                ⌄
              </span>

            </div>

          </div>

        </header>


        {/* PAGE COURANTE */}

        <section className="dashboard-content">

          <Outlet />

        </section>

      </main>

    </div>
  );
}

export default DashboardLayout;
