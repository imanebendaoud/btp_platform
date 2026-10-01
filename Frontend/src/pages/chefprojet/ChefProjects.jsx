import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getMyProjects } from "../../services/projectService";
import "./ChefProjects.css";

// ============================================================
// ICÔNES SVG
// ============================================================

const Icon = ({ name, size = 18 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "building":
      return (
        <svg {...common}>
          <path d="M4 21V5a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16" />
          <path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2" />
          <path d="M10 21v-3h4v3" />
        </svg>
      );

    case "calendar":
      return (
        <svg {...common}>
          <rect x="3" y="4" width="18" height="17" rx="2" />
          <path d="M16 2v4M8 2v4M3 9h18" />
        </svg>
      );

    case "location":
      return (
        <svg {...common}>
          <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      );

    case "eye":
      return (
        <svg {...common}>
          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
          <circle cx="12" cy="12" r="2.5" />
        </svg>
      );

    case "edit":
      return (
        <svg {...common}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
        </svg>
      );

    case "search":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-4-4" />
        </svg>
      );

    case "refresh":
      return (
        <svg {...common}>
          <path d="M20 11a8 8 0 0 0-14.8-4L3 10" />
          <path d="M3 5v5h5" />
          <path d="M4 13a8 8 0 0 0 14.8 4L21 14" />
          <path d="M21 19v-5h-5" />
        </svg>
      );

    default:
      return null;
  }
};


// ============================================================
// UTILITAIRES
// ============================================================

const getStatusClass = (status) => {
  const value = String(status || "").toLowerCase();

  if (
    value.includes("termin") ||
    value.includes("achev") ||
    value.includes("completed")
  ) {
    return "chef-project-status completed";
  }

  if (
    value.includes("retard") ||
    value.includes("annul") ||
    value.includes("bloqu")
  ) {
    return "chef-project-status danger";
  }

  return "chef-project-status active";
};


const getStatusLabel = (status) => {
  if (!status) return "En cours";

  const value = String(status).toLowerCase();

  if (value.includes("termin") || value.includes("achev")) {
    return "Terminé";
  }

  if (value.includes("retard")) {
    return "En retard";
  }

  if (value.includes("annul")) {
    return "Annulé";
  }

  if (value.includes("pause")) {
    return "En pause";
  }

  return status;
};


// ============================================================
// COMPOSANT
// ============================================================

