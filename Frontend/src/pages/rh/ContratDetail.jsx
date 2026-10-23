import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getContrat, deleteContrat } from "../../services/rhService";
import "./ContratDetail.css";

function ContratDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [contrat, setContrat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadContrat();
  }, [id]);

  const loadContrat = async () => {
    try {
      setLoading(true);
      const data = await getContrat(id);
      setContrat(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger ce contrat.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement ce contrat ?")) return;
    try {
      setDeleting(true);
      await deleteContrat(id);
      navigate("/rh/contrats");
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer ce contrat.");
      setDeleting(false);
    }
  };

  const formatMoney = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    return new Intl.NumberFormat("fr-MA").format(value) + " DH";
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString("fr-FR");
  };

  if (loading) {
    return (
      <div className="rh-contrat-detail-page">
        <div className="rh-contrat-detail-loading">
          <div className="rh-contrat-detail-loader"></div>
          <span>Chargement du contrat...</span>
        </div>
      </div>
    );
  }

  if (error || !contrat) {
    return (
      <div className="rh-contrat-detail-page">
        <div className="rh-contrat-detail-error">
          {error || "Contrat introuvable."}
        </div>
        <Link to="/rh/contrats" className="rh-contrat-back-button">
          ← Retour aux contrats
        </Link>
      </div>
    );
  }

  return (
    <div className="rh-contrat-detail-page">

      <div className="rh-contrat-detail-header">
        <div>
          <p className="rh-contrat-detail-eyebrow">CONTRAT DE TRAVAIL</p>
          <h1>{contrat.employe_prenom} {contrat.employe_nom}</h1>
          <p className="rh-contrat-detail-subtitle">
            {contrat.type_contrat || "Type non défini"}
          </p>
        </div>

        <div className="rh-contrat-detail-actions">
          <Link to="/rh/contrats" className="rh-contrat-back-button">← Retour</Link>
          <Link to={`/rh/contrats/${id}/modifier`} className="rh-contrat-edit-button">
            Modifier
          </Link>
          <button
            type="button"
            className="rh-contrat-delete-button"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>

      <div className="rh-contrat-detail-badges">
        <span className={
          "rh-contrat-badge " +
          (String(contrat.statut || "").toUpperCase() === "ACTIF" ? "active" : "inactive")
        }>
          {contrat.statut || "Statut non défini"}
        </span>
      </div>

      <div className="rh-contrat-detail-card">
        <div className="rh-contrat-info">
          <span>Type de contrat</span>
          <strong>{contrat.type_contrat || "-"}</strong>
        </div>
        <div className="rh-contrat-info">
          <span>Salaire</span>
          <strong>{formatMoney(contrat.salaire)}</strong>
        </div>
        <div className="rh-contrat-info">
          <span>Date de début</span>
          <strong>{formatDate(contrat.date_debut)}</strong>
        </div>
        <div className="rh-contrat-info">
          <span>Date de fin</span>
          <strong>{formatDate(contrat.date_fin)}</strong>
        </div>
      </div>

    </div>
  );
}

export default ContratDetail;