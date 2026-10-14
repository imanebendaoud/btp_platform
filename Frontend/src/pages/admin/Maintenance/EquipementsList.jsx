import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEquipements } from "../../../services/maintenanceService";

import "./EquipementsList.css";

function EquipementsList() {
  const [equipements, setEquipements] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadEquipements();
  }, []);

  const loadEquipements = async () => {
    try {
      setLoading(true);

      const data = await getEquipements();

      setEquipements(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les équipements.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = equipements.filter((equipement) => {
    const value = search.toLowerCase();

    return (
      String(equipement.nom || "")
        .toLowerCase()
        .includes(value) ||
      String(equipement.type || "")
        .toLowerCase()
        .includes(value) ||
      String(equipement.numero_serie || "")
        .toLowerCase()
        .includes(value) ||
      String(equipement.marque || "")
        .toLowerCase()
        .includes(value)
    );
  });

  const isDisponible = (equipement) => {
    const value = String(equipement.disponibilite || "").toUpperCase();
    return value === "DISPONIBLE" || value === "AVAILABLE";
  };

  const isEnMaintenance = (equipement) => {
    const value = String(equipement.etat || "").toUpperCase();
    return value === "EN_MAINTENANCE" || value === "MAINTENANCE";
  };

  if (loading) {
    return (
      <div className="equipements-page">
        <div className="equipements-loading">
          <div className="equipements-loader"></div>
          <span>Chargement des équipements...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="equipements-page">

      <div className="equipements-header">
        <div>
          <p className="equipements-eyebrow">
            MAINTENANCE
          </p>

          <h1>Équipements</h1>

          <p className="equipements-subtitle">
            Consultation du parc des équipements.
          </p>
        </div>

        <Link
          to="/admin/maintenance"
          className="maintenance-back-button"
        >
          ← Maintenance
        </Link>
      </div>

      {error && (
        <div className="equipements-error">
          {error}
        </div>
      )}

      <div className="equipements-toolbar">

        <input
          type="text"
          placeholder="Rechercher par nom, type, marque ou numéro de série..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <span className="equipements-count">
          {filtered.length} équipement(s)
        </span>

      </div>

      <div className="equipements-table-container">

        <table className="equipements-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Type</th>
              <th>Marque</th>
              <th>Modèle</th>
              <th>N° série</th>
              <th>État</th>
              <th>Disponibilité</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filtered.length === 0 ? (
              <tr>
                <td colSpan="9" className="equipements-empty">
                  Aucun équipement trouvé.
                </td>
              </tr>
            ) : (
              filtered.map((equipement) => (
                <tr key={equipement.id_equipement}>

                  <td>
                    #{equipement.id_equipement}
                  </td>

                  <td className="equipement-name">
                    {equipement.nom || "-"}
                  </td>

                  <td>
                    {equipement.type || "-"}
                  </td>

                  <td>
                    {equipement.marque || "-"}
                  </td>

                  <td>
                    {equipement.modele || "-"}
                  </td>

                  <td>
                    {equipement.numero_serie || "-"}
                  </td>

                  <td>
                    <span
                      className={
                        "maintenance-badge" +
                        (isEnMaintenance(equipement)
                          ? " maintenance-badge-warning"
                          : "")
                      }
                    >
                      {equipement.etat || "Non renseigné"}
                    </span>
                  </td>

                  <td>
                    <span
                      className={
                        "maintenance-badge" +
                        (isDisponible(equipement)
                          ? " maintenance-badge-ok"
                          : " maintenance-badge-muted")
                      }
                    >
                      {equipement.disponibilite || "-"}
                    </span>
                  </td>

                  <td>
                    <Link
                      to={`/admin/maintenance/equipements/${equipement.id_equipement}`}
                      className="maintenance-eye-button"
                      title="Voir le détail"
                    >
                      👁
                    </Link>
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

export default EquipementsList;