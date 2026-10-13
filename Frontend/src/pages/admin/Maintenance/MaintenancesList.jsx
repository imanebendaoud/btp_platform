import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMaintenances } from "../../../services/maintenanceService";

import "./MaintenancesList.css";

function MaintenancesList() {
  const [maintenances, setMaintenances] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMaintenances();
  }, []);

  const loadMaintenances = async () => {
    try {
      setLoading(true);

      const data = await getMaintenances();

      setMaintenances(
        Array.isArray(data) ? data : data.results || []
      );
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les maintenances.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = maintenances.filter((maintenance) => {
    const value = search.toLowerCase();

    return (
      String(maintenance.equipement_nom || maintenance.nom_equipement || "")
        .toLowerCase()
        .includes(value) ||
      String(maintenance.type_maintenance || maintenance.type || "")
        .toLowerCase()
        .includes(value) ||
      String(maintenance.description || "")
        .toLowerCase()
        .includes(value)
    );
  });

  const getStatutClass = (maintenance) => {
    const statut = String(maintenance.statut || "").toUpperCase();

    if (statut === "TERMINEE" || statut === "TERMINÉE" || statut === "DONE") {
      return "maintenance-badge-ok";
    }

    if (statut === "EN_COURS" || statut === "EN COURS") {
      return "maintenance-badge-warning";
    }

    return "maintenance-badge-muted";
  };

  if (loading) {
    return (
      <div className="maintenances-page">
        <div className="maintenances-loading">
          <div className="maintenances-loader"></div>
          <span>Chargement des maintenances...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="maintenances-page">

      <div className="maintenances-header">
        <div>
          <p className="maintenances-eyebrow">MAINTENANCE</p>
          <h1>Maintenances</h1>
          <p className="maintenances-subtitle">
            Historique des interventions sur les équipements.
          </p>
        </div>

        <Link to="/admin/maintenance" className="maintenance-back-button">
          ← Maintenance
        </Link>
      </div>

      {error && <div className="maintenances-error">{error}</div>}

      <div className="maintenances-toolbar">
        <input
          type="text"
          placeholder="Rechercher par équipement, type ou description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <span className="maintenances-count">
          {filtered.length} maintenance(s)
        </span>
      </div>

      <div className="maintenances-table-container">
        <table className="maintenances-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Équipement</th>
              <th>Type</th>
              <th>Description</th>
              <th>Date</th>
              <th>Coût</th>
              <th>Statut</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="7" className="maintenances-empty">
                  Aucune maintenance trouvée.
                </td>
              </tr>
            ) : (
              filtered.map((maintenance) => (
                <tr key={maintenance.id_maintenance}>
                  <td>#{maintenance.id_maintenance}</td>

                  <td className="maintenance-equipement">
                    {maintenance.equipement_nom ||
                      maintenance.nom_equipement ||
                      `Équipement #${maintenance.id_equipement || "-"}`}
                  </td>

                  <td>{maintenance.type_maintenance || maintenance.type || "-"}</td>

                  <td className="maintenances-description">
                    {maintenance.description || "-"}
                  </td>

                  <td>{maintenance.date_maintenance || maintenance.date || "-"}</td>

                  <td>
                    {maintenance.cout
                      ? `${Number(maintenance.cout).toLocaleString("fr-FR")} DH`
                      : "-"}
                  </td>

                  <td>
                    <span className={"maintenance-badge " + getStatutClass(maintenance)}>
                      {maintenance.statut || "Non renseigné"}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default MaintenancesList;