import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPointages } from "../../services/rhService";
import "./PointagesList.css";

function PointagesList() {
  const navigate = useNavigate();

  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    loadPointages();
  }, []);

  const loadPointages = async () => {
    try {
      setLoading(true);
      const data = await getPointages();
      setPointages(Array.isArray(data) ? data : data.results || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les pointages.");
    } finally {
      setLoading(false);
    }
  };

  const filtered = pointages.filter((p) => {
    const fullName = `${p.employe_prenom || ""} ${p.employe_nom || ""}`.toLowerCase();
    const matchesSearch =
      search.trim() === "" ||
      fullName.includes(search.toLowerCase()) ||
      (p.projet_nom || "").toLowerCase().includes(search.toLowerCase());

    const matchesDate = dateFilter === "" || p.date === dateFilter;

    return matchesSearch && matchesDate;
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
  );

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString("fr-FR");
  };

  const formatTime = (value) => {
    if (!value) return "-";
    return value.slice(0, 5);
  };

  if (loading) {
    return (
      <div className="rh-pointages-page">
        <div className="rh-pointages-loading">
          <div className="rh-pointages-loader"></div>
          <span>Chargement des pointages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rh-pointages-page">

      <div className="rh-pointages-header">
        <div>
          <p className="rh-pointages-eyebrow">RESSOURCES HUMAINES</p>
          <h1>Pointages</h1>
          <p className="rh-pointages-subtitle">
            Suivi des heures d'entrée et de sortie des employés.
          </p>
        </div>

        <button
          type="button"
          className="rh-pointages-new-button"
          onClick={() => navigate("/rh/pointages/nouveau")}
        >
          + Nouveau pointage
        </button>
      </div>

      {error && <div className="rh-pointages-error">{error}</div>}

      <div className="rh-pointages-toolbar">
        <input
          type="text"
          placeholder="Rechercher un employé, un projet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <input
          type="date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />

        <span className="rh-pointages-count">{sorted.length} pointage(s)</span>
      </div>

      <div className="rh-pointages-table-wrapper">
        <table className="rh-pointages-table">
          <thead>
            <tr>
              <th>Employé</th>
              <th>Projet</th>
              <th>Date</th>
              <th>Heure entrée</th>
              <th>Heure sortie</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="rh-pointages-empty">
                  Aucun pointage trouvé.
                </td>
              </tr>
            ) : (
              sorted.map((p) => (
                <tr
                  key={p.id_pointage}
                  onClick={() => navigate(`/rh/pointages/${p.id_pointage}`)}
                >
                  <td><strong>{p.employe_prenom} {p.employe_nom}</strong></td>
                  <td>{p.projet_nom || "-"}</td>
                  <td>{formatDate(p.date)}</td>
                  <td>{formatTime(p.heure_entree)}</td>
                  <td>{formatTime(p.heure_sortie)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default PointagesList;