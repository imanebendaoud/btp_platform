import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { getMateriaux } from "../../../services/stockService";

import "./MateriauxList.css";

function MateriauxList() {
  const [materiaux, setMateriaux] = useState([]);
  const [search, setSearch] = useState("");
  const [filterEtat, setFilterEtat] = useState("TOUS");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // CHARGEMENT
  // ============================================================

  const loadMateriaux = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getMateriaux();

      setMateriaux(
        Array.isArray(data)
          ? data
          : data.results || data.value || []
      );
    } catch (err) {
      console.error("Erreur chargement matériaux :", err);

      setError(
        err.response?.data?.detail ||
          "Impossible de charger les matériaux."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMateriaux();
  }, []);

  // ============================================================
  // ÉTAT DU STOCK
  // ============================================================

  const getEtat = (materiau) => {
    const actuel = Number(materiau.stock_actuel);
    const minimum = Number(materiau.stock_minimum);

    if (actuel <= minimum) {
      return "ALERTE";
    }

    return "NORMAL";
  };

  // ============================================================
  // FILTRAGE
  // ============================================================

  const filteredMateriaux = useMemo(() => {
    return materiaux.filter((materiau) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        materiau.nom?.toLowerCase().includes(searchValue) ||
        String(materiau.id_materiau).includes(searchValue);

      const etat = getEtat(materiau);

      const matchesEtat =
        filterEtat === "TOUS" ||
        etat === filterEtat;

      return matchesSearch && matchesEtat;
    });
  }, [materiaux, search, filterEtat]);

  // ============================================================
  // STATISTIQUES
  // ============================================================

  const totalMateriaux = materiaux.length;

  const materiauxEnAlerte = materiaux.filter(
    (materiau) => getEtat(materiau) === "ALERTE"
  ).length;

  const materiauxNormaux = materiaux.filter(
    (materiau) => getEtat(materiau) === "NORMAL"
  ).length;

  // ============================================================
  // AFFICHAGE
  // ============================================================

  return (
    <div className="materiaux-page">

      {/* HEADER */}

      <div className="materiaux-header">

        <div>
          <div className="page-kicker">
            GESTION DU STOCK
          </div>

          <h1>Matériaux</h1>

          <p>
            Consultation des matériaux et suivi des niveaux de stock.
          </p>
        </div>

      </div>

      {/* STATISTIQUES */}

      <div className="materiaux-stats">

        <div className="stat-card">
          <div className="stat-label">
            TOTAL MATÉRIAUX
          </div>

          <div className="stat-value">
            {totalMateriaux}
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-label">
            STOCK NORMAL
          </div>

          <div className="stat-value">
            {materiauxNormaux}
          </div>
        </div>

        <div className="stat-card alert-card">
          <div className="stat-label">
            ALERTES STOCK
          </div>

          <div className="stat-value">
            {materiauxEnAlerte}
          </div>
        </div>

      </div>

      {/* FILTRES */}

      <div className="materiaux-filters">

        <div className="search-box">
          <span>⌕</span>

          <input
            type="text"
            placeholder="Rechercher un matériau..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          value={filterEtat}
          onChange={(e) => setFilterEtat(e.target.value)}
        >
          <option value="TOUS">
            Tous les états
          </option>

          <option value="NORMAL">
            Stock normal
          </option>

          <option value="ALERTE">
            Stock faible
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

      <div className="table-card">

        <div className="table-header">

          <div>
            <h2>Liste des matériaux</h2>

            <span>
              {filteredMateriaux.length} matériau(x)
            </span>
          </div>

        </div>

        {loading ? (
          <div className="loading-state">
            Chargement des matériaux...
          </div>
        ) : filteredMateriaux.length === 0 ? (
          <div className="empty-state">

            <div className="empty-icon">
              📦
            </div>

            <h3>
              Aucun matériau trouvé
            </h3>

            <p>
              Aucun matériau ne correspond à votre recherche.
            </p>

          </div>
        ) : (
          <div className="table-wrapper">

            <table>

              <thead>
                <tr>
                  <th>ID</th>
                  <th>MATÉRIAU</th>
                  <th>UNITÉ</th>
                  <th>STOCK ACTUEL</th>
                  <th>STOCK MINIMUM</th>
                  <th>ÉTAT</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>

                {filteredMateriaux.map((materiau) => {

                  const etat = getEtat(materiau);

                  return (
                    <tr
                      key={materiau.id_materiau}
                    >

                      <td>
                        <span className="material-id">
                          #{materiau.id_materiau}
                        </span>
                      </td>

                      <td>
                        <div className="material-name">
                          {materiau.nom}
                        </div>
                      </td>

                      <td>
                        {materiau.unite}
                      </td>

                      <td>
                        <strong>
                          {materiau.stock_actuel}
                        </strong>
                      </td>

                      <td>
                        {materiau.stock_minimum}
                      </td>

                      <td>
                        {etat === "ALERTE" ? (
                          <span className="status-badge status-alert">
                            ⚠ Stock faible
                          </span>
                        ) : (
                          <span className="status-badge status-normal">
                            ✓ Normal
                          </span>
                        )}
                      </td>

                      <td>

                        <div className="action-buttons">

                          <Link
                            to={`/admin/stock/materiaux/${materiau.id_materiau}`}
                            className="action-btn view"
                            title="Consulter"
                          >
                            👁
                          </Link>

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default MateriauxList;