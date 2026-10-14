import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getEquipement } from "../../../services/maintenanceService";

import "./EquipementDetail.css";

function EquipementDetail() {
  const { id } = useParams();

  const [equipement, setEquipement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEquipement();
  }, [id]);

  const loadEquipement = async () => {
    try {
      setLoading(true);

      const data = await getEquipement(id);

      setEquipement(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger l'équipement.");
    } finally {
      setLoading(false);
    }
  };

  const isDisponible =
    equipement &&
    ["DISPONIBLE", "AVAILABLE"].includes(
      String(equipement.disponibilite || "").toUpperCase()
    );

  const isEnMaintenance =
    equipement &&
    ["EN_MAINTENANCE", "MAINTENANCE"].includes(
      String(equipement.etat || "").toUpperCase()
    );

  if (loading) {
    return (
      <div className="equipement-detail-page">
        <div className="equipement-detail-loading">
          <div className="equipement-detail-loader"></div>
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  if (error || !equipement) {
    return (
      <div className="equipement-detail-page">

        <div className="equipement-detail-error">
          {error || "Équipement introuvable."}
        </div>

        <Link
          to="/admin/maintenance/equipements"
          className="maintenance-back-button"
        >
          ← Retour aux équipements
        </Link>

      </div>
    );
  }

  return (
    <div className="equipement-detail-page">

      <div className="equipement-detail-header">
        <div>
          <p className="equipement-detail-eyebrow">
            ÉQUIPEMENT
          </p>

          <h1>{equipement.nom}</h1>

          <p className="equipement-detail-subtitle">
            Équipement #{equipement.id_equipement}
          </p>
        </div>

        <Link
          to="/admin/maintenance/equipements"
          className="maintenance-back-button"
        >
          ← Retour
        </Link>
      </div>

      <div className="equipement-detail-badges">
        <span
          className={
            "maintenance-badge" +
            (isEnMaintenance ? " maintenance-badge-warning" : "")
          }
        >
          {equipement.etat || "État non renseigné"}
        </span>

        <span
          className={
            "maintenance-badge" +
            (isDisponible ? " maintenance-badge-ok" : " maintenance-badge-muted")
          }
        >
          {equipement.disponibilite || "Disponibilité inconnue"}
        </span>
      </div>

      <div className="equipement-detail-card">

        <div className="equipement-info">
          <span>Nom</span>
          <strong>{equipement.nom || "-"}</strong>
        </div>

        <div className="equipement-info">
          <span>Type</span>
          <strong>{equipement.type || "-"}</strong>
        </div>

        <div className="equipement-info">
          <span>Numéro de série</span>
          <strong>{equipement.numero_serie || "-"}</strong>
        </div>

        <div className="equipement-info">
          <span>Marque</span>
          <strong>{equipement.marque || "-"}</strong>
        </div>

        <div className="equipement-info">
          <span>Modèle</span>
          <strong>{equipement.modele || "-"}</strong>
        </div>

        <div className="equipement-info">
          <span>Date d'acquisition</span>
          <strong>{equipement.date_acquisition || "-"}</strong>
        </div>

        <div className="equipement-info">
          <span>État</span>
          <strong>{equipement.etat || "-"}</strong>
        </div>

        <div className="equipement-info">
          <span>Disponibilité</span>
          <strong>{equipement.disponibilite || "-"}</strong>
        </div>

      </div>

    </div>
  );
}

export default EquipementDetail;