import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getDemandes,
  motifLabel,
  statutDemandeBadge,
  statutDemandeLabel,
} from "../../services/demandeService";
import { formatDate, formatMoney } from "../../services/mtService";
import "./MT.css";

function MTDemandesList() {
  const navigate = useNavigate();

  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statut, setStatut] = useState("TOUS");

  useEffect(() => {
    const load = async () => {
      try {
        setDemandes(await getDemandes());
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les demandes.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const rows = demandes
    .filter((d) => {
      const q = search.toLowerCase();
      const matchSearch =
        q === "" ||
        (d.equipement_nom || "").toLowerCase().includes(q) ||
        (d.projet_nom || "").toLowerCase().includes(q) ||
        motifLabel(d.motif).toLowerCase().includes(q);
      const matchStatut = statut === "TOUS" || d.statut === statut;
      return matchSearch && matchStatut;
    })
    .sort((a, b) => new Date(b.date_demande || 0) - new Date(a.date_demande || 0));

  if (loading) {
    return (
      <div className="mt-page">
        <div className="mt-loading"><div className="mt-loader"></div><span>Chargement des demandes...</span></div>
      </div>
    );
  }

  return (
    <div className="mt-page">
      <div className="mt-header">
        <div>
          <p className="mt-eyebrow">MAINTENANCE</p>
          <h1>Demandes de financement</h1>
          <p className="mt-subtitle">Vos demandes d'achat, de réparation et de pièces.</p>
        </div>
        <button className="mt-btn-primary" onClick={() => navigate("/maintenance/demandes/nouveau")}>
          + Nouvelle demande
        </button>
      </div>

      {error && <div className="mt-error">{error}</div>}

      <div className="mt-toolbar">
        <input
          type="text"
          placeholder="Rechercher un équipement, un projet, un motif..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statut} onChange={(e) => setStatut(e.target.value)}>
          <option value="TOUS">Tous les statuts</option>
          <option value="EN_ATTENTE">En attente</option>
          <option value="VALIDEE">Validées</option>
          <option value="REFUSEE">Refusées</option>
        </select>
        <span className="mt-count">{rows.length} demande(s)</span>
      </div>

      <div className="mt-table-wrapper">
        <table className="mt-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Équipement</th>
              <th>Projet</th>
              <th>Motif</th>
              <th>Montant</th>
              <th>Urgence</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="mt-empty">Aucune demande trouvée.</td></tr>
            ) : (
              rows.map((d) => (
                <tr
                  key={d.id_demande}
                  className="mt-clickable"
                  onClick={() => navigate(`/maintenance/demandes/${d.id_demande}`)}
                >
                  <td>{formatDate(d.date_demande)}</td>
                  <td><strong>{d.equipement_nom}</strong></td>
                  <td>{d.projet_nom}</td>
                  <td>{motifLabel(d.motif)}</td>
                  <td>{formatMoney(d.montant_demande)}</td>
                  <td>
                    <span className={"mt-badge " + (d.urgence === "URGENTE" ? "danger" : "muted")}>
                      {d.urgence === "URGENTE" ? "Urgente" : "Normale"}
                    </span>
                  </td>
                  <td>
                    <span className={"mt-badge " + statutDemandeBadge(d.statut)}>
                      {statutDemandeLabel(d.statut)}
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

export default MTDemandesList;