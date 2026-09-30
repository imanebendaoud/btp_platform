import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  getMyProjects,
  getMyTasks,
  getMyProgress,
  getMyReports,
  getMyNotifications,
} from "../../services/projectService";
import "./ChefDashboard.css";

/* ============================================================
   ICÔNES SVG
   ============================================================ */

const Icon = ({ name, size = 22 }) => {
  const commonProps = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "calendar":
      return (
        <svg {...commonProps}>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );

    case "building":
      return (
        <svg {...commonProps}>
          <path d="M3 21h18" />
          <path d="M5 21V5l7-3v19" />
          <path d="M12 8h7v13" />
          <path d="M8 7h1" />
          <path d="M8 11h1" />
          <path d="M8 15h1" />
          <path d="M15 11h1" />
          <path d="M15 15h1" />
        </svg>
      );

    case "tasks":
      return (
        <svg {...commonProps}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <line x1="8" y1="8" x2="16" y2="8" />
          <line x1="8" y1="12" x2="16" y2="12" />
          <line x1="8" y1="16" x2="13" y2="16" />
        </svg>
      );

    case "chart":
      return (
        <svg {...commonProps}>
          <line x1="4" y1="19" x2="20" y2="19" />
          <line x1="4" y1="19" x2="4" y2="5" />
          <polyline points="7,15 10,11 13,13 19,7" />
        </svg>
      );

    case "bell":
      return (
        <svg {...commonProps}>
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
          <path d="M10 21h4" />
        </svg>
      );

    case "document":
      return (
        <svg {...commonProps}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="8" y1="13" x2="16" y2="13" />
          <line x1="8" y1="17" x2="16" y2="17" />
        </svg>
      );

    case "camera":
      return (
        <svg {...commonProps}>
          <path d="M4 7h3l2-3h6l2 3h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
          <circle cx="12" cy="14" r="3" />
        </svg>
      );

    case "alert":
      return (
        <svg {...commonProps}>
          <path d="M10.3 3.7 2.1 18a2 2 0 0 0 1.7 3h16.4a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );

    case "check":
      return (
        <svg {...commonProps}>
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );

    case "activity":
      return (
        <svg {...commonProps}>
          <polyline points="3 12 7 12 10 5 14 19 17 12 21 12" />
        </svg>
      );

    case "robot":
      return (
        <svg {...commonProps}>
          <rect x="4" y="7" width="16" height="12" rx="3" />
          <line x1="12" y1="3" x2="12" y2="7" />
          <circle cx="9" cy="12" r="1" />
          <circle cx="15" cy="12" r="1" />
          <path d="M8 16h8" />
        </svg>
      );

    default:
      return null;
  }
};

