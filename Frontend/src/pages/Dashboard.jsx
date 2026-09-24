import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getDashboardSummary } from "../services/dashboardService";
import "./Dashboard.css";

function Dashboard() {
  const {
    user,
    accessToken,
    loading: authLoading,
  } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      /*
       * On attend que AuthContext ait terminé
       * de vérifier la session.
       */
      if (authLoading) {
        return;
      }

      /*
       * Aucun token = utilisateur non connecté
       */
      if (!accessToken) {
        setDashboard(null);
        setLoading(false);
        setError(
          "Votre session a expiré. Veuillez vous reconnecter."
        );
        return;
      }

      try {
        setLoading(true);
        setError("");

        const data = await getDashboardSummary();

        console.log("Données Dashboard :", data);

        setDashboard(data);
      } catch (err) {
        console.error("Erreur Dashboard :", err);

        if (err.response) {
          console.error(
            "Status :",
            err.response.status
          );

          console.error(
            "Réponse serveur :",
            err.response.data
          );

          /*
           * Erreur spécifique d'authentification
           */
          if (err.response.status === 401) {
            setError(
              "Votre session n'est plus valide. Veuillez vous reconnecter."
            );
          } else if (err.response.status === 403) {
            setError(
              "Vous n'avez pas l'autorisation d'accéder au dashboard."
            );
          } else {
            setError(
              "Impossible de charger les données du tableau de bord."
            );
          }
        } else {
          setError(
            "Impossible de contacter le serveur."
          );
        }

        setDashboard(null);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [authLoading, accessToken]);

  /* =========================
     CHARGEMENT AUTHENTIFICATION
  ========================= */

  if (authLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>

          <h2>
            Vérification de votre session...
          </h2>

          <p>
            Vérification de votre authentification.
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     CHARGEMENT DASHBOARD
  ========================= */

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>

          <h2>
            Chargement du tableau de bord...
          </h2>

          <p>
            Récupération des données depuis PostgreSQL.
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     ERREUR
  ========================= */

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error">
          <div className="error-icon">
            !
          </div>

          <h2>
            Impossible de charger le dashboard
          </h2>

          <p>
            {error}
          </p>

          <button
            className="retry-button"
            onClick={() => {
              window.location.reload();
            }}
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  /* =========================
     SÉCURITÉ
  ========================= */

  if (!dashboard) {
    return null;
  }

  /* =========================
     DONNÉES
  ========================= */

  const totalProjets = Number(
    dashboard.projets || 0
  );

  const totalEmployes = Number(
    dashboard.employes || 0
  );

  const alertesStock = Number(
    dashboard.alertes_stock || 0
  );

  const budgetUtilise = Math.min(
    100,
    Math.max(
      0,
      Number(dashboard.budget_utilise || 0)
    )
  );

  const budgetRestant = Math.max(
    0,
    100 - budgetUtilise
  );

  const totalDepenses = Number(
    dashboard.total_depenses || 0
  );

  const budgetInitial = Number(
    dashboard.budget_initial || 0
  );

  const projetsRecents =
    dashboard.projets_recents || [];

  return (
    <div className="dashboard-page">

      {/* =========================
          HEADER
      ========================= */}

      <header className="dashboard-header">

        <div className="dashboard-header-content">

          <p className="dashboard-eyebrow">
            BOUSSAKSOU CONSTRUCTION
          </p>

          <h1>
            Tableau de bord
          </h1>

          <p className="dashboard-subtitle">
            Bienvenue{" "}
            <strong>
              {user?.prenom || "Utilisateur"}
            </strong>
            , voici un aperçu de votre activité.
          </p>

        </div>

        <div className="dashboard-date">

          <div className="date-icon">
            ▣
          </div>

          <div>

            <small>
              Aujourd'hui
            </small>

            <strong>
              {new Date().toLocaleDateString(
                "fr-FR",
                {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                }
              )}
            </strong>

          </div>

        </div>

      </header>


      {/* =========================
          STATISTIQUES
      ========================= */}

      <section className="stats-grid">

        {/* PROJETS */}

        <div className="stat-card">

          <div className="stat-card-top">

            <div className="stat-icon project-icon">
              ▦
            </div>

            <span className="stat-label">
              Projets
            </span>

          </div>

          <div className="stat-value">
            {totalProjets}
          </div>

          <div className="stat-footer">

            <span className="stat-positive">
              Total
            </span>

            <span>
              projets enregistrés
            </span>

          </div>

        </div>


        {/* EMPLOYÉS */}

        <div className="stat-card">

          <div className="stat-card-top">

            <div className="stat-icon progress-icon">
              ◔
            </div>

            <span className="stat-label">
              Employés
            </span>

          </div>

          <div className="stat-value">
            {totalEmployes}
          </div>

          <div className="stat-footer">

            <span className="stat-neutral">
              Équipe
            </span>

            <span>
              employés
            </span>

          </div>

        </div>


        {/* ALERTES STOCK */}

        <div className="stat-card">

          <div className="stat-card-top">

            <div className="stat-icon stock-icon">
              ▤
            </div>

            <span className="stat-label">
              Alertes stock
            </span>

          </div>

          <div className="stat-value">
            {alertesStock}
          </div>

          <div className="stat-footer">

            {alertesStock > 0 ? (
              <>
                <span className="stat-warning">
                  Attention
                </span>

                <span>
                  stock faible
                </span>
              </>
            ) : (
              <>
                <span className="stat-positive">
                  OK
                </span>

                <span>
                  stock normal
                </span>
              </>
            )}

          </div>

        </div>


        {/* BUDGET */}

        <div className="stat-card">

          <div className="stat-card-top">

            <div className="stat-icon budget-icon">
              DH
            </div>

            <span className="stat-label">
              Budget utilisé
            </span>

          </div>

          <div className="stat-value">
            {budgetUtilise}%
          </div>

          <div className="stat-footer">

            <span className="stat-neutral">
              {budgetRestant.toFixed(1)}%
            </span>

            <span>
              restant
            </span>

          </div>

        </div>

      </section>


      {/* =========================
          PROJETS + ALERTES
      ========================= */}

      <section className="dashboard-grid">

        {/* =========================
            PROJETS RÉCENTS
        ========================= */}

        <div className="dashboard-panel projects-panel">

          <div className="panel-header">

            <div>

              <p className="panel-eyebrow">
                SUIVI
              </p>

              <h2>
                Projets récents
              </h2>

            </div>

            <button className="panel-link">
              Voir tous
            </button>

          </div>


          <div className="projects-list">

            {projetsRecents.length === 0 ? (

              <div className="empty-state">

                <div className="empty-icon">
                  ▦
                </div>

                <strong>
                  Aucun projet
                </strong>

                <p>
                  Aucun projet n'est actuellement
                  enregistré.
                </p>

              </div>

            ) : (

              projetsRecents.map(
                (projet, index) => {

                  const progression = Math.min(
                    100,
                    Math.max(
                      0,
                      Number(
                        projet.progression || 0
                      )
                    )
                  );

                  const initials = projet.nom
                    ? projet.nom
                        .split(" ")
                        .slice(0, 2)
                        .map(
                          (word) => word[0]
                        )
                        .join("")
                        .toUpperCase()
                    : "PR";

                  return (
                    <div
                      className="project-row"
                      key={
                        projet.numero_projet ||
                        index
                      }
                    >

                      {/* INFORMATIONS */}

                      <div className="project-info">

                        <div className="project-avatar">
                          {initials}
                        </div>

                        <div className="project-details">

                          <h3>
                            {projet.nom ||
                              "Projet sans nom"}
                          </h3>

                          <p>
                            {projet.numero_projet ||
                              "N/A"}

                            {projet.localisation
                              ? ` · ${projet.localisation}`
                              : ""}
                          </p>

                        </div>

                      </div>


                      {/* PROGRESSION */}

                      <div className="project-progress">

                        <div className="progress-info">

                          <span>
                            Progression
                          </span>

                          <strong>
                            {progression}%
                          </strong>

                        </div>

                        <div className="progress-bar">

                          <div
                            className="progress-fill"
                            style={{
                              width: `${progression}%`,
                            }}
                          />

                        </div>

                      </div>


                      {/* STATUT */}

                      <span className="project-status">
                        {projet.statut ||
                          "Non défini"}
                      </span>

                    </div>
                  );
                }
              )

            )}

          </div>

        </div>


        {/* =========================
            ALERTES
        ========================= */}

        <div className="dashboard-panel alerts-panel">

          <div className="panel-header">

            <div>

              <p className="panel-eyebrow">
                SURVEILLANCE
              </p>

              <h2>
                Alertes
              </h2>

            </div>

            <span className="alert-count">
              {alertesStock}
            </span>

          </div>


          <div className="alerts-list">

            {alertesStock > 0 ? (

              <div className="alert-item">

                <div className="alert-icon warning">
                  !
                </div>

                <div className="alert-content">

                  <strong>
                    Stock faible
                  </strong>

                  <p>
                    {alertesStock} matériau
                    {alertesStock > 1
                      ? "x sont"
                      : " est"}{" "}
                    sous le niveau minimum.
                  </p>

                  <span>
                    Vérification recommandée
                  </span>

                </div>

              </div>

            ) : (

              <div className="alert-item">

                <div className="alert-icon success">
                  ✓
                </div>

                <div className="alert-content">

                  <strong>
                    Aucun problème
                  </strong>

                  <p>
                    Aucun matériau n'est
                    actuellement sous le
                    stock minimum.
                  </p>

                  <span>
                    Stock normal
                  </span>

                </div>

              </div>

            )}

          </div>

        </div>

      </section>


      {/* =========================
          SECTION BAS
      ========================= */}

      <section className="dashboard-bottom">

        {/* =========================
            FINANCES
        ========================= */}

        <div className="dashboard-panel activity-panel">

          <div className="panel-header">

            <div>

              <p className="panel-eyebrow">
                FINANCES
              </p>

              <h2>
                Situation financière
              </h2>

            </div>

          </div>


          <div className="financial-summary">

            {/* DÉPENSES */}

            <div className="financial-item">

              <div className="financial-icon expense-icon">
                DH
              </div>

              <div className="financial-content">

                <span>
                  Dépenses enregistrées
                </span>

                <strong>
                  {totalDepenses.toLocaleString(
                    "fr-FR",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}{" "}
                  DH
                </strong>

              </div>

            </div>


            {/* BUDGET */}

            <div className="financial-item">

              <div className="financial-icon budget-financial-icon">
                ◈
              </div>

              <div className="financial-content">

                <span>
                  Budget initial
                </span>

                <strong>
                  {budgetInitial.toLocaleString(
                    "fr-FR",
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}{" "}
                  DH
                </strong>

              </div>

            </div>


            {/* UTILISATION */}

            <div className="financial-item">

              <div className="financial-icon percentage-icon">
                %
              </div>

              <div className="financial-content">

                <span>
                  Taux d'utilisation
                </span>

                <strong>
                  {budgetUtilise}%
                </strong>

              </div>

            </div>

          </div>

        </div>


        {/* =========================
            ACCÈS RAPIDE
        ========================= */}

        <div className="dashboard-panel quick-panel">

          <p className="panel-eyebrow">
            ACCÈS RAPIDE
          </p>

          <h2>
            Actions rapides
          </h2>

          <div className="quick-actions">

            <button>
              <span>＋</span>
              Nouveau projet
            </button>

            <button>
              <span>＋</span>
              Ajouter un achat
            </button>

            <button>
              <span>⚙</span>
              Déclarer une maintenance
            </button>

            <button>
              <span>▤</span>
              Ajouter un rapport
            </button>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;