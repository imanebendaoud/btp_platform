
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { getMyProjects } from "../../services/projectService";
import "./ChefEquipe.css";

function normalizeList(response) {
  const data = response?.data ?? response;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;

  return [];
}

function getId(value) {
  if (value && typeof value === "object") {
    return value.id_projet ?? value.id ?? value.pk ?? null;
  }
  return value ?? null;
}

function getEmployeeName(assignment) {
  const employee =
    assignment.id_employe && typeof assignment.id_employe === "object"
      ? assignment.id_employe
      : assignment.employe && typeof assignment.employe === "object"
        ? assignment.employe
        : {};

  const prenom =
    assignment.employe_prenom ??
    assignment.prenom_employe ??
    employee.prenom ??
    "";

  const nom =
    assignment.employe_nom ??
    assignment.nom_employe ??
    employee.nom ??
    "";

  return `${prenom} ${nom}`.trim() || "Nom indisponible";
}

function getProjectName(assignment) {
  const project =
    assignment.id_projet && typeof assignment.id_projet === "object"
      ? assignment.id_projet
      : assignment.projet && typeof assignment.projet === "object"
        ? assignment.projet
        : {};

  const numero =
    assignment.projet_numero ?? project.numero_projet ?? "";

  const nom =
    assignment.projet_nom ?? project.nom ?? "";

  return [numero, nom].filter(Boolean).join(" — ") || "Projet indisponible";
}

function getFunction(assignment) {
  return (
    assignment.fonction_sur_chantier ??
    assignment.id_employe?.poste ??
    assignment.poste ??
    "Non précisée"
  );
}

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(`${date}`.slice(0, 10) + "T00:00:00");

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getAssignmentStatus(assignment) {
  if (assignment.date_fin) {
    const endDate = new Date(`${assignment.date_fin}`.slice(0, 10) + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!Number.isNaN(endDate.getTime()) && endDate < today) {
      return "Terminée";
    }
  }

  return "En cours";
}

function Icon({ name, size = 20 }) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  const paths = {
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    building: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M9 21v-4h6v4M8 7h2m4 0h2M8 11h2m4 0h2" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-4-4" />
      </>
    ),
    calendar: (
      <>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M16 3v4M8 3v4M3 10h18" />
      </>
    ),
    briefcase: (
      <>
        <rect x="3" y="7" width="18" height="14" rx="2" />
        <path d="M8 7V4h8v3M3 12h18M10 12v2h4v-2" />
      </>
    ),
    refresh: (
      <>
        <path d="M20 7v5h-5M4 17v-5h5" />
        <path d="M5.5 9a7 7 0 0 1 11.6-2L20 12M4 12l2.9 5a7 7 0 0 0 11.6-2" />
      </>
    ),
    check: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </>
    ),
    alert: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 8v5m0 3h.01" />
      </>
    ),
  };

  return <svg {...common}>{paths[name] ?? paths.briefcase}</svg>;
}

