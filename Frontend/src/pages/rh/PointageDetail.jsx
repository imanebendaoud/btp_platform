import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getPointage, deletePointage } from "../../services/rhService";
import "./PointageDetail.css";

function PointageDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pointage, setPointage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadPointage();
  }, [id]);

  const loadPointage = async () => {
    try {
      setLoading(true);
      const data = await getPointage(id);
      setPointage(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger ce pointage.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement ce pointage ?")) return;
    try {
      setDeleting(true);
      await deletePointage(id);
      navigate("/rh/pointages");
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer ce pointage.");
      setDeleting(false);
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString("fr-FR");
  };

  const formatTime = (value) => (value ? value.slice(0, 5) : "-");

  if (loading) {
    return (
      <div className="rh-pointage-detail-page">
        <div className="rh-pointage-detail-loading">
          <div className="rh-pointage-detail-loader"></div>
          <span>Chargement du pointage...</span>
        </div>
      </div>
    );
  }

  if (error || !pointage) {
    return (
      <div className="rh-pointage-detail-page">
        <div className="rh-pointage-detail-error">{error || "Pointage introuvable."}</div>
        <Link to="/rh/pointages" className="rh-pointage-back-button">← Retour aux pointages</Link>
      </div>
    );
  }

  return (
    <div className="rh-pointage-detail-page">

      <div className="rh-pointage-detail-header">
        <div>
          <p className="rh-pointage-detail-eyebrow">POINTAGE</p>
          <h1>{pointage.employe_prenom} {pointage.employe_nom}</h1>
          <p className="rh-pointage-detail-subtitle">{formatDate(pointage.date)}</p>
        </div>

        <div className="rh-pointage-detail-actions">
          <Link to="/rh/pointages" className="rh-pointage-back-button">← Retour</Link>
          <Link to={`/rh/pointages/${id}/modifier`} className="rh-pointage-edit-button">
            Modifier
          </Link>
          <button
            type="button"
            className="rh-pointage-delete-button"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>

      <div className="rh-pointage-detail-card">
        <div className="rh-pointage-info">
          <span>Projet</span>
          <strong>{pointage.projet_nom || "-"}</strong>
        </div>
        <div className="rh-pointage-info">
          <span>Date</span>
          <strong>{formatDate(pointage.date)}</strong>
        </div>
        <div className="rh-pointage-info">
          <span>Heure d'entrée</span>
          <strong>{formatTime(pointage.heure_entree)}</strong>
        </div>
        <div className="rh-pointage-info">
          <span>Heure de sortie</span>
          <strong>{formatTime(pointage.heure_sortie)}</strong>
        </div>
      </div>

    </div>
  );
}

export default PointageDetail;