function ChefProjects() {
  const { accessToken } = useAuth();
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ==========================================================
  // CHARGEMENT DES PROJETS
  // ==========================================================

  const loadProjects = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);
      setError("");

      const data = await getMyProjects(accessToken);

      const projectList = Array.isArray(data)
        ? data
        : Array.isArray(data?.results)
        ? data.results
        : [];

      setProjects(projectList);
    } catch (err) {
      console.error("Erreur chargement projets :", err);

      setError(
        err?.response?.data?.detail ||
          "Impossible de charger les projets."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [accessToken]);

  // ==========================================================
  // RECHERCHE
  // ==========================================================

  const filteredProjects = projects.filter((project) => {
    const query = search.trim().toLowerCase();

    if (!query) return true;

    return (
      String(project.numero_projet || "")
        .toLowerCase()
        .includes(query) ||
      String(project.nom || "")
        .toLowerCase()
        .includes(query) ||
      String(project.client || "")
        .toLowerCase()
        .includes(query) ||
      String(project.localisation || "")
        .toLowerCase()
        .includes(query) ||
      String(project.statut || "")
        .toLowerCase()
        .includes(query)
    );
  });

  // ==========================================================
  // AFFICHAGE
  // ==========================================================

  return (
    <div className="chef-projects-page">

      {/* ====================================================
          HEADER
      ==================================================== */}

      <div className="chef-projects-header">
        <div>
          <span className="chef-projects-label">
            GESTION DES PROJETS
          </span>

          <h1>Mes projets</h1>

          <p>
            Consultez et gérez les projets qui vous sont affectés.
          </p>
        </div>

        <button
          type="button"
          className="chef-projects-refresh"
          onClick={loadProjects}
          disabled={loading}
        >
          <Icon name="refresh" size={15} />
          Actualiser
        </button>
      </div>


      {/* ====================================================
          BARRE DE RECHERCHE
      ==================================================== */}

      <div className="chef-projects-toolbar">

        <div className="chef-projects-search">
          <Icon name="search" size={16} />

          <input
            type="text"
            placeholder="Rechercher un projet..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className="chef-projects-count">
          {filteredProjects.length} projet
          {filteredProjects.length !== 1 ? "s" : ""}
        </div>

      </div>


      {/* ====================================================
          ERREUR
      ==================================================== */}

      {error && (
        <div className="chef-projects-message chef-projects-error">
          <strong>Erreur</strong>
          <span>{error}</span>
        </div>
      )}


      {/* ====================================================
          CHARGEMENT
      ==================================================== */}

      {loading ? (
        <div className="chef-projects-message">
          <span>Chargement des projets...</span>
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="chef-projects-message">
          <Icon name="building" size={22} />

          <strong>
            {search
              ? "Aucun projet trouvé"
              : "Aucun projet affecté"}
          </strong>

          <span>
            {search
              ? "Aucun projet ne correspond à votre recherche."
              : "Vous n'avez actuellement aucun projet affecté."}
          </span>
        </div>
      ) : (

        /* ==================================================
           LISTE DES PROJETS
        ================================================== */

        <div className="chef-projects-grid">

          {filteredProjects.map((project) => (

            <article
              className="chef-project-card"
              key={project.id_projet}
            >

              {/* --------------------------------------------
                  CARD HEADER
              -------------------------------------------- */}

              <div className="chef-project-card-header">

                <div className="chef-project-card-symbol">
                  <Icon name="building" size={18} />
                </div>

                <div className="chef-project-card-title">
                  <span>
                    {project.numero_projet || "Projet"}
                  </span>

                  <h2>
                    {project.nom || "Sans nom"}
                  </h2>
                </div>

                <span className={getStatusClass(project.statut)}>
                  {getStatusLabel(project.statut)}
                </span>

              </div>


              {/* --------------------------------------------
                  INFORMATIONS
              -------------------------------------------- */}

              <div className="chef-project-card-info">

                <div className="chef-project-info-item">

                  <Icon name="location" size={15} />

                  <div>
                    <span>Localisation</span>
                    <strong>
                      {project.localisation || "Non renseignée"}
                    </strong>
                  </div>

                </div>


                <div className="chef-project-info-item">

                  <Icon name="calendar" size={15} />

                  <div>
                    <span>Date de début</span>
                    <strong>
                      {project.date_debut || "Non renseignée"}
                    </strong>
                  </div>

                </div>


                <div className="chef-project-info-item">

                  <Icon name="calendar" size={15} />

                  <div>
                    <span>Fin prévue</span>
                    <strong>
                      {project.date_fin_prevue || "Non renseignée"}
                    </strong>
                  </div>

                </div>

              </div>


              {/* --------------------------------------------
                  FOOTER / ACTIONS
              -------------------------------------------- */}

              <div className="chef-project-card-footer">

                <span>
                  Client : {project.client || "Non renseigné"}
                </span>

                <div className="chef-project-card-actions">

                  <button
                    type="button"
                    className="chef-project-view-button"
                    onClick={() =>
                      navigate(`/chef/projets/${project.id_projet}`)
                    }
                  >
                    <Icon name="eye" size={14} />
                    Voir le projet
                  </button>

                  <button
                    type="button"
                    className="chef-project-edit-button"
                    onClick={() =>
                      navigate(
                        `/chef/projets/${project.id_projet}/modifier`
                      )
                    }
                  >
                    <Icon name="edit" size={14} />
                    Modifier
                  </button>

                </div>

              </div>

            </article>
          ))}

        </div>
      )}

    </div>
  );
}

export default ChefProjects;

