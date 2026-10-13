import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAffectations } from "../../../services/maintenanceService";

import "./AffectationsList.css";

function AffectationsList() {
  const [affectations, setAffectations] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAffectations();
  }, []);

  const loadAffectations = async () => {
    try {
      setLoading(true);

      const data = await getAffectations();

      setAffectations(
        Array.isArray(data) ? data : data.results || []
      );
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les affectations.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = affectations.filter((affectation) => {
    const value = search.toLowerCase();

    return (
      String(affectation.equipement_nom || affectation.nom_equipement || "")
        .toLowerCase()
        .includes(value) ||
      String(affectation.projet_nom || affectation.nom_projet || "")
        .toLowerCase()
        .includes(value)
    );
  });

  const isEnCours = (affectation) => !affectation.date_retour;

  if (loading) {
    return (
      <div className="affectations-page">
        <div className="affectations-loading">
          <div className="affectations-loader"></div>
          <span>Chargement des affectations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="affectations-page">

      <div className="affectations-header">
        <div>
          <p className="affectations-eyebrow">MAINTENANCE</p>
          <h1>Affectations</h1>
          <p className="affectations-subtitle">
            Équipements affectés aux différents projets.
          </p>
        </div>

        <Link to="/admin/maintenance" className="maintenance-back-button">
          ← Maintenance
        </Link>
      </div>

      {error && <div className="affectations-error">{error}</div>}

      <div className="affectations-toolbar">
        <input
          type="text"
          placeholder="Rechercher par équipement ou projet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <span className="affectations-count">
          {filtered.length} affectation(s)
        </span>
      </div>

      <div className="affectations-table-container">
        <table className="affectations-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Équipement</th>
              <th>Projet</th>
              <th>Date d'affectation</th>
              <th>Date de retour</th>
              <th>Statut</th>
            </tr>
          </thead>

          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan="6" className="affectations-empty">
                  Aucune affectation trouvée.
                </td>
              </tr>
            ) : (
              filtered.map((affectation) => (
                <tr key={affectation.id_affectation}>
                  <td>#{affectation.id_affectation}</td>

                  <td className="affectation-equipement">
                    {affectation.equipement_nom ||
                      affectation.nom_equipement ||
                      `Équipement #${affectation.id_equipement || "-"}`}
                  </td>

                  <td>
                    {affectation.projet_nom ||
                      affectation.nom_projet ||
                      `Projet #${affectation.id_projet || "-"}`}
                  </td>

                  <td>{affectation.date_affectation || "-"}</td>

                  <td>{affectation.date_retour || "-"}</td>

                  <td>
                    <span
                      className={
                        "maintenance-badge" +
                        (isEnCours(affectation)
                          ? " maintenance-badge-warning"
                          : " maintenance-badge-ok")
                      }
                    >
                      {isEnCours(affectation) ? "En cours" : "Terminée"}
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

export default AffectationsList;