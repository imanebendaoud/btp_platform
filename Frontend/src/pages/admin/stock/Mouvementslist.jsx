import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getMouvements,
} from "../../../services/stockService";

import "./Mouvementslist.css";

function MouvementsList() {
  const navigate = useNavigate();

  const [mouvements, setMouvements] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("TOUS");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // CHARGEMENT
  // ============================================================

  const loadMouvements = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMouvements();

      setMouvements(
        Array.isArray(data)
          ? data
          : data.results || data.value || []
      );
    } catch (err) {
      console.error("Erreur chargement mouvements :", err);

      setError(
        err.response?.data?.detail ||
          "Impossible de charger les mouvements."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMouvements();
  }, []);

  // ============================================================
  // FILTRAGE
  // ============================================================

  const filtered = mouvements.filter((mouvement) => {

    const text = search.toLowerCase().trim();

    const matchesSearch =
      String(mouvement.id_mouvement)
        .toLowerCase()
        .includes(text) ||

      String(mouvement.id_materiau)
        .toLowerCase()
        .includes(text) ||

      String(mouvement.id_projet || "")
        .toLowerCase()
        .includes(text) ||

      mouvement.motif
        ?.toLowerCase()
        .includes(text);

    const matchesType =
      typeFilter === "TOUS" ||
      mouvement.type_mouvement === typeFilter;

    return matchesSearch && matchesType;
  });

  // ============================================================
  // AFFICHAGE
  // ============================================================

  return (
    <div className="mouvements-page">

      <div className="page-header">

        <div>
          <h1>
            Historique des mouvements
          </h1>

          <p>
            Consultation des entrées et sorties de matériaux
          </p>
        </div>

      </div>

      {/* FILTRES */}

      <div className="filters-card">

        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="TOUS">
            Tous les mouvements
          </option>

          <option value="ENTREE">
            Entrées
          </option>

          <option value="SORTIE">
            Sorties
          </option>

          <option value="AJUSTEMENT">
            Ajustements
          </option>
        </select>

      </div>

      {/* ERREUR */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* TABLE */}

      <div className="content-card">

        {loading ? (
          <p className="message">
            Chargement...
          </p>
        ) : (
          <div className="table-container">

            <table>

              <thead>

                <tr>
                  <th>ID</th>
                  <th>MATÉRIAU</th>
                  <th>PROJET</th>
                  <th>TYPE</th>
                  <th>QUANTITÉ</th>
                  <th>DATE</th>
                  <th>MOTIF</th>
                  <th>ACTIONS</th>
                </tr>

              </thead>

              <tbody>

                {filtered.length === 0 ? (

                  <tr>

                    <td
                      colSpan="8"
                      className="empty"
                    >
                      Aucun mouvement trouvé.
                    </td>

                  </tr>

                ) : (

                  filtered.map((mouvement) => (

                    <tr
                      key={mouvement.id_mouvement}
                    >

                      <td>
                        #{mouvement.id_mouvement}
                      </td>

                      <td>
                        #{mouvement.id_materiau}
                      </td>

                      <td>
                        {mouvement.id_projet
                          ? `#${mouvement.id_projet}`
                          : "-"}
                      </td>

                      <td>

                        <span
                          className={`movement-type ${
                            mouvement.type_mouvement === "ENTREE"
                              ? "entry"
                              : mouvement.type_mouvement === "SORTIE"
                              ? "exit"
                              : ""
                          }`}
                        >
                          {mouvement.type_mouvement}
                        </span>

                      </td>

                      <td>
                        {mouvement.quantite}
                      </td>

                      <td>
                        {mouvement.date_mouvement
                          ? new Date(
                              mouvement.date_mouvement
                            ).toLocaleString("fr-FR")
                          : "-"}
                      </td>

                      <td>
                        {mouvement.motif || "-"}
                      </td>

                      <td>

                        <div className="actions">

                          <button
                            className="btn-view"
                            onClick={() =>
                              navigate(
                                `/admin/stock/mouvements/${mouvement.id_mouvement}`
                              )
                            }
                          >
                            Voir
                          </button>

                        </div>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default MouvementsList;