const ChefDashboard = () => {
  const { user, accessToken } = useAuth();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [progress, setProgress] = useState([]);
  const [reports, setReports] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /* ============================================================
     CHARGEMENT DES DONNÉES BACKEND
     ============================================================ */

  useEffect(() => {
    const loadDashboard = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const [
          projectsData,
          tasksData,
          progressData,
          reportsData,
          notificationsData,
        ] = await Promise.all([
          getMyProjects(accessToken),
          getMyTasks(accessToken),
          getMyProgress(accessToken),
          getMyReports(accessToken),
          getMyNotifications(accessToken),
        ]);

        setProjects(
          Array.isArray(projectsData)
            ? projectsData
            : projectsData?.results || []
        );

        setTasks(
          Array.isArray(tasksData)
            ? tasksData
            : tasksData?.results || []
        );

        setProgress(
          Array.isArray(progressData)
            ? progressData
            : progressData?.results || []
        );

        setReports(
          Array.isArray(reportsData)
            ? reportsData
            : reportsData?.results || []
        );

        setNotifications(
          Array.isArray(notificationsData)
            ? notificationsData
            : notificationsData?.results || []
        );
      } catch (err) {
        console.error(
          "Erreur lors du chargement du dashboard :",
          err
        );

        setError(
          err?.response?.data?.detail ||
            "Impossible de charger les données du dashboard."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [accessToken]);

  /* ============================================================
     TÂCHES TERMINÉES
     ============================================================ */

  const completedTasks = useMemo(() => {
    return tasks.filter((task) => {
      const status = String(task.statut || "").toLowerCase();

      return (
        status === "terminee" ||
        status === "terminée" ||
        status === "termine" ||
        status === "completed" ||
        status === "complete" ||
        status === "achevee" ||
        status === "achevée"
      );
    }).length;
  }, [tasks]);

  /* ============================================================
     AVANCEMENT MOYEN
     ============================================================ */

  const averageProgress = useMemo(() => {
    if (projects.length === 0) {
      return 0;
    }

    const projectProgress = projects.map((project) => {
      const projectProgressList = progress.filter(
        (item) =>
          Number(item.id_projet) === Number(project.id_projet)
      );

      if (projectProgressList.length === 0) {
        return 0;
      }

      const latest = [...projectProgressList].sort(
        (a, b) =>
          new Date(b.date_avancement) -
          new Date(a.date_avancement)
      )[0];

      return Number(latest.pourcentage) || 0;
    });

    const total = projectProgress.reduce(
      (sum, value) => sum + value,
      0
    );

    return Math.round(total / projectProgress.length);
  }, [projects, progress]);

  /* ============================================================
     TÂCHES EN RETARD
     ============================================================ */

  const lateTasks = useMemo(() => {
    const today = new Date();

    return tasks.filter((task) => {
      if (!task.date_fin_prevue) {
        return false;
      }

      const status = String(task.statut || "").toLowerCase();

      const isCompleted =
        status === "terminee" ||
        status === "terminée" ||
        status === "termine" ||
        status === "completed" ||
        status === "complete" ||
        status === "achevee" ||
        status === "achevée";

      if (isCompleted) {
        return false;
      }

      return new Date(task.date_fin_prevue) < today;
    });
  }, [tasks]);

  /* ============================================================
     NOTIFICATIONS NON LUES
     ============================================================ */

  const unreadNotifications = useMemo(() => {
    return notifications.filter(
      (notification) => !notification.lue
    ).length;
  }, [notifications]);

  /* ============================================================
     PROGRESSION D'UN PROJET
     ============================================================ */

  const getProjectProgress = (projectId) => {
    const projectProgress = progress.filter(
      (item) =>
        Number(item.id_projet) === Number(projectId)
    );

    if (projectProgress.length === 0) {
      return 0;
    }

    const latest = [...projectProgress].sort(
      (a, b) =>
        new Date(b.date_avancement) -
        new Date(a.date_avancement)
    )[0];

    return Number(latest.pourcentage) || 0;
  };

  /* ============================================================
     ACTIVITÉS RÉCENTES
     ============================================================ */

  const recentActivities = useMemo(() => {
    const activities = [];

    progress.forEach((item) => {
      activities.push({
        id: `progress-${item.id_avancement}`,
        type: "progress",
        title: "Nouvel avancement",
        description: `${item.pourcentage}% d'avancement`,
        date: item.date_avancement,
      });
    });

    reports.forEach((report) => {
      activities.push({
        id: `report-${report.id_rapport}`,
        type: "report",
        title: "Nouveau rapport",
        description: report.titre,
        date: report.date_rapport,
      });
    });

    notifications.forEach((notification) => {
      activities.push({
        id: `notification-${notification.id_notification}`,
        type: "notification",
        title: notification.titre,
        description: notification.message,
        date: notification.date_creation,
      });
    });

    return activities
      .sort(
        (a, b) =>
          new Date(b.date) - new Date(a.date)
      )
      .slice(0, 5);
  }, [progress, reports, notifications]);

  /* ============================================================
     FORMATAGE DATE
     ============================================================ */

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString(
      "fr-FR",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /* ============================================================
     NOM UTILISATEUR
     ============================================================ */

  const getUserName = () => {
    if (!user) {
      return "Chef de chantier";
    }

    if (user.prenom && user.nom) {
      return `${user.prenom} ${user.nom}`;
    }

    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }

    return (
      user.nom ||
      user.name ||
      "Chef de chantier"
    );
  };

  /* ============================================================
     CLASSE STATUT
     ============================================================ */

  const getStatusClass = (status) => {
    const value = String(
      status || ""
    ).toLowerCase();

    if (
      value.includes("termin") ||
      value.includes("achev") ||
      value.includes("completed")
    ) {
      return "completed";
    }

    if (
      value.includes("retard") ||
      value.includes("late") ||
      value.includes("annul")
    ) {
      return "danger";
    }

    return "progress";
  };

  /* ============================================================
     ICÔNE ACTIVITÉ
     ============================================================ */

  const getActivityIcon = (type) => {
    if (type === "progress") {
      return <Icon name="activity" size={20} />;
    }

    if (type === "report") {
      return <Icon name="document" size={20} />;
    }

    return <Icon name="bell" size={20} />;
  };

  /* ============================================================
     LOADING
     ============================================================ */

  if (loading) {
    return (
      <div className="chef-dashboard-content">
        <div className="chef-welcome">
          <div>
            <span className="chef-welcome-label">
              Chargement
            </span>

            <h1>
              Bonjour {getUserName()}
            </h1>

            <p className="chef-welcome-description">
              Chargement de votre espace de travail...
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     ERREUR
     ============================================================ */

  if (error) {
    return (
      <div className="chef-dashboard-content">
        <div className="chef-welcome">
          <div>
            <span className="chef-welcome-label">
              Tableau de bord
            </span>

            <h1>
              Bonjour {getUserName()}
            </h1>

            <p className="chef-welcome-description">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     DASHBOARD
     ============================================================ */

  return (
    <div className="chef-dashboard-content">

      {/* ======================================================
          WELCOME
      ====================================================== */}

      <div className="chef-welcome">
        <div>
          <span className="chef-welcome-label">
            Tableau de bord
          </span>

          <h1>
            Bonjour {getUserName()}
          </h1>

          <p className="chef-welcome-description">
            Voici un aperçu de vos chantiers et de leur avancement.
          </p>
        </div>

        <div className="chef-date-button">
          <Icon name="calendar" size={18} />

          {new Date().toLocaleDateString(
            "fr-FR",
            {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            }
          )}
        </div>
      </div>

      {/* ======================================================
          STATISTIQUES
      ====================================================== */}

      <div className="chef-stats-grid">

        {/* PROJETS */}

        <div className="chef-stat-card">
          <div className="chef-stat-top">

            <div className="chef-stat-icon">
              <Icon name="building" size={24} />
            </div>

            <div className="chef-stat-content">
              <span className="chef-stat-label">
                Mes projets
              </span>

              <strong>
                {projects.length}
              </strong>
            </div>

          </div>

          <div className="chef-stat-trend">
            Projets assignés
          </div>
        </div>

        {/* TÂCHES */}

        <div className="chef-stat-card">
          <div className="chef-stat-top">

            <div className="chef-stat-icon">
              <Icon name="tasks" size={24} />
            </div>

            <div className="chef-stat-content">
              <span className="chef-stat-label">
                Tâches
              </span>

              <strong>
                {tasks.length}
              </strong>
            </div>

          </div>

          <div className="chef-stat-trend">
            {completedTasks} terminée(s)
          </div>
        </div>

        {/* AVANCEMENT */}

        <div className="chef-stat-card">
          <div className="chef-stat-top">

            <div className="chef-stat-icon">
              <Icon name="chart" size={24} />
            </div>

            <div className="chef-stat-content">
              <span className="chef-stat-label">
                Avancement moyen
              </span>

              <strong>
                {averageProgress}%
              </strong>
            </div>

          </div>

          <div className="chef-stat-trend">
            Progression globale
          </div>
        </div>

        {/* NOTIFICATIONS */}

        <div className="chef-stat-card">
          <div className="chef-stat-top">

            <div className="chef-stat-icon">
              <Icon name="bell" size={24} />
            </div>

            <div className="chef-stat-content">
              <span className="chef-stat-label">
                Notifications
              </span>

              <strong>
                {unreadNotifications}
              </strong>
            </div>

          </div>

          <div className="chef-stat-trend">
            Non lue(s)
          </div>
        </div>

      </div>

      {/* ======================================================
          MAIN GRID
      ====================================================== */}

      <div className="chef-main-grid">

        {/* PROJETS */}

        <div className="chef-card">

          <div className="chef-card-header">
            <div>
              <h2>
                Mes projets
              </h2>

              <span>
                Projets qui vous sont assignés
              </span>
            </div>

            <button className="chef-view-all">
              Voir tout
            </button>
          </div>

          <div className="chef-projects-list">

            {projects.length === 0 ? (
              <div className="chef-project-item">
                <div className="chef-project-name">
                  Aucun projet assigné
                </div>
              </div>
            ) : (
              projects.slice(0, 4).map((project) => {
                const projectProgress =
                  getProjectProgress(
                    project.id_projet
                  );

                return (
                  <div
                    className="chef-project-item"
                    key={project.id_projet}
                  >

                    <div className="chef-project-top">

                      <div className="chef-project-symbol">
                        <Icon
                          name="building"
                          size={21}
                        />
                      </div>

                      <div className="chef-project-name">

                        <strong>
                          {project.nom}
                        </strong>

                        <span>
                          {project.numero_projet}
                        </span>

                      </div>

                      <div
                        className={`chef-project-status ${getStatusClass(
                          project.statut
                        )}`}
                      >
                        {project.statut ||
                          "En cours"}
                      </div>

                    </div>

                    <div className="chef-progress-label">

                      <span>
                        Avancement
                      </span>

                      <strong>
                        {projectProgress}%
                      </strong>

                    </div>

                    <div className="chef-progress-bar">

                      <div
                        className="chef-progress-fill"
                        style={{
                          width: `${Math.min(
                            Math.max(
                              projectProgress,
                              0
                            ),
                            100
                          )}%`,
                        }}
                      />

                    </div>

                    <div className="chef-project-footer">

                      <span>
                        <Icon
                          name="calendar"
                          size={14}
                        />

                        Début :{" "}
                        {formatDate(
                          project.date_debut
                        ) ||
                          "Non défini"}
                      </span>

                      <span>
                        <Icon
                          name="calendar"
                          size={14}
                        />

                        Fin prévue :{" "}
                        {formatDate(
                          project.date_fin_prevue
                        ) ||
                          "Non définie"}
                      </span>

                    </div>

                  </div>
                );
              })
            )}

          </div>
        </div>

        {/* ACTIVITÉS */}

        <div className="chef-card">

          <div className="chef-card-header">

            <div>
              <h2>
                Activités récentes
              </h2>

              <span>
                Dernières actions sur vos projets
              </span>
            </div>

            <button className="chef-more-button">
              ⋮
            </button>

          </div>

          <div className="chef-activities-list">

            {recentActivities.length === 0 ? (

              <div className="chef-activity-item">

                <div className="chef-activity-content">

                  <strong>
                    Aucune activité récente
                  </strong>

                  <span>
                    Les nouvelles activités apparaîtront ici.
                  </span>

                </div>

              </div>

            ) : (

              recentActivities.map(
                (activity) => (

                  <div
                    className="chef-activity-item"
                    key={activity.id}
                  >

                    <div className="chef-activity-icon">
                      {getActivityIcon(
                        activity.type
                      )}
                    </div>

                    <div className="chef-activity-content">

                      <strong>
                        {activity.title}
                      </strong>

                      <span>
                        {activity.description}
                      </span>

                      <small>
                        {formatDate(
                          activity.date
                        )}
                      </small>

                    </div>

                  </div>

                )
              )

            )}

          </div>

          <button className="chef-all-activities">
            Voir toutes les activités
          </button>

        </div>

      </div>

      {/* ======================================================
          BOTTOM GRID
      ====================================================== */}

      <div className="chef-bottom-grid">

        {/* ALERTES */}

        <div className="chef-card">

          <div className="chef-card-header">

            <div>
              <h2>
                Alertes
              </h2>

              <span>
                Points nécessitant votre attention
              </span>
            </div>

          </div>

          <div className="chef-alerts-list">

            {/* TÂCHES EN RETARD */}

            {lateTasks.length > 0 && (

              <div className="chef-alert-item chef-danger-alert">

                <div className="chef-alert-icon">
                  <Icon
                    name="alert"
                    size={20}
                  />
                </div>

                <div className="chef-alert-number">
                  {lateTasks.length}
                </div>

                <div className="chef-alert-content">

                  <strong>
                    Tâche(s) en retard
                  </strong>

                  <span>
                    Des tâches ont dépassé leur date prévue.
                  </span>

                </div>

              </div>

            )}

            {/* NOTIFICATIONS */}

            {unreadNotifications > 0 && (

              <div className="chef-alert-item chef-warning-alert">

                <div className="chef-alert-icon">
                  <Icon
                    name="bell"
                    size={20}
                  />
                </div>

                <div className="chef-alert-number">
                  {unreadNotifications}
                </div>

                <div className="chef-alert-content">

                  <strong>
                    Notification(s) non lue(s)
                  </strong>

                  <span>
                    Vous avez de nouvelles notifications.
                  </span>

                </div>

              </div>

            )}

            {/* AUCUNE ALERTE */}

            {lateTasks.length === 0 &&
              unreadNotifications === 0 && (

                <div className="chef-alert-item chef-info-alert">

                  <div className="chef-alert-icon">
                    <Icon
                      name="check"
                      size={20}
                    />
                  </div>

                  <div className="chef-alert-content">

                    <strong>
                      Tout est en ordre
                    </strong>

                    <span>
                      Aucune alerte importante pour le moment.
                    </span>

                  </div>

                </div>

              )}

          </div>

        </div>

        {/* ACTIONS RAPIDES */}

        <div className="chef-card">

          <div className="chef-card-header">

            <div>

              <h2>
                Actions rapides
              </h2>

              <span>
                Accédez rapidement aux fonctionnalités
              </span>

            </div>

          </div>

          <div className="chef-quick-actions">

            <button className="chef-quick-action">

              <div className="chef-quick-icon">
                <Icon
                  name="tasks"
                  size={22}
                />
              </div>

              <span>
                Mes tâches
              </span>

            </button>

            <button className="chef-quick-action">

              <div className="chef-quick-icon">
                <Icon
                  name="chart"
                  size={22}
                />
              </div>

              <span>
                Avancement
              </span>

            </button>

            <button className="chef-quick-action">

              <div className="chef-quick-icon">
                <Icon
                  name="document"
                  size={22}
                />
              </div>

              <span>
                Rapports
              </span>

            </button>

            <button className="chef-quick-action">

              <div className="chef-quick-icon">
                <Icon
                  name="camera"
                  size={22}
                />
              </div>

              <span>
                Photos
              </span>

            </button>

          </div>

        </div>

      </div>

      {/* ======================================================
          AI ASSISTANT
      ====================================================== */}

      <div className="chef-ai-card">

        <div className="chef-ai-icon">
          <Icon
            name="robot"
            size={28}
          />
        </div>

        <div className="chef-ai-content">

          <span className="chef-ai-label">
            Assistant IA
          </span>

          <h3>
            Besoin d'aide pour analyser vos chantiers ?
          </h3>

          <p>
            L'assistant IA pourra vous aider à analyser
            l'avancement, détecter les risques et anticiper
            les retards.
          </p>

        </div>

        <button className="chef-ai-button">
          Ouvrir l'assistant
        </button>

      </div>

    </div>
  );
};

export default ChefDashboard;