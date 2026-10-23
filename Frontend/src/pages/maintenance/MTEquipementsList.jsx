import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEquipements, etatBadge } from "../../services/mtService";
import "./MT.css";

function MTEquipementsList() {
  const navigate = useNavigate();

  const [equipements, setEquipements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [etatFilter, setEtatFilter] = useState("TOUS");

  useEffect(() => {
    const load = async () => {
      try {
        setEquipements(await getEquipements());
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les équipements.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const etats = Array.from(new Set(equipements.map((e) => e.etat).filter(Boolean)));

  const filtered = equipements.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      q === "" ||
      (e.nom || "").toLowerCase().includes(q) ||
      (e.type || "").toLowerCase().includes(q) ||
      (e.numero_serie || "").toLowerCase().includes(q) ||
      (e.marque || "").toLowerCase().includes(q);
    const matchEtat = etatFilter === "TOUS" || e.etat === etatFilter;
    return matchSearch && matchEtat;
  });

  if (loading) {
    return (
      <div className="mt-page">
        <div className="mt-loading"><div className="mt-loader"></div><span>Chargement des équipements...</span></div>
      </div>
    );
  }

  return (
    <div className="mt-page">
      <div className="mt-header">
        <div>
          <p className="mt-eyebrow">MAINTENANCE</p>
          <h1>Équipements</h1>
          <p className="mt-subtitle">Gérez le parc d'engins et de matériel.</p>
        </div>
        <button className="mt-btn-primary" onClick={() => navigate("/maintenance/equipements/nouveau")}>
          + Nouvel équipement
        </button>
      </div>

      {error && <div className="mt-error">{error}</div>}

      <div className="mt-toolbar">
        <input
          type="text"
          placeholder="Rechercher un nom, type, marque, n° de série..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={etatFilter} onChange={(e) => setEtatFilter(e.target.value)}>
          <option value="TOUS">Tous les états</option>
          {etats.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="mt-count">{filtered.length} équipement(s)</span>
      </div>

      <div className="mt-table-wrapper">
        <table className="mt-table">
          <thead>
            <tr>
              <th>Équipement</th>
              <th>Type</th>
              <th>Marque / Modèle</th>
              <th>N° de série</th>
              <th>État</th>
              <th>Disponibilité</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="mt-empty">Aucun équipement trouvé.</td></tr>
            ) : (
              filtered.map((e) => (
                <tr
                  key={e.id_equipement}
                  className="mt-clickable"
                  onClick={() => navigate(`/maintenance/equipements/${e.id_equipement}`)}
                >
                  <td><strong>{e.nom}</strong></td>
                  <td>{e.type || "-"}</td>
                  <td>{[e.marque, e.modele].filter(Boolean).join(" ") || "-"}</td>
                  <td>{e.numero_serie || "-"}</td>
                  <td><span className={"mt-badge " + etatBadge(e.etat)}>{e.etat || "-"}</span></td>
                  <td>{e.disponibilite || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MTEquipementsList;