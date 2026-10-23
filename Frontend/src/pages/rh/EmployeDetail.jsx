import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getEmploye, deleteEmploye } from "../../services/rhService";
import "./EmployeDetail.css";

function EmployeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [employe, setEmploye] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadEmploye();
  }, [id]);

  const loadEmploye = async () => {
    try {
      setLoading(true);
      const data = await getEmploye(id);
      setEmploye(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger cet employé.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement cet employé ?")) return;

    try {
      setDeleting(true);
      await deleteEmploye(id);
      navigate("/rh/employes");
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer cet employé.");
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
      <div className="rh-employe-detail-page">
        <div className="rh-employe-detail-loading">
          <div className="rh-employe-detail-loader"></div>
          <span>Chargement de l'employé...</span>
        </div>
      </div>
    );
  }

  if (error || !employe) {
    return (
      <div className="rh-employe-detail-page">
        <div className="rh-employe-detail-error">
          {error || "Employé introuvable."}
        </div>
        <Link to="/rh/employes" className="rh-employe-back-button">
          ← Retour aux employés
        </Link>
      </div>
    );
  }

  return (
    <div className="rh-employe-detail-page">

      <div className="rh-employe-detail-header">
        <div>
          <p className="rh-employe-detail-eyebrow">FICHE EMPLOYÉ</p>
          <h1>{employe.prenom} {employe.nom}</h1>
          <p className="rh-employe-detail-subtitle">
            {employe.poste || "Poste non défini"}
          </p>
        </div>

        <div className="rh-employe-detail-actions">
          <Link to="/rh/employes" className="rh-employe-back-button">
            ← Retour
          </Link>
          <Link
            to={`/rh/employes/${id}/modifier`}
            className="rh-employe-edit-button"
          >
            Modifier
          </Link>
          <button
            type="button"
            className="rh-employe-delete-button"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>

      <div className="rh-employe-detail-badges">
        <span className={
          "rh-employe-badge " +
          (String(employe.statut || "").toUpperCase() === "ACTIF" ? "active" : "inactive")
        }>
          {employe.statut || "Statut non défini"}
        </span>
      </div>

      <div className="rh-employe-detail-card">

        <div className="rh-employe-info">
          <span>CIN</span>
          <strong>{employe.cin || "-"}</strong>
        </div>

        <div className="rh-employe-info">
          <span>Téléphone</span>
          <strong>{employe.telephone || "-"}</strong>
        </div>

        <div className="rh-employe-info">
          <span>Email</span>
          <strong>{employe.email || "-"}</strong>
        </div>

        <div className="rh-employe-info">
          <span>Poste</span>
          <strong>{employe.poste || "-"}</strong>
        </div>

        <div className="rh-employe-info">
          <span>Date d'embauche</span>
          <strong>{formatDate(employe.date_embauche)}</strong>
        </div>

        <div className="rh-employe-info">
          <span>Coût journalier</span>
          <strong>{formatMoney(employe.cout_journalier)}</strong>
        </div>

      </div>

    </div>
  );
}

export default EmployeDetail;