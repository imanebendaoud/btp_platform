import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import {
  getProject,
  deleteProject,
  getTaches,
  getAvancements,
  getDocuments,
  getPhotos,
  getRapports,
} from "../../../services/projectsService";
import { getUsers } from "../../../services/usersService";
import "./ProjectDetail.css";

const STATUS_LABELS = {
  EN_PREPARATION: "En préparation",
  EN_COURS: "En cours",
  SUSPENDU: "Suspendu",
  TERMINE: "Terminé",
};

function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [projet, setProjet] = useState(null);
  const [taches, setTaches] = useState([]);
  const [avancements, setAvancements] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [rapports, setRapports] = useState([]);
  const [chef, setChef] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = async () => {
    try {
      setLoading(true);
      const [
        projetData,
        tachesData,
        avancementsData,
        documentsData,
        photosData,
        rapportsData,
        usersData,
      ] = await Promise.all([
        getProject(id),
        getTaches(),
        getAvancements(),
        getDocuments(),
        getPhotos(),
        getRapports(),
        getUsers(),
      ]);

      setProjet(projetData);
      setTaches(tachesData.filter((t) => String(t.id_projet) === String(id)));
      setAvancements(
        avancementsData
          .filter((a) => String(a.id_projet) === String(id))
          .sort((a, b) => new Date(b.date_avancement) - new Date(a.date_avancement))
      );
      setDocuments(documentsData.filter((d) => String(d.id_projet) === String(id)));
      setPhotos(photosData.filter((p) => String(p.id_projet) === String(id)));
      setRapports(
        rapportsData
          .filter((r) => String(r.id_projet) === String(id))
          .sort((a, b) => new Date(b.date_rapport) - new Date(a.date_rapport))
      );
      setChef(
        usersData.find(
          (u) => String(u.id_utilisateur) === String(projetData.id_chef_projet)
        ) || null
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

        {/* CHEF DE CHANTIER */}
        <div className="proj-detail-card">
          <h2>Chef de chantier</h2>

          {chef ? (
            <div className="proj-chef-card">
              <div className="proj-chef-avatar">
                {chef.prenom?.charAt(0)}
                {chef.nom?.charAt(0)}
              </div>
              <div>
                <p className="proj-chef-name">{chef.prenom} {chef.nom}</p>
                <p className="proj-chef-email">{chef.email}</p>
              </div>
            </div>
          ) : (
            <p className="proj-detail-empty">
              Aucun chef de chantier assigné à ce projet.
            </p>
          )}
        </div>

      </div>

      <div className="proj-detail-card proj-detail-section">
        <h2>Description</h2>
        <p className="proj-detail-description">
          {projet.description || "Aucune description renseignée."}
        </p>
      </div>

      {/* TÂCHES — tableau, lecture seule */}
      <div className="proj-detail-card proj-detail-section">
        <h2>Tâches ({taches.length})</h2>

        {taches.length === 0 ? (
          <p className="proj-detail-empty">Aucune tâche pour ce projet.</p>
        ) : (
          <div className="proj-table-wrap">
            <table className="proj-table">
              <thead>
                <tr>
                  <th>Statut</th>
                  <th>Titre</th>
                  <th>Priorité</th>
                  <th>Échéance</th>
                </tr>
              </thead>
              <tbody>
                {taches.map((t) => (
                  <tr key={t.id_tache}>
                    <td>
                      <span
                        className={`proj-status-chip proj-status-chip-${t.statut?.replace(/\s/g, "")}`}
                      >
                        {t.statut || "À faire"}
                      </span>
                    </td>
                    <td>{t.titre}</td>
                    <td>{t.priorite || "—"}</td>
                    <td>{formatDate(t.date_fin_prevue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="proj-detail-readonly-note">
          La gestion des tâches est effectuée par le chef de chantier assigné au projet.
        </p>
      </div>

      {/* AVANCEMENT — tableau, lecture seule */}
      <div className="proj-detail-card proj-detail-section">
        <h2>Historique d'avancement ({avancements.length})</h2>

        {avancements.length === 0 ? (
          <p className="proj-detail-empty">Aucun avancement enregistré.</p>
        ) : (
          <div className="proj-table-wrap">
            <table className="proj-table">
              <thead>
                <tr>
                  <th>%</th>
                  <th>Date</th>
                  <th>Commentaire</th>
                </tr>
              </thead>
              <tbody>
                {avancements.map((a) => (
                  <tr key={a.id_avancement}>
                    <td><strong>{a.pourcentage}%</strong></td>
                    <td>{formatDate(a.date_avancement)}</td>
                    <td>{a.commentaire || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="proj-detail-readonly-note">
          Les mises à jour d'avancement sont saisies par le chef de chantier depuis le terrain.
        </p>
      </div>

      {/* DOCUMENTS — tableau, lecture seule */}
      <div className="proj-detail-card proj-detail-section">
        <h2>Documents ({documents.length})</h2>

        {documents.length === 0 ? (
          <p className="proj-detail-empty">Aucun document pour ce projet.</p>
        ) : (
          <div className="proj-table-wrap">
            <table className="proj-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Nom</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => (
                  <tr key={d.id_document}>
                    <td>
                      <span className="proj-status-chip">{d.type_document}</span>
                    </td>
                    <td>
                      <a href={d.chemin_fichier} target="_blank" rel="noreferrer">
                        {d.nom_document}
                      </a>
                    </td>
                    <td>{formatDate(d.date_ajout)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="proj-detail-readonly-note">
          Les documents sont ajoutés par le chef de chantier depuis le terrain.
        </p>
      </div>

      {/* PHOTOS — galerie, lecture seule */}
      <div className="proj-detail-card proj-detail-section">
        <h2>Photos du chantier ({photos.length})</h2>

        {photos.length === 0 ? (
          <p className="proj-detail-empty">Aucune photo pour ce projet.</p>
        ) : (
          <div className="proj-photo-grid">
            {photos.map((p) => (
              <div key={p.id_photo} className="proj-photo-item">
                <img src={p.chemin_photo} alt={p.description || "Photo chantier"} />
                {p.description && <p className="proj-photo-caption">{p.description}</p>}
              </div>
            ))}
          </div>
        )}

        <p className="proj-detail-readonly-note">
          Les photos sont ajoutées par le chef de chantier depuis le terrain.
        </p>
      </div>

      {/* RAPPORTS DE CHANTIER — tableau, lecture seule */}
      <div className="proj-detail-card proj-detail-section">
        <h2>Rapports de chantier ({rapports.length})</h2>

        {rapports.length === 0 ? (
          <p className="proj-detail-empty">Aucun rapport pour ce projet.</p>
        ) : (
          <div className="proj-table-wrap">
            <table className="proj-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Titre</th>
                  <th>Date</th>
                  <th>Contenu</th>
                </tr>
              </thead>
              <tbody>
                {rapports.map((r) => (
                  <tr key={r.id_rapport}>
                    <td>
                      <span className="proj-status-chip">{r.type_rapport}</span>
                    </td>
                    <td>{r.titre}</td>
                    <td>{formatDate(r.date_rapport)}</td>
                    <td>{r.contenu || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="proj-detail-readonly-note">
          Les rapports sont rédigés par le chef de chantier depuis le terrain.
        </p>
      </div>

    </div>
  );
}

export default ProjectDetail;