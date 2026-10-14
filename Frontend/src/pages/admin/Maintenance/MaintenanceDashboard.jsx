import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getEquipements,
  getAffectations,
  getMaintenances,
} from "../../../services/maintenanceService";

import "./MaintenanceDashboard.css";

function MaintenanceDashboard() {
  const [equipements, setEquipements] = useState([]);
  const [affectations, setAffectations] = useState([]);
  const [maintenances, setMaintenances] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [
        equipementsData,
        affectationsData,
        maintenancesData,
      ] = await Promise.all([
        getEquipements(),
        getAffectations(),
        getMaintenances(),
      ]);

      setEquipements(
        Array.isArray(equipementsData)
          ? equipementsData
          : equipementsData.results || []
      );

      setAffectations(
        Array.isArray(affectationsData)
          ? affectationsData
          : affectationsData.results || []
      );

      setMaintenances(
        Array.isArray(maintenancesData)
          ? maintenancesData
          : maintenancesData.results || []
      );

      setError("");
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données de maintenance.");
    } finally {
      setLoading(false);
    }
  };

  const countByValue = (items, field, values) => {
    return items.filter((item) =>
      values.includes(
        String(item[field] || "").toUpperCase()
      )
    ).length;
  };

  const equipementsDisponibles = countByValue(
    equipements,
    "disponibilite",
    ["DISPONIBLE", "AVAILABLE"]
  );

  const equipementsMaintenance = countByValue(
    equipements,
    "etat",
    ["EN_MAINTENANCE", "MAINTENANCE"]
  );

  const maintenancesEnCours = countByValue(
    maintenances,
    "statut",
    ["EN_COURS", "EN COURS"]
  );

  if (loading) {
    return (
      <div className="maintenance-dashboard">
        <div className="maintenance-loading">
          <div className="maintenance-loader"></div>
          <span>Chargement du module maintenance...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="maintenance-dashboard">

      <div className="maintenance-dashboard-header">
        <div>
          <p className="maintenance-eyebrow">
            GESTION DE LA MAINTENANCE
          </p>

          <h1>Maintenance</h1>

          <p className="maintenance-subtitle">
            Vue générale des équipements, affectations et interventions.
          </p>
        </div>

        <div className="maintenance-status">
          <span className="maintenance-status-dot"></span>
          Données à jour
        </div>
      </div>

      {error && (
        <div className="maintenance-error">
          <div className="maintenance-error-icon">!</div>
          <div>
            <strong>Erreur de chargement</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <div className="maintenance-stats">

        <div className="maintenance-stat-card">
          <div className="maintenance-stat-top">
            <div className="maintenance-stat-icon">⚙</div>
            <span className="maintenance-stat-label">ÉQUIPEMENTS</span>
          </div>
          <strong className="maintenance-stat-value">{equipements.length}</strong>
          <small>Total enregistré</small>
        </div>

        <div className="maintenance-stat-card">
          <div className="maintenance-stat-top">
            <div className="maintenance-stat-icon maintenance-stat-icon-ok">✓</div>
            <span className="maintenance-stat-label">DISPONIBLES</span>
          </div>
          <strong className="maintenance-stat-value">{equipementsDisponibles}</strong>
          <small>Équipements disponibles</small>
        </div>

        <div className="maintenance-stat-card">
          <div className="maintenance-stat-top">
            <div className="maintenance-stat-icon maintenance-stat-icon-warning">⚠</div>
            <span className="maintenance-stat-label">EN MAINTENANCE</span>
          </div>
          <strong className="maintenance-stat-value">{equipementsMaintenance}</strong>
          <small>Équipements concernés</small>
        </div>

        <div className="maintenance-stat-card">
          <div className="maintenance-stat-top">
            <div className="maintenance-stat-icon">🔧</div>
            <span className="maintenance-stat-label">INTERVENTIONS</span>
          </div>
          <strong className="maintenance-stat-value">{maintenances.length}</strong>
          <small>Total des maintenances</small>
        </div>

        <div className="maintenance-stat-card">
          <div className="maintenance-stat-top">
            <div className="maintenance-stat-icon maintenance-stat-icon-warning">⏳</div>
            <span className="maintenance-stat-label">EN COURS</span>
          </div>
          <strong className="maintenance-stat-value">{maintenancesEnCours}</strong>
          <small>Interventions en cours</small>
        </div>

        <div className="maintenance-stat-card">
          <div className="maintenance-stat-top">
            <div className="maintenance-stat-icon">📍</div>
            <span className="maintenance-stat-label">AFFECTATIONS</span>
          </div>
          <strong className="maintenance-stat-value">{affectations.length}</strong>
          <small>Historique des affectations</small>
        </div>

      </div>

      <div className="maintenance-section-title">
        <h2>Modules</h2>
        <p>Accédez rapidement aux différentes informations de maintenance.</p>
      </div>

      <div className="maintenance-sections">

        <Link
          to="/admin/maintenance/equipements"
          className="maintenance-section-card"
        >
          <div className="maintenance-section-icon">⚙</div>

          <div className="maintenance-section-text">
            <h2>Équipements</h2>
            <p>Consulter les équipements et leur état.</p>
          </div>

          <span className="maintenance-section-arrow">→</span>
        </Link>

        <Link
          to="/admin/maintenance/affectations"
          className="maintenance-section-card"
        >
          <div className="maintenance-section-icon">📍</div>

          <div className="maintenance-section-text">
            <h2>Affectations</h2>
            <p>Consulter les équipements affectés aux projets.</p>
          </div>

          <span className="maintenance-section-arrow">→</span>
        </Link>

        <Link
          to="/admin/maintenance/maintenances"
          className="maintenance-section-card"
        >
          <div className="maintenance-section-icon">🔧</div>

          <div className="maintenance-section-text">
            <h2>Maintenances</h2>
            <p>Consulter l'historique des interventions.</p>
          </div>

          <span className="maintenance-section-arrow">→</span>
        </Link>

      </div>

    </div>
  );
}

export default MaintenanceDashboard;