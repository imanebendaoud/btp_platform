import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  getMyProjects,
  getMyTasks,
} from "../../services/projectService";

import "./ChefTasks.css";


function ChefTasks() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    accessToken,
    loading: authLoading,
  } = useAuth();

  // ============================================================
  // PARAMÈTRES URL
  // ============================================================

  const projectIdFromUrl = searchParams.get("projet");


  // ============================================================
  // STATES
  // ============================================================

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // ============================================================
  // NORMALISATION DES DONNÉES
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


  // ============================================================
  // RÉCUPÉRER L'ID DU PROJET D'UNE TÂCHE
  // ============================================================

  const getProjectId = (task) => {
    if (!task) {
      return null;
    }

    if (
      typeof task.id_projet === "object" &&
      task.id_projet !== null
    ) {
      return Number(task.id_projet.id_projet);
    }

    return Number(task.id_projet);
  };


  // ============================================================
  // FORMATER UNE DATE
  // ============================================================

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("fr-FR");
  };


  // ============================================================
  // STATUT
  // ============================================================

  const getStatusLabel = (status) => {
    if (!status) {
      return "Non défini";
    }

    const normalized = status
      .toString()
      .toLowerCase();

    const labels = {
      planifie: "Planifié",
      planifié: "Planifié",
      en_cours: "En cours",
      "en cours": "En cours",
      termine: "Terminé",
      terminé: "Terminé",
      suspendu: "Suspendu",
      annule: "Annulé",
      annulé: "Annulé",
    };

    return labels[normalized] || status;
  };


  // ============================================================
  // CLASSE CSS STATUT
  // ============================================================

  const getStatusClass = (status) => {
    if (!status) {
      return "task-status-planned";
    }

    const normalized = status
      .toString()
      .toLowerCase();

    if (
      normalized === "en_cours" ||
      normalized === "en cours"
    ) {
      return "task-status-progress";
    }

    if (
      normalized === "termine" ||
      normalized === "terminé"
    ) {
      return "task-status-completed";
    }

    if (
      normalized === "suspendu" ||
      normalized === "annule" ||
      normalized === "annulé"
    ) {
      return "task-status-danger";
    }

    return "task-status-planned";
  };


  // ============================================================
  // PRIORITÉ
  // ============================================================

  const getPriorityLabel = (priority) => {
    if (!priority) {
      return "Non définie";
    }

    const normalized = priority
      .toString()
      .toLowerCase();

    const labels = {
      basse: "Basse",
      moyenne: "Moyenne",
      haute: "Haute",
    };

    return labels[normalized] || priority;
  };


  // ============================================================
  // CLASSE CSS PRIORITÉ
  // ============================================================

  const getPriorityClass = (priority) => {
    if (!priority) {
      return "task-priority-medium";
    }

    const normalized = priority
      .toString()
      .toLowerCase();

    if (normalized === "haute") {
      return "task-priority-high";
    }

    if (normalized === "basse") {
      return "task-priority-low";
    }

    return "task-priority-medium";
  };


  // ============================================================
  // CHARGEMENT DES TÂCHES ET PROJETS
  // ============================================================

  useEffect(() => {
    if (authLoading || !accessToken) {
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          tasksData,
          projectsData,
        ] = await Promise.all([
          getMyTasks(accessToken),
          getMyProjects(accessToken),
        ]);

        setTasks(normalizeData(tasksData));
        setProjects(normalizeData(projectsData));

      } catch (err) {
        console.error(
          "Erreur lors du chargement des tâches :",
          err
        );

        setError(
          "Impossible de charger les tâches."
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [accessToken, authLoading]);


  // ============================================================
  // MAP DES PROJETS
  // ============================================================

  const projectMap = useMemo(() => {
    const map = {};

    projects.forEach((project) => {
      map[Number(project.id_projet)] = project;
    });

    return map;
  }, [projects]);


  // ============================================================
  // NOM DU PROJET
  // ============================================================

  const getProjectLabel = (projectId) => {
    const project = projectMap[Number(projectId)];

    if (!project) {
      return "Projet inconnu";
    }

    if (project.numero_projet && project.nom) {
      return `${project.numero_projet} — ${project.nom}`;
    }

    return (
      project.nom ||
      project.numero_projet ||
      `Projet ${projectId}`
    );
  };


  // ============================================================
  // PROJET SÉLECTIONNÉ
  // ============================================================

  const selectedProject = useMemo(() => {
    if (!projectIdFromUrl) {
      return null;
    }

    return projects.find(
      (project) =>
        Number(project.id_projet) ===
        Number(projectIdFromUrl)
    );
  }, [projects, projectIdFromUrl]);


  // ============================================================
  // FILTRAGE DES TÂCHES
  // ============================================================

  const filteredTasks = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return tasks.filter((task) => {
      const taskProjectId = getProjectId(task);

      // --------------------------------------------------------
      // Filtre projet venant de l'URL
      // --------------------------------------------------------

      if (
        projectIdFromUrl &&
        taskProjectId !== Number(projectIdFromUrl)
      ) {
        return false;
      }

      // --------------------------------------------------------
      // Recherche
      // --------------------------------------------------------

      if (normalizedSearch) {
        const project = projectMap[taskProjectId];

        const projectText = project
          ? `${project.numero_projet || ""} ${
              project.nom || ""
            }`
          : "";

        const searchableText = `
          ${task.titre || ""}
          ${task.description || ""}
          ${task.statut || ""}
          ${task.priorite || ""}
          ${projectText}
        `.toLowerCase();

        if (!searchableText.includes(normalizedSearch)) {
          return false;
        }
      }

      // --------------------------------------------------------
      // Filtre statut
      // --------------------------------------------------------

      if (
        statusFilter &&
        task.statut !== statusFilter
      ) {
        return false;
      }

      // --------------------------------------------------------
      // Filtre priorité
      // --------------------------------------------------------

      if (
        priorityFilter &&
        task.priorite !== priorityFilter
      ) {
        return false;
      }

      return true;
    });
  }, [
    tasks,
    projectIdFromUrl,
    search,
    statusFilter,
    priorityFilter,
    projectMap,
  ]);


  // ============================================================
  // MODIFIER UNE TÂCHE
  // ============================================================

  const handleEdit = (task) => {
    navigate(
      `/chef/taches/${task.id_tache}/modifier`
    );
  };


  // ============================================================
  // NOUVELLE TÂCHE
  // ============================================================

  const handleCreate = () => {
    if (projectIdFromUrl) {
      navigate(
        `/chef/taches/nouvelle?projet=${projectIdFromUrl}`
      );
      return;
    }

    navigate("/chef/taches/nouvelle");
  };


  // ============================================================
  // RÉINITIALISER LES FILTRES
  // ============================================================

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
  };


  // ============================================================
  // CHARGEMENT
  // ============================================================

  if (authLoading || loading) {
    return (
      <div className="chef-tasks-page">
        <div className="tasks-loading">
          Chargement des tâches...
        </div>
      </div>
    );
  }


  // ============================================================
  // ERREUR
  // ============================================================

  if (error) {
    return (
      <div className="chef-tasks-page">
        <div className="tasks-error">
          <h2>Impossible de charger les tâches</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="chef-tasks-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="tasks-page-header">

        <div className="tasks-header-content">

          <span className="tasks-eyebrow">
            GESTION DES TÂCHES
          </span>

          <h1>
            Tâches
          </h1>

          <p>
            Consultez et gérez les tâches de vos projets.
          </p>

        </div>


        <button
          type="button"
          className="tasks-create-button"
          onClick={handleCreate}
        >

          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>

          Nouvelle tâche

        </button>

      </div>


      {/* ======================================================
          PROJET SÉLECTIONNÉ
      ====================================================== */}

      {selectedProject && (
        <div className="tasks-selected-project">

          <div className="tasks-selected-project-icon">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 21h18" />
              <path d="M5 21V7l7-4 7 4v14" />
              <path d="M9 21v-5h6v5" />
              <path d="M9 9h.01" />
              <path d="M15 9h.01" />
              <path d="M9 12h.01" />
              <path d="M15 12h.01" />
            </svg>
          </div>

          <div>
            <span>
              Projet sélectionné
            </span>

            <strong>
              {selectedProject.numero_projet
                ? `${selectedProject.numero_projet} — `
                : ""}
              {selectedProject.nom}
            </strong>
          </div>

        </div>
      )}


      {/* ======================================================
          FILTRES
      ====================================================== */}

      <div className="tasks-filters">

        <div className="tasks-search">

          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>

          <input
            type="text"
            placeholder="Rechercher une tâche..."
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
          />

        </div>


        <select
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="">
            Tous les statuts
          </option>

          <option value="PLANIFIE">
            Planifié
          </option>

          <option value="EN_COURS">
            En cours
          </option>

          <option value="TERMINE">
            Terminé
          </option>

          <option value="SUSPENDU">
            Suspendu
          </option>

          <option value="ANNULE">
            Annulé
          </option>
        </select>


        <select
          value={priorityFilter}
          onChange={(event) =>
            setPriorityFilter(event.target.value)
          }
        >
          <option value="">
            Toutes les priorités
          </option>

          <option value="BASSE">
            Basse
          </option>

          <option value="MOYENNE">
            Moyenne
          </option>

          <option value="HAUTE">
            Haute
          </option>
        </select>


        {(search ||
          statusFilter ||
          priorityFilter) && (
          <button
            type="button"
            className="tasks-reset-button"
            onClick={resetFilters}
          >
            Réinitialiser
          </button>
        )}

      </div>


      {/* ======================================================
          RÉSULTAT
      ====================================================== */}

      <div className="tasks-results-info">

        <span>
          {filteredTasks.length} tâche
          {filteredTasks.length !== 1 ? "s" : ""}
        </span>

      </div>


      {/* ======================================================
          TABLEAU
      ====================================================== */}

      <div className="tasks-table-card">

        {filteredTasks.length === 0 ? (

          <div className="tasks-empty">

            <div className="tasks-empty-icon">
              <svg
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect
                  x="4"
                  y="4"
                  width="16"
                  height="16"
                  rx="2"
                />

                <line
                  x1="8"
                  y1="9"
                  x2="16"
                  y2="9"
                />

                <line
                  x1="8"
                  y1="13"
                  x2="14"
                  y2="13"
                />
              </svg>
            </div>

            <h3>
              Aucune tâche trouvée
            </h3>

            <p>
              Aucune tâche ne correspond aux critères
              sélectionnés.
            </p>

            {(search ||
              statusFilter ||
              priorityFilter) && (
              <button
                type="button"
                onClick={resetFilters}
              >
                Réinitialiser les filtres
              </button>
            )}

          </div>

        ) : (

          <div className="tasks-table-wrapper">

            <table className="tasks-table">

              <thead>
                <tr>

                  <th>
                    Titre
                  </th>

                  <th>
                    Projet
                  </th>

                  <th>
                    Description
                  </th>

                  <th>
                    Date début
                  </th>

                  <th>
                    Date fin prévue
                  </th>

                  <th>
                    Date fin réelle
                  </th>

                  <th>
                    Statut
                  </th>

                  <th>
                    Priorité
                  </th>

                  <th>
                    Action
                  </th>

                </tr>
              </thead>


              <tbody>

                {filteredTasks.map((task) => {

                  const projectId =
                    getProjectId(task);

                  return (
                    <tr key={task.id_tache}>

                      {/* ====================================
                          TITRE
                      ==================================== */}

                      <td className="task-title-cell">
                        <strong>
                          {task.titre || "—"}
                        </strong>
                      </td>


                      {/* ====================================
                          PROJET
                      ==================================== */}

                      <td className="task-project-cell">
                        {getProjectLabel(projectId)}
                      </td>


                      {/* ====================================
                          DESCRIPTION
                      ==================================== */}

                      <td className="task-description-cell">
                        {task.description || "—"}
                      </td>


                      {/* ====================================
                          DATE DÉBUT
                      ==================================== */}

                      <td>
                        {formatDate(task.date_debut)}
                      </td>


                      {/* ====================================
                          DATE FIN PRÉVUE
                      ==================================== */}

                      <td>
                        {formatDate(
                          task.date_fin_prevue
                        )}
                      </td>


                      {/* ====================================
                          DATE FIN RÉELLE
                      ==================================== */}

                      <td>
                        {formatDate(
                          task.date_fin_reelle
                        )}
                      </td>


                      {/* ====================================
                          STATUT
                      ==================================== */}

                      <td>

                        <span
                          className={`task-status ${getStatusClass(
                            task.statut
                          )}`}
                        >
                          {getStatusLabel(
                            task.statut
                          )}
                        </span>

                      </td>


                      {/* ====================================
                          PRIORITÉ
                      ==================================== */}

                      <td>

                        <span
                          className={`task-priority ${getPriorityClass(
                            task.priorite
                          )}`}
                        >
                          {getPriorityLabel(
                            task.priorite
                          )}
                        </span>

                      </td>


                      {/* ====================================
                          ACTION
                      ==================================== */}

                      <td>

                        <button
                          type="button"
                          className="task-edit-button"
                          onClick={() =>
                            handleEdit(task)
                          }
                        >

                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path
                              d="M12 20h9"
                            />

                            <path
                              d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z"
                            />
                          </svg>

                          Modifier

                        </button>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default ChefTasks;