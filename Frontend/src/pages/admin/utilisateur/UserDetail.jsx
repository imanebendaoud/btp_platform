import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getUser,
  updateUser,
} from "../../../services/usersService";
import "./UserDetail.css";

const ROLE_LABELS = {
  ADMINISTRATEUR: "Administrateur",
  CHEF_CHANTIER: "Chef de chantier",
  RESPONSABLE_FINANCIER: "Responsable financier",
  RESPONSABLE_MAINTENANCE: "Responsable maintenance",
  RESPONSABLE_RH: "Responsable RH",
};

function UserDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadUser = async () => {
    try {
      setLoading(true);

      const data = await getUser(id);

      setUser(data);
      setError("");
    } catch (err) {
      console.error(
        "Erreur chargement utilisateur :",
        err
      );

      setError(
        err.response?.data?.detail ||
          "Utilisateur introuvable."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, [id]);

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

  const handleToggleStatus = async () => {
    if (!user) {
      return;
    }

    const newStatus = !user.actif;

    const message = newStatus
      ? `Réactiver le compte de ${user.prenom} ${user.nom} ?`
      : `Désactiver le compte de ${user.prenom} ${user.nom} ?`;

    if (!window.confirm(message)) {
      return;
    }

    try {
      setUpdating(true);

      const updated = await updateUser(id, {
        actif: newStatus,
      });

      setUser(updated);
    } catch (err) {
      console.error(
        "Erreur modification statut :",
        err
      );

      alert(
        "Impossible de modifier le statut du compte."
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="user-detail-page">
        <p className="user-detail-loading">
          Chargement de l'utilisateur...
        </p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="user-detail-page">

        <Link
          to="/admin/utilisateurs"
          className="user-detail-back"
        >
          ← Retour aux utilisateurs
        </Link>

        <div className="user-detail-error">
          {error || "Utilisateur introuvable."}
        </div>

      </div>
    );
  }

  return (
    <div className="user-detail-page">

      {/* HEADER */}
      <div className="user-detail-header">

        <div>

          <Link
            to="/admin/utilisateurs"
            className="user-detail-back"
          >
            ← Retour aux utilisateurs
          </Link>

          <p className="user-detail-eyebrow">
            COMPTE UTILISATEUR
          </p>

          <h1>
            {user.prenom} {user.nom}
          </h1>

          <p className="user-detail-subtitle">
            {ROLE_LABELS[user.role] || user.role}
          </p>

        </div>

        <div className="user-detail-header-actions">

          <Link
            to={`/admin/utilisateurs/${id}/modifier`}
            className="user-detail-btn-secondary"
          >
            Modifier
          </Link>

          <button
            className={
              user.actif
                ? "user-detail-btn-danger"
                : "user-detail-btn-primary"
            }
            onClick={handleToggleStatus}
            disabled={updating}
          >
            {updating
              ? "Modification..."
              : user.actif
              ? "Désactiver"
              : "Réactiver"}
          </button>

        </div>

      </div>

      {/* STATUT */}
      <div className="user-detail-status-card">

        <div>

          <p className="user-detail-card-label">
            Statut du compte
          </p>

          <div
            className={
              user.actif
                ? "user-detail-status active"
                : "user-detail-status inactive"
            }
          >
            <span></span>

            {user.actif
              ? "Compte actif"
              : "Compte inactif"}
          </div>

        </div>

        <div className="user-detail-status-info">
          {user.actif
            ? "Ce compte peut accéder à la plateforme."
            : "Ce compte ne peut plus accéder à la plateforme."}
        </div>

      </div>

      {/* INFORMATIONS */}
      <div className="user-detail-card">

        <div className="user-detail-card-header">
          <h2>
            Informations du compte
          </h2>
        </div>

        <div className="user-detail-grid">

          <div className="user-detail-item">
            <span>Nom</span>
            <strong>{user.nom || "—"}</strong>
          </div>

          <div className="user-detail-item">
            <span>Prénom</span>
            <strong>{user.prenom || "—"}</strong>
          </div>

          <div className="user-detail-item">
            <span>Email</span>
            <strong>{user.email || "—"}</strong>
          </div>

          <div className="user-detail-item">
            <span>Rôle</span>
            <strong>
              {ROLE_LABELS[user.role] ||
                user.role ||
                "—"}
            </strong>
          </div>

          <div className="user-detail-item">
            <span>ID utilisateur</span>
            <strong>
              #{user.id_utilisateur}
            </strong>
          </div>

          <div className="user-detail-item">
            <span>Date de création</span>
            <strong>
              {formatDate(user.date_creation)}
            </strong>
          </div>

        </div>

      </div>

      {/* SECURITE */}
      <div className="user-detail-card">

        <div className="user-detail-card-header">
          <h2>
            Sécurité
          </h2>
        </div>

        <div className="user-detail-security">

          <div>
            <strong>
              Mot de passe
            </strong>

            <p>
              Le mot de passe n'est jamais affiché
              dans l'interface.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}

export default UserDetail;