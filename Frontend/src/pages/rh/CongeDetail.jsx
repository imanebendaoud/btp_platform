import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getConge, patchConge, deleteConge } from "../../services/rhService";
import "./CongeDetail.css";

function CongeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [conge, setConge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    loadConge();
  }, [id]);

  const loadConge = async () => {
    try {
      setLoading(true);
      const data = await getConge(id);
      setConge(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger ce congé.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (nouveauStatut) => {
    try {
      setActionLoading(true);
      await patchConge(id, { statut: nouveauStatut });
      setConge((prev) => ({ ...prev, statut: nouveauStatut }));
    } catch (err) {
      console.error(err);
      alert("Impossible de mettre à jour ce congé.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement cette demande de congé ?")) return;
    try {
      setDeleting(true);
      await deleteConge(id);
      navigate("/rh/conges");
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer ce congé.");
      setDeleting(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString("fr-FR");
  };

  if (loading) {
    return (
      <div className="rh-conge-detail-page">
        <div className="rh-conge-detail-loading">
          <div className="rh-conge-detail-loader"></div>
          <span>Chargement du congé...</span>
        </div>
      </div>
    );
  }

  if (error || !conge) {
    return (
      <div className="rh-conge-detail-page">
        <div className="rh-conge-detail-error">{error || "Demande introuvable."}</div>
        <Link to="/rh/conges" className="rh-conge-back-button">← Retour aux congés</Link>
      </div>
    );
  }

  const statutUpper = String(conge.statut || "").toUpperCase();

  return (
    <div className="rh-conge-detail-page">

      <div className="rh-conge-detail-header">
        <div>
          <p className="rh-conge-detail-eyebrow">DEMANDE DE CONGÉ</p>
          <h1>{conge.employe_prenom} {conge.employe_nom}</h1>
          <p className="rh-conge-detail-subtitle">{conge.type || "Congé"}</p>
        </div>

        <div className="rh-conge-detail-actions">
          <Link to="/rh/conges" className="rh-conge-back-button">← Retour</Link>
          <Link to={`/rh/conges/${id}/modifier`} className="rh-conge-edit-button">
            Modifier
          </Link>
          <button
            type="button"
            className="rh-conge-delete-button"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>

      <div className="rh-conge-detail-badges">
        <span className={
          "rh-conge-badge " +
          (statutUpper === "VALIDE" ? "valide" : statutUpper === "REFUSE" ? "refuse" : "attente")
        }>
          {conge.statut || "EN_ATTENTE"}
        </span>
      </div>

      {statutUpper === "EN_ATTENTE" && (
        <div className="rh-conge-decision-bar">
          <button
            type="button"
            className="rh-conge-validate-large"
            onClick={() => handleDecision("VALIDE")}
            disabled={actionLoading}
          >
            ✓ Valider cette demande
          </button>
          <button
            type="button"
            className="rh-conge-refuse-large"
            onClick={() => handleDecision("REFUSE")}
            disabled={actionLoading}
          >
            ✕ Refuser cette demande
          </button>
        </div>
      )}

      <div className="rh-conge-detail-card">
        <div className="rh-conge-info">
          <span>Type de congé</span>
          <strong>{conge.type || "-"}</strong>
        </div>
        <div className="rh-conge-info">
          <span>Date de début</span>
          <strong>{formatDate(conge.date_debut)}</strong>
        </div>
        <div className="rh-conge-info">
          <span>Date de fin</span>
          <strong>{formatDate(conge.date_fin)}</strong>
        </div>
        <div className="rh-conge-info">
          <span>Statut</span>
          <strong>{conge.statut || "EN_ATTENTE"}</strong>
        </div>
      </div>

      <div className="rh-conge-motif-card">
        <h2>Motif</h2>
        <p>{conge.motif || "Aucun motif renseigné."}</p>
      </div>

    </div>
  );
}

export default CongeDetail;