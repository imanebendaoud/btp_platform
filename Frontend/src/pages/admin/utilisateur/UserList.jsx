import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUsers } from "../../../services/usersService";
import "./UserList.css";

const ROLE_LABELS = {
  ADMINISTRATEUR: "Administrateur",
  CHEF_CHANTIER: "Chef de chantier",
  RESPONSABLE_FINANCIER: "Responsable financier",
  RESPONSABLE_MAINTENANCE: "Responsable maintenance",
  RESPONSABLE_RH: "Responsable RH",
};

const ROLE_CLASS = {
  ADMINISTRATEUR: "user-role-admin",
  CHEF_CHANTIER: "user-role-chef",
  RESPONSABLE_FINANCIER: "user-role-finance",
  RESPONSABLE_MAINTENANCE: "user-role-maintenance",
  RESPONSABLE_RH: "user-role-rh",
};

function UsersList() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("TOUS");
  const [statusFilter, setStatusFilter] = useState("TOUS");

  const loadUsers = async () => {
    try {
      setLoading(true);

      const data = await getUsers();

      setUsers(data);
      setError("");
    } catch (err) {
      console.error("Erreur chargement utilisateurs :", err);

      setError(
        err.response?.data?.detail ||
          "Impossible de charger la liste des utilisateurs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const fullName = `${user.prenom || ""} ${user.nom || ""}`.toLowerCase();
    const email = (user.email || "").toLowerCase();
    const searchValue = search.toLowerCase();

    const matchSearch =
      fullName.includes(searchValue) ||
      email.includes(searchValue);

    const matchRole =
      roleFilter === "TOUS" ||
      user.role === roleFilter;

    const matchStatus =
      statusFilter === "TOUS" ||
      (statusFilter === "ACTIF" && user.actif === true) ||
      (statusFilter === "INACTIF" && user.actif === false);

    return matchSearch && matchRole && matchStatus;
  });

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.actif === true
  ).length;

  const inactiveUsers = users.filter(
    (user) => user.actif === false
  ).length;

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="users-list-page">

      {/* HEADER */}
      <div className="users-list-header">

        <div>
          <p className="users-eyebrow">
            GESTION DES UTILISATEURS
          </p>

          <h1>Utilisateurs</h1>

          <p className="users-subtitle">
            Gestion des comptes et des accès à la plateforme
          </p>
        </div>

        <button
          className="users-btn-primary"
          onClick={() =>
            navigate("/admin/utilisateurs/nouveau")
          }
        >
          + Nouvel utilisateur
        </button>

      </div>

      {/* STATISTIQUES */}
      <div className="users-stats">

        <div className="users-stat-card">
          <div className="users-stat-label">
            Total utilisateurs
          </div>

          <div className="users-stat-value">
            {totalUsers}
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-label">
            Utilisateurs actifs
          </div>

          <div className="users-stat-value users-stat-active">
            {activeUsers}
          </div>
        </div>

        <div className="users-stat-card">
          <div className="users-stat-label">
            Utilisateurs inactifs
          </div>

          <div className="users-stat-value users-stat-inactive">
            {inactiveUsers}
          </div>
        </div>

      </div>

      {/* FILTRES */}
      <div className="users-filters">

        <input
          type="text"
          className="users-search"
          placeholder="Rechercher par nom, prénom ou email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="users-select"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="TOUS">
            Tous les rôles
          </option>

          <option value="ADMINISTRATEUR">
            Administrateur
          </option>

          <option value="CHEF_CHANTIER">
            Chef de chantier
          </option>

          <option value="RESPONSABLE_FINANCIER">
            Responsable financier
          </option>

          <option value="RESPONSABLE_MAINTENANCE">
            Responsable maintenance
          </option>

          <option value="RESPONSABLE_RH">
            Responsable RH
          </option>
        </select>

        <select
          className="users-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="TOUS">
            Tous les statuts
          </option>

          <option value="ACTIF">
            Actif
          </option>

          <option value="INACTIF">
            Inactif
          </option>
        </select>

      </div>

      {/* LOADING */}
      {loading && (
        <p className="users-loading">
          Chargement des utilisateurs...
        </p>
      )}

      {/* ERROR */}
      {error && (
        <div className="users-error">
          {error}
        </div>
      )}

      {/* TABLEAU */}
      {!loading && !error && (
        <div className="users-table-wrap">

          <table className="users-table">

            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Création</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {filteredUsers.length === 0 ? (

                <tr>
                  <td
                    colSpan={6}
                    className="users-empty"
                  >
                    Aucun utilisateur ne correspond à
                    votre recherche.
                  </td>
                </tr>

              ) : (

                filteredUsers.map((user) => (

                  <tr key={user.id_utilisateur}>

                    <td>
                      <div className="users-name">
                        {user.prenom} {user.nom}
                      </div>
                    </td>

                    <td className="users-email">
                      {user.email}
                    </td>

                    <td>
                      <span
                        className={`users-role-badge ${
                          ROLE_CLASS[user.role] || ""
                        }`}
                      >
                        {ROLE_LABELS[user.role] ||
                          user.role ||
                          "—"}
                      </span>
                    </td>

                    <td>

                      {user.actif ? (

                        <span className="users-status-active">
                          <span className="users-status-dot"></span>
                          Actif
                        </span>

                      ) : (

                        <span className="users-status-inactive">
                          <span className="users-status-dot"></span>
                          Inactif
                        </span>

                      )}

                    </td>

                    <td className="users-date">
                      {formatDate(user.date_creation)}
                    </td>

                    <td className="users-actions">

                      <Link
                        to={`/admin/utilisateurs/${user.id_utilisateur}`}
                        className="users-action-link"
                      >
                        Voir
                      </Link>

                      <Link
                        to={`/admin/utilisateurs/${user.id_utilisateur}/modifier`}
                        className="users-action-link"
                      >
                        Modifier
                      </Link>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>
      )}

    </div>
  );
}

export default UsersList;