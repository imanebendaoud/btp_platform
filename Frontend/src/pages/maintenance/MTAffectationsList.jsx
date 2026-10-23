import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAffectations,
  deleteAffectation,
  getEquipements,
  getProjets,
  formatDate,
} from "../../services/mtService";
import "./MT.css";

function MTAffectationsList() {
  const navigate = useNavigate();

  const [affectations, setAffectations] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const load = async () => {
    try {
      const [a, e, p] = await Promise.all([getAffectations(), getEquipements(), getProjets()]);
      setAffectations(a);
      setEquipements(e);
      setProjets(p);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les affectations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const nomEquip = (id) => equipements.find((e) => e.id_equipement === id)?.nom || `Équipement #${id}`;
  const nomProjet = (id) => projets.find((p) => p.id_projet === id)?.nom || `Projet #${id}`;

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette affectation ?")) return;
    try {
      await deleteAffectation(id);
      setAffectations((prev) => prev.filter((a) => a.id_affectation !== id));
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer cette affectation.");
    }
  };

  const rows = affectations
    .filter((a) => {
      const q = search.toLowerCase();
      return (
        q === "" ||
        nomEquip(a.id_equipement).toLowerCase().includes(q) ||
        nomProjet(a.id_projet).toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.date_debut || 0) - new Date(a.date_debut || 0));

  if (loading) {
    return (
      <div className="mt-page">
        <div className="mt-loading"><div className="mt-loader"></div><span>Chargement des affectations...</span></div>
      </div>
    );
  }

  return (
    <div className="mt-page">
      <div className="mt-header">
        <div>
          <p className="mt-eyebrow">MAINTENANCE</p>
          <h1>Affectations</h1>
          <p className="mt-subtitle">Équipements affectés aux chantiers.</p>
        </div>
        <button className="mt-btn-primary" onClick={() => navigate("/maintenance/affectations/nouveau")}>
          + Nouvelle affectation
        </button>
      </div>

      {error && <div className="mt-error">{error}</div>}

      <div className="mt-toolbar">
        <input
          type="text"
          placeholder="Rechercher un équipement ou un projet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="mt-count">{rows.length} affectation(s)</span>
      </div>

      <div className="mt-table-wrapper">
        <table className="mt-table">
          <thead>
            <tr>
              <th>Équipement</th>
              <th>Projet</th>
              <th>Début</th>
              <th>Fin</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={5} className="mt-empty">Aucune affectation trouvée.</td></tr>
            ) : (
              rows.map((a) => (
                <tr key={a.id_affectation}>
                  <td><strong>{nomEquip(a.id_equipement)}</strong></td>
                  <td>{nomProjet(a.id_projet)}</td>
                  <td>{formatDate(a.date_debut)}</td>
                  <td>{a.date_fin ? formatDate(a.date_fin) : <span className="mt-badge warn">En cours</span>}</td>
                  <td>
                    <div className="mt-row-actions">
                      <button
                        className="mt-btn mt-btn-sm"
                        onClick={() => navigate(`/maintenance/affectations/${a.id_affectation}/modifier`)}
                      >
                        Modifier
                      </button>
                      <button className="mt-btn-danger mt-btn-sm" onClick={() => handleDelete(a.id_affectation)}>
                        Supprimer
                      </button>
                    </div>
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

export default MTAffectationsList;