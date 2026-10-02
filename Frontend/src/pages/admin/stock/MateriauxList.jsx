import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMateriaux, deleteMateriau } from "../../../services/stockService";
import "./MateriauxList.css";

function MateriauxList() {
  const navigate = useNavigate();

  const [materiaux, setMateriaux] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [onlyAlerts, setOnlyAlerts] = useState(false);

  const loadMateriaux = async () => {
    try {
      setLoading(true);
      const data = await getMateriaux();
      setMateriaux(data);
      setError("");
    } catch (err) {
      console.error("Erreur chargement matériaux :", err);
      setError("Impossible de charger l'inventaire.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMateriaux();
  }, []);

  const handleDelete = async (m) => {
    if (!window.confirm(`Supprimer « ${m.nom} » de l'inventaire ?`)) return;

    try {
      await deleteMateriau(m.id_materiau);
      setMateriaux((prev) => prev.filter((item) => item.id_materiau !== m.id_materiau));
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("Impossible de supprimer ce matériau.");
    }
  };

  const isLow = (m) => Number(m.stock_actuel) < Number(m.stock_minimum);

  const filtered = materiaux
    .filter((m) => m.nom?.toLowerCase().includes(search.toLowerCase()))
    .filter((m) => !onlyAlerts || isLow(m));

  const alertCount = materiaux.filter(isLow).length;

  return (
    <div className="mat-list-page">

      <div className="mat-list-header">
        <div>
          <p className="mat-eyebrow">GESTION DES STOCKS</p>
          <h1>Matériaux</h1>
          <p className="mat-subtitle">
            {filtered.length} matériau(x) affiché(s)
            {alertCount > 0 && (
              <span className="mat-alert-count"> — {alertCount} en alerte de stock</span>
            )}
          </p>
        </div>

        <button className="mat-btn-primary" onClick={() => navigate("/admin/stock/materiaux/nouveau")}>
          + Nouveau matériau
        </button>
      </div>

      <div className="mat-filters">
        <input
          type="text"
          placeholder="Rechercher un matériau..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mat-search"
        />

        <label className="mat-checkbox">
          <input
            type="checkbox"
            checked={onlyAlerts}
            onChange={(e) => setOnlyAlerts(e.target.checked)}
          />
          Afficher uniquement les alertes
        </label>
      </div>

      {loading && <p className="mat-loading">Chargement...</p>}
      {error && <p className="mat-error">{error}</p>}

      {!loading && !error && (
        <div className="mat-table-wrap">
          <table className="mat-table">
            <thead>
              <tr>
                <th>Matériau</th>
                <th>Unité</th>
                <th>Stock actuel</th>
                <th>Stock minimum</th>
                <th>État</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="mat-empty">
                    Aucun matériau ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => {
                  const low = isLow(m);
                  return (
                    <tr key={m.id_materiau} className={low ? "mat-row-alert" : ""}>
                      <td className="mat-strong">
                        <Link to={`/admin/stock/materiaux/${m.id_materiau}/modifier`}>{m.nom}</Link>
                      </td>
                      <td>{m.unite}</td>
                      <td>{Number(m.stock_actuel).toLocaleString("fr-MA")}</td>
                      <td className="mat-muted">{Number(m.stock_minimum).toLocaleString("fr-MA")}</td>
                      <td>
                        {low ? (
                          <span className="mat-badge mat-badge-alert">Stock faible</span>
                        ) : (
                          <span className="mat-badge mat-badge-ok">Normal</span>
                        )}
                      </td>
                      <td className="mat-actions">
                        <Link to={`/admin/stock/materiaux/${m.id_materiau}/modifier`} className="mat-action-link">
                          Modifier
                        </Link>
                        <button className="mat-action-danger" onClick={() => handleDelete(m)}>
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default MateriauxList;