export default function ChefEquipe() {
  const { accessToken } = useAuth();

  const [projects, setProjects] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedProject, setSelectedProject] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      setError("");

      try {
        const [projectsResponse, assignmentsResponse] = await Promise.all([
          getMyProjects(accessToken),
          api.get("/hr/affectations/"),
        ]);

        if (cancelled) return;

        const projectList = normalizeList(projectsResponse);
        const assignmentList = normalizeList(assignmentsResponse);

        const projectIds = new Set(
          projectList.map((project) => String(getId(project))).filter(Boolean)
        );

        const chefAssignments = assignmentList.filter((assignment) => {
          const projectId = getId(
            assignment.id_projet ?? assignment.projet
          );

          return projectId != null && projectIds.has(String(projectId));
        });

        setProjects(projectList);
        setAssignments(chefAssignments);
      } catch (err) {
        if (cancelled) return;

        if (err?.response?.status === 403) {
          setError("Vous n'avez pas l'autorisation de consulter ces affectations.");
        } else {
          setError(
            "Impossible de charger les affectations. Vérifiez la connexion au serveur."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [accessToken]);

  const filteredAssignments = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("fr");

    return assignments.filter((assignment) => {
      const projectId = getId(assignment.id_projet ?? assignment.projet);

      const matchesProject =
        selectedProject === "all" ||
        String(projectId) === String(selectedProject);

      const searchableText = [
        getEmployeeName(assignment),
        getProjectName(assignment),
        getFunction(assignment),
        assignment.id_affectation ?? assignment.id ?? "",
      ]
        .join(" ")
        .toLocaleLowerCase("fr");

      return matchesProject && (!term || searchableText.includes(term));
    });
  }, [assignments, search, selectedProject]);

  const activeCount = assignments.filter(
    (assignment) => getAssignmentStatus(assignment) === "En cours"
  ).length;

  const uniqueProjectCount = new Set(
    assignments
      .map((assignment) =>
        getId(assignment.id_projet ?? assignment.projet)
      )
      .filter((id) => id != null)
      .map(String)
  ).size;

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <main className="chef-equipe-page">
      <header className="equipe-page-header">
        <div>
          <div className="equipe-eyebrow">GESTION DU CHANTIER</div>
          <h1>Mon équipe</h1>
          <p>Consultez les employés affectés à vos chantiers.</p>
        </div>

        <button
          type="button"
          className="equipe-refresh-button"
          onClick={handleRefresh}
          title="Actualiser la page"
        >
          <Icon name="refresh" size={17} />
          <span>Actualiser</span>
        </button>
      </header>

      <section className="equipe-stats-grid" aria-label="Statistiques de l'équipe">
        <article className="equipe-stat-card">
          <div className="equipe-stat-top">
            <span className="equipe-stat-icon icon-nude">
              <Icon name="users" size={22} />
            </span>
            <span className="equipe-stat-label">Affectations</span>
          </div>
          <div className="equipe-stat-value">{assignments.length}</div>
          <p className="equipe-stat-description">Employés affectés à vos chantiers</p>
        </article>

        <article className="equipe-stat-card">
          <div className="equipe-stat-top">
            <span className="equipe-stat-icon icon-green">
              <Icon name="check" size={22} />
            </span>
            <span className="equipe-stat-label">En cours</span>
          </div>
          <div className="equipe-stat-value">{activeCount}</div>
          <p className="equipe-stat-description">Affectations actives</p>
        </article>

        <article className="equipe-stat-card">
          <div className="equipe-stat-top">
            <span className="equipe-stat-icon icon-brown">
              <Icon name="building" size={22} />
            </span>
            <span className="equipe-stat-label">Chantiers</span>
          </div>
          <div className="equipe-stat-value">{uniqueProjectCount}</div>
          <p className="equipe-stat-description">Chantiers avec affectations</p>
        </article>
      </section>

      <section className="equipe-list-card">
        <div className="equipe-list-header">
          <div>
            <h2>Liste des affectations</h2>
            <p>Employés et fonctions sur vos chantiers</p>
          </div>
          <span className="equipe-count-badge">
            {filteredAssignments.length} résultat(s)
          </span>
        </div>

        <div className="equipe-filters">
          <label className="equipe-search">
            <Icon name="search" size={19} />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un employé, un chantier..."
              aria-label="Rechercher une affectation"
            />
          </label>

          <label className="equipe-project-filter">
            <span>Chantier</span>
            <select
              value={selectedProject}
              onChange={(event) => setSelectedProject(event.target.value)}
              aria-label="Filtrer par chantier"
            >
              <option value="all">Tous les chantiers</option>
              {projects.map((project) => {
                const projectId = getId(project);

                return (
                  <option key={projectId} value={projectId}>
                    {[project.numero_projet, project.nom]
                      .filter(Boolean)
                      .join(" — ") || `Chantier ${projectId}`}
                  </option>
                );
              })}
            </select>
          </label>
        </div>

        {error && (
          <div className="equipe-message equipe-error" role="alert">
            <Icon name="alert" size={19} />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="equipe-state">
            <span className="equipe-spinner" />
            <p>Chargement des affectations...</p>
          </div>
        ) : !error && filteredAssignments.length === 0 ? (
          <div className="equipe-state">
            <span className="equipe-empty-icon">
              <Icon name="users" size={30} />
            </span>
            <h3>Aucune affectation trouvée</h3>
            <p>
              {search || selectedProject !== "all"
                ? "Essayez de modifier vos critères de recherche."
                : "Aucun employé n'est affecté à vos chantiers pour le moment."}
            </p>
          </div>
        ) : !error ? (
          <div className="equipe-table-wrapper">
            <table className="equipe-table">
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Fonction</th>
                  <th>Chantier</th>
                  <th>Date de début</th>
                  <th>Date de fin</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssignments.map((assignment, index) => {
                  const employeeName = getEmployeeName(assignment);
                  const projectName = getProjectName(assignment);
                  const status = getAssignmentStatus(assignment);
                  const assignmentId =
                    assignment.id_affectation ?? assignment.id ?? index;

                  return (
                    <tr key={assignmentId}>
                      <td>
                        <div className="equipe-employee">
                          <div className="equipe-avatar">
                            {employeeName.charAt(0).toLocaleUpperCase("fr")}
                          </div>
                          <div className="equipe-employee-info">
                            <span className="equipe-employee-name">
                              {employeeName}
                            </span>
                            <span className="equipe-employee-reference">
                              Affectation #{assignmentId}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="equipe-function">
                          {getFunction(assignment)}
                        </span>
                      </td>

                      <td>
                        <div className="equipe-project-name">
                          <Icon name="building" size={17} />
                          <span>{projectName}</span>
                        </div>
                      </td>

                      <td>
                        <span className="equipe-date">
                          <Icon name="calendar" size={15} />
                          {formatDate(assignment.date_debut)}
                        </span>
                      </td>

                      <td>
                        <span className="equipe-date">
                          <Icon name="calendar" size={15} />
                          {formatDate(assignment.date_fin)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`equipe-status ${
                            status === "En cours"
                              ? "status-active"
                              : "status-finished"
                          }`}
                        >
                          <Icon
                            name={status === "En cours" ? "check" : "clock"}
                            size={16}
                          />
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}

        <footer className="equipe-list-footer">
          <span>
            Affichage de {filteredAssignments.length} affectation(s)
          </span>
          <span className="equipe-footer-indicator">
            <span />
            Données de vos chantiers
          </span>
        </footer>
      </section>
    </main>
  );
}
