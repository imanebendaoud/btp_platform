import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import {
  getMyProjects,
  getMyTasks,
  getMyProgress,
  getMyReports,
  getMyPhotos,
  getMyDocuments,
} from "../../services/projectService";

import "./ChefProjectDetails.css";

function ChefProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, accessToken, loading: authLoading } = useAuth();

  // ============================================================
  // STATES
  // ============================================================

  const [project, setProject] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState([]);
  const [reports, setReports] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================================
  // HELPERS
  // ============================================================

  const normalizeData = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.results)) {
      return data.results;
    }

    return [];
  };

  const getProjectId = (item) => {
    if (!item) return null;

    if (
      typeof item.id_projet === "object" &&
      item.id_projet !== null
    ) {
      return Number(item.id_projet.id_projet);
    }

    return Number(item.id_projet);
  };

  const formatDate = (date) => {
    if (!date) return "Non renseignée";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("fr-FR");
  };

  const formatBudget = (budget) => {
    if (
      budget === null ||
      budget === undefined ||
      budget === ""
    ) {
      return "Non renseigné";
    }

    return `${Number(budget).toLocaleString("fr-FR")} MAD`;
  };

  const getStatusLabel = (status) => {
    if (!status) return "Non défini";

    const normalized = status.toString().toLowerCase();

    const labels = {
      en_cours: "En cours",
      "en cours": "En cours",
      termine: "Terminé",
      terminé: "Terminé",
      planifie: "Planifié",
      planifié: "Planifié",
      suspendu: "Suspendu",
      annule: "Annulé",
      annulé: "Annulé",
    };

    return labels[normalized] || status;
  };

  const getStatusClass = (status) => {
    if (!status) return "";

    const normalized = status.toString().toLowerCase();

    if (
      normalized === "en_cours" ||
      normalized === "en cours"
    ) {
      return "status-progress";
    }

    if (
      normalized === "termine" ||
      normalized === "terminé"
    ) {
      return "status-completed";
    }

    if (
      normalized === "suspendu" ||
      normalized === "annule" ||
      normalized === "annulé"
    ) {
      return "status-danger";
    }

    return "status-planned";
  };

  // ============================================================
  // MAP
  // ============================================================

  const getMapUrl = (localisation) => {
    if (!localisation) {
      return null;
    }

    const location = `${localisation}, Maroc`;

    return `https://www.google.com/maps?q=${encodeURIComponent(
      location
    )}&output=embed`;
  };

  // ============================================================
  // LOAD PROJECT + RELATED DATA
  // ============================================================

  useEffect(() => {
    if (authLoading || !accessToken || !id) {
      return;
    }

    const loadProjectDetails = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          projectsData,
          tasksData,
          progressData,
          reportsData,
          photosData,
          documentsData,
        ] = await Promise.all([
          getMyProjects(accessToken),
          getMyTasks(accessToken),
          getMyProgress(accessToken),
          getMyReports(accessToken),
          getMyPhotos(accessToken),
          getMyDocuments(accessToken),
        ]);

        // --------------------------------------------------------
        // NORMALISATION
        // --------------------------------------------------------

        const projects = normalizeData(projectsData);
        const allTasks = normalizeData(tasksData);
        const allProgress = normalizeData(progressData);
        const allReports = normalizeData(reportsData);
        const allPhotos = normalizeData(photosData);
        const allDocuments = normalizeData(documentsData);

        // --------------------------------------------------------
        // PROJECT
        // --------------------------------------------------------

        const projectId = Number(id);

        const currentProject = projects.find(
          (item) => Number(item.id_projet) === projectId
        );

        if (!currentProject) {
          setError(
            "Projet introuvable ou accès non autorisé."
          );
          return;
        }

        setProject(currentProject);

        // --------------------------------------------------------
        // FILTER DATA FOR CURRENT PROJECT
        // --------------------------------------------------------

        setTasks(
          allTasks.filter(
            (item) => getProjectId(item) === projectId
          )
        );

        setProgress(
          allProgress.filter(
            (item) => getProjectId(item) === projectId
          )
        );

        setReports(
          allReports.filter(
            (item) => getProjectId(item) === projectId
          )
        );

        setPhotos(
          allPhotos.filter(
            (item) => getProjectId(item) === projectId
          )
        );

        setDocuments(
          allDocuments.filter(
            (item) => getProjectId(item) === projectId
          )
        );
      } catch (err) {
        console.error(
          "Erreur lors du chargement du projet :",
          err
        );

        setError(
          "Impossible de charger les informations du projet."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProjectDetails();
  }, [accessToken, authLoading, id]);

  // ============================================================
  // LOADING
  // ============================================================

  if (authLoading || loading) {
    return (
      <div className="chef-project-details">
        <div className="project-details-loading">
          Chargement du projet...
        </div>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="chef-project-details">
        <div className="project-details-error">
          <h2>Projet indisponible</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => navigate("/chef/projets")}
          >
            Retour aux projets
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return null;
  }

  // ============================================================
  // MAP URL
  // ============================================================

  const mapUrl = getMapUrl(project.localisation);

  // ============================================================
  // PERMISSIONS FRONTEND
  // ============================================================

  const role =
    user?.id_role?.nom_role || user?.role;

  const canEdit =
    role === "ADMINISTRATEUR" ||
    role === "CHEF_CHANTIER";

  // ============================================================
  // TASK STATISTICS
  // ============================================================

  const completedTasks = tasks.filter((task) => {
    const status = task.statut
      ?.toString()
      .toLowerCase();

    return (
      status === "termine" ||
      status === "terminé" ||
      status === "complete" ||
      status === "complétée" ||
      status === "completee"
    );
  }).length;

  const inProgressTasks = tasks.filter((task) => {
    const status = task.statut
      ?.toString()
      .toLowerCase();

    return (
      status === "en_cours" ||
      status === "en cours"
    );
  }).length;

  // ============================================================
  // LATEST PROGRESS
  // ============================================================

  const sortedProgress = [...progress].sort((a, b) => {
    const dateA = new Date(a.date_avancement);
    const dateB = new Date(b.date_avancement);

    return dateB - dateA;
  });

  const latestProgress = sortedProgress[0] || null;

  const latestProgressValue = latestProgress
    ? Number(latestProgress.pourcentage)
    : 0;

  // ============================================================
  // LATEST REPORT
  // ============================================================

  const sortedReports = [...reports].sort((a, b) => {
    const dateA = new Date(a.date_rapport);
    const dateB = new Date(b.date_rapport);

    return dateB - dateA;
  });

  const latestReport = sortedReports[0] || null;

  // ============================================================
  // PROJECT CHEF
  // ============================================================

  let chefName = "Non affecté";

  if (project.id_chef_projet) {
    if (
      typeof project.id_chef_projet === "object"
    ) {
      chefName =
        `${project.id_chef_projet.prenom || ""} ${
          project.id_chef_projet.nom || ""
        }`.trim() || "Chef de chantier";
    } else {
      chefName = "Chef de chantier";
    }
  }

  // ============================================================
  // NAVIGATION
  // ============================================================

  const goToTasks = () => {
    navigate(
      `/chef/taches?projet=${project.id_projet}`
    );
  };

  const goToProgress = () => {
    navigate(
      `/chef/avancement?projet=${project.id_projet}`
    );
  };

  const goToReports = () => {
    navigate(
      `/chef/rapports?projet=${project.id_projet}`
    );
  };

  const goToPhotos = () => {
    navigate(
      `/chef/photos?projet=${project.id_projet}`
    );
  };

  const goToDocuments = () => {
    navigate(
      `/chef/documents?projet=${project.id_projet}`
    );
  };

  const editProject = () => {
    navigate(
      `/chef/projets/${project.id_projet}/modifier`
    );
  };

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="chef-project-details">

      {/* ======================================================
          TOP BAR
      ====================================================== */}

      <div className="project-details-topbar">
        <button
          type="button"
          className="back-button"
          onClick={() => navigate("/chef/projets")}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>

          <span>Mes projets</span>
        </button>
      </div>

      {/* ======================================================
          PROJECT HEADER
      ====================================================== */}

      <section className="project-header-card">

        <div className="project-header-content">

          <div className="project-number">
            {project.numero_projet}
          </div>

          <div className="project-title-row">

            <div>
              <h1>{project.nom}</h1>

              <span
                className={`project-status ${getStatusClass(
                  project.statut
                )}`}
              >
                {getStatusLabel(project.statut)}
              </span>
            </div>

            {canEdit && (
              <button
                type="button"
                className="edit-project-button"
                onClick={editProject}
              >
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>

                Modifier le projet
              </button>
            )}

          </div>

          <div className="project-info-grid">

            <div className="project-info-item">
              <span>Client</span>
              <strong>
                {project.client || "Non renseigné"}
              </strong>
            </div>

            <div className="project-info-item">
              <span>Localisation</span>
              <strong>
                {project.localisation ||
                  "Non renseignée"}
              </strong>
            </div>

            <div className="project-info-item">
              <span>Date de début</span>
              <strong>
                {formatDate(project.date_debut)}
              </strong>
            </div>

            <div className="project-info-item">
              <span>Fin prévue</span>
              <strong>
                {formatDate(project.date_fin_prevue)}
              </strong>
            </div>

            <div className="project-info-item">
              <span>Budget initial</span>
              <strong>
                {formatBudget(project.budget_initial)}
              </strong>
            </div>

            <div className="project-info-item">
              <span>Chef de chantier</span>
              <strong>{chefName}</strong>
            </div>

          </div>

        </div>

        {/* ====================================================
            MAP
        ==================================================== */}

        <div className="project-map-card">

          <div className="project-map-header">
            <span>Localisation du projet</span>
          </div>

          {mapUrl ? (
            <iframe
              title={`Localisation de ${project.nom}`}
              src={mapUrl}
              width="100%"
              height="260"
              style={{
                border: 0,
                borderRadius: "10px",
                display: "block",
              }}
              loading="lazy"
            />
          ) : (
            <div className="fake-map">

              <div className="map-grid"></div>

              <div className="map-road map-road-one"></div>
              <div className="map-road map-road-two"></div>
              <div className="map-road map-road-three"></div>

              <div className="map-block map-block-one"></div>
              <div className="map-block map-block-two"></div>
              <div className="map-block map-block-three"></div>

              <div className="map-pin">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 10c0 7-9 12-9 12S3 17 3 10a9 9 0 0118 0z" />
                  <circle
                    cx="12"
                    cy="10"
                    r="3"
                  />
                </svg>
              </div>

            </div>
          )}

        </div>

      </section>

      {/* ======================================================
          SUMMARY SECTIONS
      ====================================================== */}

      <section className="project-summary-grid">

        {/* ====================================================
            TASKS
        ==================================================== */}

        <article className="summary-card">

          <div className="summary-card-header">

            <div className="summary-card-title">

              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                />
                <path d="M8 12l2 2 5-5" />
              </svg>

              <h2>Tâches</h2>

            </div>

            <span className="summary-count">
              {tasks.length}
            </span>

          </div>

          <div className="summary-placeholder">

            <strong>
              {completedTasks} tâche
              {completedTasks !== 1 ? "s" : ""} terminée
              {completedTasks !== 1 ? "s" : ""}
            </strong>

            <span>
              {inProgressTasks} en cours
            </span>

          </div>

          <button
            type="button"
            className="summary-link"
            onClick={goToTasks}
          >
            Voir toutes les tâches
          </button>

        </article>

        {/* ====================================================
            PROGRESS
        ==================================================== */}

        <article className="summary-card">

          <div className="summary-card-header">

            <div className="summary-card-title">

              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M3 3v18h18" />
                <path d="M7 16l4-5 3 3 5-7" />
              </svg>

              <h2>Avancement</h2>

            </div>

            <span className="summary-count">
              {progress.length}
            </span>

          </div>

          <div className="summary-progress-placeholder">

            <strong>
              {latestProgress
                ? `${latestProgressValue}%`
                : "0%"}
            </strong>

            <span>
              {latestProgress
                ? `Dernière mise à jour : ${formatDate(
                    latestProgress.date_avancement
                  )}`
                : "Aucun avancement enregistré"}
            </span>

          </div>

          <button
            type="button"
            className="summary-link"
            onClick={goToProgress}
          >
            Voir l'historique
          </button>

        </article>

        {/* ====================================================
            REPORTS
        ==================================================== */}

        <article className="summary-card">

          <div className="summary-card-header">

            <div className="summary-card-title">

              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line
                  x1="8"
                  y1="13"
                  x2="16"
                  y2="13"
                />
                <line
                  x1="8"
                  y1="17"
                  x2="16"
                  y2="17"
                />
              </svg>

              <h2>Rapports</h2>

            </div>

            <span className="summary-count">
              {reports.length}
            </span>

          </div>

          <div className="summary-placeholder">

            <strong>
              {reports.length === 0
                ? "Aucun rapport"
                : `${reports.length} rapport${
                    reports.length > 1 ? "s" : ""
                  }`}
            </strong>

            <span>
              {latestReport
                ? `Dernier rapport : ${formatDate(
                    latestReport.date_rapport
                  )}`
                : "Aucune donnée disponible"}
            </span>

          </div>

          <button
            type="button"
            className="summary-link"
            onClick={goToReports}
          >
            Voir les rapports
          </button>

        </article>

        {/* ====================================================
            PHOTOS
        ==================================================== */}

        <article className="summary-card">

          <div className="summary-card-header">

            <div className="summary-card-title">

              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="2"
                />
                <circle
                  cx="8.5"
                  cy="8.5"
                  r="1.5"
                />
                <path d="M21 15l-5-5L5 21" />
              </svg>

              <h2>Photos</h2>

            </div>

            <span className="summary-count">
              {photos.length}
            </span>

          </div>

          <div className="summary-placeholder">

            <strong>
              {photos.length === 0
                ? "Aucune photo"
                : `${photos.length} photo${
                    photos.length > 1 ? "s" : ""
                  }`}
            </strong>

            <span>
              Photos associées à ce projet
            </span>

          </div>

          <button
            type="button"
            className="summary-link"
            onClick={goToPhotos}
          >
            Voir les photos
          </button>

        </article>

        {/* ====================================================
            DOCUMENTS
        ==================================================== */}

        <article className="summary-card">

          <div className="summary-card-header">

            <div className="summary-card-title">

              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 4h16v16H4z" />
                <path d="M8 8h8" />
                <path d="M8 12h8" />
                <path d="M8 16h5" />
              </svg>

              <h2>Documents</h2>

            </div>

            <span className="summary-count">
              {documents.length}
            </span>

          </div>

          <div className="summary-placeholder">

            <strong>
              {documents.length === 0
                ? "Aucun document"
                : `${documents.length} document${
                    documents.length > 1 ? "s" : ""
                  }`}
            </strong>

            <span>
              Documents associés à ce projet
            </span>

          </div>

          <button
            type="button"
            className="summary-link"
            onClick={goToDocuments}
          >
            Voir les documents
          </button>

        </article>

      </section>

    </div>
  );
}

export default ChefProjectDetails;