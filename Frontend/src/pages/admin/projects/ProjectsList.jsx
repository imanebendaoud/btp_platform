import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getProjects, deleteProject } from "../../../services/projectsService";
import "./ProjectsList.css";

const STATUS_LABELS = {
  EN_PREPARATION: "En préparation",
  EN_COURS: "En cours",
  SUSPENDU: "Suspendu",
  TERMINE: "Terminé",
};

const STATUS_CLASS = {
  EN_PREPARATION: "proj-status-prep",
  EN_COURS: "proj-status-cours",
  SUSPENDU: "proj-status-suspendu",
  TERMINE: "proj-status-termine",
};

function ProjectsList() {
  const navigate = useNavigate();

  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("TOUS");

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data = await getProjects();
      setProjets(data);
      setError("");
    } catch (err) {
      console.error("Erreur chargement projets :", err);
      setError("Impossible de charger la liste des projets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleDelete = async (id, nom) => {
    if (!window.confirm(`Supprimer le projet « ${nom} » ? Cette action est irréversible.`)) {
      return;
    }

    try {
      await deleteProject(id);
      setProjets((prev) => prev.filter((p) => p.id_projet !== id));
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("Impossible de supprimer ce projet.");
    }
  };

  const filtered = projets.filter((p) => {
    const matchSearch =
      p.nom?.toLowerCase().includes(search.toLowerCase()) ||
      p.numero_projet?.toLowerCase().includes(search.toLowerCase());

    const matchStatus = statusFilter === "TOUS" || p.statut === statusFilter;

    return matchSearch && matchStatus;
  });

  const formatMoney = (value) =>
    new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(value || 0);

  return (
    <div className="proj-list-page">

      <div className="proj-list-header">
        <div>
          <p className="proj-eyebrow">GESTION DES PROJETS</p>
          <h1>Projets</h1>
          <p className="proj-subtitle">{filtered.length} projet(s) affiché(s)</p>
        </div>

        <button className="proj-btn-primary" onClick={() => navigate("/admin/projets/nouveau")}>
          + Nouveau projet
        </button>
      </div>

      <div className="proj-filters">
        <input
          type="text"
          placeholder="Rechercher par nom ou numéro..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="proj-search"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="proj-select"
        >
          <option value="TOUS">Tous les statuts</option>
          <option value="EN_PREPARATION">En préparation</option>
          <option value="EN_COURS">En cours</option>
          <option value="SUSPENDU">Suspendu</option>
          <option value="TERMINE">Terminé</option>
        </select>
      </div>

      {loading && <p className="proj-loading">Chargement des projets...</p>}

      {error && <p className="proj-error">{error}</p>}

      {!loading && !error && (
        <div className="proj-table-wrap">
          <table className="proj-table">
            <thead>
              <tr>
                <th>N° Projet</th>
                <th>Nom</th>
                <th>Client</th>
                <th>Budget</th>
                <th>Statut</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="proj-empty">
                    Aucun projet ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id_projet}>
                    <td className="proj-muted">{p.numero_projet}</td>
                    <td className="proj-strong">
                      <Link to={`/admin/projets/${p.id_projet}`}>{p.nom}</Link>
                    </td>
                    <td>{p.client || "—"}</td>
                    <td>{formatMoney(p.budget_initial)} DH</td>
                    <td>
                      <span className={`proj-status-badge ${STATUS_CLASS[p.statut] || ""}`}>
                        {STATUS_LABELS[p.statut] || p.statut}
                      </span>
                    </td>
                    <td className="proj-actions">
                      <Link to={`/admin/projets/${p.id_projet}`} className="proj-action-link">
                        Voir
                      </Link>
                      <Link to={`/admin/projets/${p.id_projet}/modifier`} className="proj-action-link">
                        Modifier
                      </Link>
                      <button
                        className="proj-action-danger"
                        onClick={() => handleDelete(p.id_projet, p.nom)}
                      >
                        Supprimer
                      </button>
                    </td>
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

export default ProjectsList;