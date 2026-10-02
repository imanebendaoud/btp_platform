import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMouvements, getMateriaux } from "../../../services/stockService";
import { getProjects } from "../../../services/projectsService";
import "./MouvementsList.css";

const TYPE_LABELS = {
  ENTREE: "Entrée",
  SORTIE: "Sortie",
  AJUSTEMENT: "Ajustement",
};

function MouvementsList() {
  const navigate = useNavigate();

  const [mouvements, setMouvements] = useState([]);
  const [materiaux, setMateriaux] = useState([]);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [typeFilter, setTypeFilter] = useState("TOUS");
  const [materiauFilter, setMateriauFilter] = useState("TOUS");

  const loadAll = async () => {
    try {
      setLoading(true);
      const [mouvementsData, materiauxData, projetsData] = await Promise.all([
        getMouvements(),
        getMateriaux(),
        getProjects(),
      ]);
      setMouvements(
        mouvementsData.sort((a, b) => new Date(b.date_mouvement) - new Date(a.date_mouvement))
      );
      setMateriaux(materiauxData);
      setProjets(projetsData);
      setError("");
    } catch (err) {
      console.error("Erreur chargement mouvements :", err);
      setError("Impossible de charger l'historique des mouvements.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const materiauNom = (id) => materiaux.find((m) => m.id_materiau === id)?.nom || "—";
  const projetNom = (id) => projets.find((p) => p.id_projet === id)?.nom || null;

  const filtered = mouvements
    .filter((m) => typeFilter === "TOUS" || m.type_mouvement === typeFilter)
    .filter((m) => materiauFilter === "TOUS" || String(m.id_materiau) === materiauFilter);

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="mvt-list-page">

      <div className="mvt-list-header">
        <div>
          <p className="mvt-eyebrow">GESTION DES STOCKS</p>
          <h1>Mouvements de stock</h1>
          <p className="mvt-subtitle">{filtered.length} mouvement(s) affiché(s)</p>
        </div>

        <button className="mvt-btn-primary" onClick={() => navigate("/admin/stock/mouvements/nouveau")}>
          + Nouveau mouvement
        </button>
      </div>

      <div className="mvt-filters">
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="mvt-select">
          <option value="TOUS">Tous les types</option>
          <option value="ENTREE">Entrée</option>
          <option value="SORTIE">Sortie</option>
          <option value="AJUSTEMENT">Ajustement</option>
        </select>

        <select value={materiauFilter} onChange={(e) => setMateriauFilter(e.target.value)} className="mvt-select">
          <option value="TOUS">Tous les matériaux</option>
          {materiaux.map((m) => (
            <option key={m.id_materiau} value={m.id_materiau}>{m.nom}</option>
          ))}
        </select>
      </div>

      {loading && <p className="mvt-loading">Chargement...</p>}
      {error && <p className="mvt-error">{error}</p>}

      {!loading && !error && (
        <div className="mvt-table-wrap">
          <table className="mvt-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Matériau</th>
                <th>Quantité</th>
                <th>Projet</th>
                <th>Date</th>
                <th>Motif</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="mvt-empty">
                    Aucun mouvement ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m.id_mouvement}>
                    <td>
                      <span className={`mvt-badge mvt-badge-${m.type_mouvement}`}>
                        {TYPE_LABELS[m.type_mouvement] || m.type_mouvement}
                      </span>
                    </td>
                    <td className="mvt-strong">{materiauNom(m.id_materiau)}</td>
                    <td>{Number(m.quantite).toLocaleString("fr-MA")}</td>
                    <td className="mvt-muted">{projetNom(m.id_projet) || "Stock central"}</td>
                    <td className="mvt-muted">{formatDate(m.date_mouvement)}</td>
                    <td className="mvt-muted">{m.motif || "—"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}

export default MouvementsList;