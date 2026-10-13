import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getEmployes } from "../../../services/hrService";
import "./HRDataPages.css";

function EmployesList() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getEmployes()
      .then((data) => {
        setItems(Array.isArray(data) ? data : data.results || []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return items.filter((e) =>
      [
        e.nom,
        e.prenom,
        e.cin,
        e.email,
        e.telephone,
        e.poste,
        e.statut,
      ].some((v) => String(v || "").toLowerCase().includes(term))
    );
  }, [items, search]);

  return (
    <main className="hr-data-page">
      <header className="hr-data-header">
        <div>
          <p className="hr-data-eyebrow">RESSOURCES HUMAINES</p>
          <h1>Employés</h1>
          <p>Consulter les informations du personnel.</p>
        </div>
        <Link className="hr-back-link" to="/admin/rh">← Retour </Link>
      </header>

      {error && <div className="hr-data-error">{error}</div>}

      <div className="hr-data-toolbar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un employé..."
          aria-label="Rechercher un employé"
        />
        <span>{filtered.length} employé(s)</span>
      </div>

      {loading ? (
        <p className="hr-data-message">Chargement des employés...</p>
      ) : (
        <div className="hr-data-table-wrap">
          <table className="hr-data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom complet</th>
                <th>Poste</th>
                <th>Téléphone</th>
                <th>Email</th>
                <th>Statut</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan="7" className="hr-data-empty">Aucun employé trouvé.</td></tr>
              ) : filtered.map((e) => (
                <tr key={e.id_employe}>
                  <td>#{e.id_employe}</td>
                  <td><strong>{e.prenom} {e.nom}</strong></td>
                  <td>{e.poste || "—"}</td>
                  <td>{e.telephone || "—"}</td>
                  <td>{e.email || "—"}</td>
                  <td><span className="hr-data-badge">{e.statut || "Non renseigné"}</span></td>
                  <td>
                    <Link className="hr-view-link" to={`/admin/rh/employes/${e.id_employe}`}>
                      Voir →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default EmployesList;