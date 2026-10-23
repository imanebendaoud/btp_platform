import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getMaintenances,
  deleteMaintenance,
  getEquipements,
  formatDate,
  formatMoney,
  statutBadge,
} from "../../services/mtService";
import "./MT.css";

function MTMaintenancesList() {
  const navigate = useNavigate();

  const [maintenances, setMaintenances] = useState([]);
  const [equipements, setEquipements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("TOUS");

  useEffect(() => {
    const load = async () => {
      try {
        const [m, e] = await Promise.all([getMaintenances(), getEquipements()]);
        setMaintenances(m);
        setEquipements(e);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les interventions.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const nomEquip = (id) => equipements.find((e) => e.id_equipement === id)?.nom || `Équipement #${id}`;
  const statuts = Array.from(new Set(maintenances.map((m) => m.statut).filter(Boolean)));

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette intervention ?")) return;
    try {
      await deleteMaintenance(id);
      setMaintenances((prev) => prev.filter((m) => m.id_maintenance !== id));
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer cette intervention.");
    }
  };

  const rows = maintenances
    .filter((m) => {
      const q = search.toLowerCase();
      const matchSearch =
        q === "" ||
        nomEquip(m.id_equipement).toLowerCase().includes(q) ||
        (m.type_intervention || "").toLowerCase().includes(q) ||
        (m.technicien || "").toLowerCase().includes(q);
      const matchStatut = statutFilter === "TOUS" || m.statut === statutFilter;
      return matchSearch && matchStatut;
    })
    .sort((a, b) => new Date(b.date_declaration || 0) - new Date(a.date_declaration || 0));

  if (loading) {
    return (
      <div className="mt-page">
        <div className="mt-loading"><div className="mt-loader"></div><span>Chargement des interventions...</span></div>
      </div>
    );
  }

  return (
    <div className="mt-page">
      <div className="mt-header">
        <div>
          <p className="mt-eyebrow">MAINTENANCE</p>
          <h1>Interventions</h1>
          <p className="mt-subtitle">Pannes déclarées et maintenances planifiées.</p>
        </div>
        <button className="mt-btn-primary" onClick={() => navigate("/maintenance/interventions/nouveau")}>
          + Nouvelle intervention
        </button>
      </div>

      {error && <div className="mt-error">{error}</div>}

      <div className="mt-toolbar">
        <input
          type="text"
          placeholder="Rechercher un équipement, un type, un technicien..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)}>
          <option value="TOUS">Tous les statuts</option>
          {statuts.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <span className="mt-count">{rows.length} intervention(s)</span>
      </div>

      <div className="mt-table-wrapper">
        <table className="mt-table">
          <thead>
            <tr>
              <th>Équipement</th>
              <th>Type</th>
              <th>Déclarée</th>
              <th>Planifiée</th>
              <th>Technicien</th>
              <th>Coût</th>
              <th>Statut</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={8} className="mt-empty">Aucune intervention trouvée.</td></tr>
            ) : (
              rows.map((m) => (
                <tr key={m.id_maintenance}>
                  <td><strong>{nomEquip(m.id_equipement)}</strong></td>
                  <td>{m.type_intervention || "-"}</td>
                  <td>{formatDate(m.date_declaration)}</td>
                  <td>{formatDate(m.date_planifiee)}</td>
                  <td>{m.technicien || "-"}</td>
                  <td>{formatMoney(m.cout)}</td>
                  <td><span className={"mt-badge " + statutBadge(m.statut)}>{m.statut || "-"}</span></td>
                  <td>
                    <div className="mt-row-actions">
                      <button
                        className="mt-btn mt-btn-sm"
                        onClick={() => navigate(`/maintenance/interventions/${m.id_maintenance}/modifier`)}
                      >
                        Modifier
                      </button>
                      <button className="mt-btn-danger mt-btn-sm" onClick={() => handleDelete(m.id_maintenance)}>
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

export default MTMaintenancesList;