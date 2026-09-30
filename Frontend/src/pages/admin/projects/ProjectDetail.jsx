import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getProject,
  deleteProject,
  getTaches,
  createTache,
  updateTache,
  deleteTache,
  getAvancements,
  createAvancement,
} from "../../../services/projectsService";
import "./ProjectDetail.css";

const STATUS_LABELS = {
  EN_PREPARATION: "En préparation",
  EN_COURS: "En cours",
  SUSPENDU: "Suspendu",
  TERMINE: "Terminé",
};

const TACHE_STATUTS = ["À faire", "En cours", "Terminée"];

const EMPTY_TACHE = { titre: "", date_fin_prevue: "", priorite: "Normale" };
const EMPTY_AVANCEMENT = { pourcentage: "", commentaire: "" };

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [projet, setProjet] = useState(null);
  const [taches, setTaches] = useState([]);
  const [avancements, setAvancements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newTache, setNewTache] = useState(EMPTY_TACHE);
  const [newAvancement, setNewAvancement] = useState(EMPTY_AVANCEMENT);
  const [savingTache, setSavingTache] = useState(false);
  const [savingAvancement, setSavingAvancement] = useState(false);

  const loadAll = async () => {
    try {
      setLoading(true);
      const [projetData, tachesData, avancementsData] = await Promise.all([
        getProject(id),
        getTaches(),
        getAvancements(),
      ]);

      setProjet(projetData);
      setTaches(tachesData.filter((t) => String(t.id_projet) === String(id)));
      setAvancements(
        avancementsData
          .filter((a) => String(a.id_projet) === String(id))
          .sort((a, b) => new Date(b.date_avancement) - new Date(a.date_avancement))
      );
      setError("");
    } catch (err) {
      console.error("Erreur chargement projet :", err);
      setError("Projet introuvable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDeleteProject = async () => {
    if (!window.confirm(`Supprimer le projet « ${projet.nom} » ?`)) return;

    try {
      await deleteProject(id);
      navigate("/admin/projets");
    } catch (err) {
      console.error("Erreur suppression :", err);
      alert("Impossible de supprimer ce projet.");
    }
  };

  // ---------- TÂCHES ----------

  const handleAddTache = async (e) => {
    e.preventDefault();
    if (!newTache.titre.trim()) return;

    setSavingTache(true);
    try {
      const created = await createTache({
        id_projet: id,
        titre: newTache.titre,
        date_fin_prevue: newTache.date_fin_prevue || null,
        priorite: newTache.priorite,
        statut: "À faire",
      });
      setTaches((prev) => [...prev, created]);
      setNewTache(EMPTY_TACHE);
    } catch (err) {
      console.error("Erreur création tâche :", err);
      alert("Impossible d'ajouter cette tâche.");
    } finally {
      setSavingTache(false);
    }
  };

  const handleToggleTacheStatut = async (tache) => {
    const currentIndex = TACHE_STATUTS.indexOf(tache.statut);
    const nextStatut = TACHE_STATUTS[(currentIndex + 1) % TACHE_STATUTS.length] || "À faire";

    try {
      const updated = await updateTache(tache.id_tache, { statut: nextStatut });
      setTaches((prev) => prev.map((t) => (t.id_tache === tache.id_tache ? updated : t)));
    } catch (err) {
      console.error("Erreur mise à jour tâche :", err);
    }
  };

  const handleDeleteTache = async (tacheId) => {
    try {
      await deleteTache(tacheId);
      setTaches((prev) => prev.filter((t) => t.id_tache !== tacheId));
    } catch (err) {
      console.error("Erreur suppression tâche :", err);
    }
  };

  // ---------- AVANCEMENT ----------

  const handleAddAvancement = async (e) => {
    e.preventDefault();
    const pourcentage = Number(newAvancement.pourcentage);
    if (Number.isNaN(pourcentage) || pourcentage < 0 || pourcentage > 100) {
      alert("Le pourcentage doit être compris entre 0 et 100.");
      return;
    }

    setSavingAvancement(true);
    try {
      const created = await createAvancement({
        id_projet: id,
        pourcentage,
        commentaire: newAvancement.commentaire,
        date_avancement: new Date().toISOString().slice(0, 10),
      });
      setAvancements((prev) => [created, ...prev]);
      setNewAvancement(EMPTY_AVANCEMENT);
    } catch (err) {
      console.error("Erreur création avancement :", err);
      alert("Impossible d'enregistrer cet avancement.");
    } finally {
      setSavingAvancement(false);
    }
  };

  const formatMoney = (value) =>
    new Intl.NumberFormat("fr-MA", { maximumFractionDigits: 0 }).format(value || 0);

  const formatDate = (value) =>
    value ? new Date(value).toLocaleDateString("fr-FR") : "—";

  if (loading) return <p className="proj-detail-loading">Chargement...</p>;
  if (error) return <p className="proj-detail-error">{error}</p>;
  if (!projet) return null;

  const currentPourcentage = avancements[0]?.pourcentage ?? 0;

  return (
    <div className="proj-detail-page">

      <Link to="/admin/projets" className="proj-detail-back">← Retour aux projets</Link>

      <div className="proj-detail-header">
        <div>
          <p className="proj-eyebrow">{projet.numero_projet}</p>
          <h1>{projet.nom}</h1>
        </div>

        <div className="proj-detail-header-actions">
          <span className="proj-status-badge">
            {STATUS_LABELS[projet.statut] || projet.statut}
          </span>

          <Link to={`/admin/projets/${id}/modifier`} className="proj-btn-secondary">
            Modifier
          </Link>

          <button className="proj-btn-danger" onClick={handleDeleteProject}>
            Supprimer
          </button>
        </div>
      </div>

      {/* AVANCEMENT GLOBAL */}
      <div className="proj-progress-banner">
        <div className="proj-progress-info">
          <span>Avancement global</span>
          <strong>{currentPourcentage}%</strong>
        </div>
        <div className="proj-progress-track">
          <div className="proj-progress-fill" style={{ width: `${currentPourcentage}%` }} />
        </div>
      </div>

      <div className="proj-detail-grid">

        <div className="proj-detail-card">
          <h2>Informations générales</h2>

          <div className="proj-detail-row">
            <span>Client</span>
            <strong>{projet.client || "—"}</strong>
          </div>

          <div className="proj-detail-row">
            <span>Localisation</span>
            <strong>{projet.localisation || "—"}</strong>
          </div>

          <div className="proj-detail-row">
            <span>Date de début</span>
            <strong>{formatDate(projet.date_debut)}</strong>
          </div>

          <div className="proj-detail-row">
            <span>Fin prévue</span>
            <strong>{formatDate(projet.date_fin_prevue)}</strong>
          </div>

          <div className="proj-detail-row">
            <span>Budget initial</span>
            <strong>{formatMoney(projet.budget_initial)} DH</strong>
          </div>
        </div>

        <div className="proj-detail-card">
          <h2>Description</h2>
          <p className="proj-detail-description">
            {projet.description || "Aucune description renseignée."}
          </p>
        </div>

      </div>

      {/* TÂCHES */}
      <div className="proj-detail-card proj-detail-section">
        <h2>Tâches ({taches.length})</h2>

        {taches.length === 0 ? (
          <p className="proj-detail-empty">Aucune tâche pour ce projet.</p>
        ) : (
          <ul className="proj-tache-list">
            {taches.map((t) => (
              <li key={t.id_tache} className="proj-tache-item">
                <button
                  className={`proj-tache-statut proj-tache-statut-${t.statut?.replace(/\s/g, "")}`}
                  onClick={() => handleToggleTacheStatut(t)}
                  title="Cliquer pour changer le statut"
                >
                  {t.statut || "À faire"}
                </button>

                <span className="proj-tache-titre">{t.titre}</span>

                {t.date_fin_prevue && (
                  <span className="proj-tache-date">Échéance : {formatDate(t.date_fin_prevue)}</span>
                )}

                <button className="proj-tache-delete" onClick={() => handleDeleteTache(t.id_tache)}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}

        <form className="proj-inline-form" onSubmit={handleAddTache}>
          <input
            type="text"
            placeholder="Nouvelle tâche..."
            value={newTache.titre}
            onChange={(e) => setNewTache({ ...newTache, titre: e.target.value })}
          />
          <input
            type="date"
            value={newTache.date_fin_prevue}
            onChange={(e) => setNewTache({ ...newTache, date_fin_prevue: e.target.value })}
          />
          <select
            value={newTache.priorite}
            onChange={(e) => setNewTache({ ...newTache, priorite: e.target.value })}
          >
            <option value="Basse">Basse</option>
            <option value="Normale">Normale</option>
            <option value="Haute">Haute</option>
          </select>
          <button type="submit" disabled={savingTache}>
            {savingTache ? "..." : "Ajouter"}
          </button>
        </form>
      </div>

      {/* AVANCEMENT — HISTORIQUE */}
      <div className="proj-detail-card proj-detail-section">
        <h2>Historique d'avancement</h2>

        {avancements.length === 0 ? (
          <p className="proj-detail-empty">Aucun avancement enregistré.</p>
        ) : (
          <ul className="proj-avancement-list">
            {avancements.map((a) => (
              <li key={a.id_avancement} className="proj-avancement-item">
                <strong>{a.pourcentage}%</strong>
                <span className="proj-avancement-date">{formatDate(a.date_avancement)}</span>
                {a.commentaire && <p>{a.commentaire}</p>}
              </li>
            ))}
          </ul>
        )}

        <form className="proj-inline-form" onSubmit={handleAddAvancement}>
          <input
            type="number"
            min="0"
            max="100"
            placeholder="% avancement"
            value={newAvancement.pourcentage}
            onChange={(e) => setNewAvancement({ ...newAvancement, pourcentage: e.target.value })}
            required
          />
          <input
            type="text"
            placeholder="Commentaire (optionnel)"
            value={newAvancement.commentaire}
            onChange={(e) => setNewAvancement({ ...newAvancement, commentaire: e.target.value })}
          />
          <button type="submit" disabled={savingAvancement}>
            {savingAvancement ? "..." : "Enregistrer"}
          </button>
        </form>
      </div>

    </div>
  );
}

export default ProjectDetail;