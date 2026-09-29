import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDashboardSummary } from "../../services/dashboardService";
import "./Dashboard.css";

function Dashboard() {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);

        const result = await getDashboardSummary();

        setData(result);
        setError("");
      } catch (err) {
        console.error(
          "Erreur chargement dashboard :",
          err
        );

        setError(
          "Impossible de charger les données du tableau de bord."
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const formatMoney = (value) => {
    return new Intl.NumberFormat("fr-MA", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value || 0);
  };

  const getStatusLabel = (status) => {
    if (!status) {
      return "Non défini";
    }

    switch (String(status).toUpperCase()) {
      case "EN_COURS":
        return "En cours";

      case "TERMINE":
      case "TERMINÉ":
        return "Terminé";

      case "PLANIFIE":
      case "PLANIFIÉ":
        return "Planifié";

      case "SUSPENDU":
        return "Suspendu";

      default:
        return status;
    }
  };

  const getInitials = () => {
    const first = user?.prenom || "";
    const last = user?.nom || "";

    return (
      `${first.charAt(0)}${last.charAt(0)}`
        .trim()
        .toUpperCase() || "A"
    );
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>

        <p>
          Chargement du tableau de bord...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard-error">

        <div className="error-icon">
          !
        </div>

        <h2>
          Une erreur est survenue
        </h2>

        <p>
          {error}
        </p>

        <button
          onClick={() => window.location.reload()}
        >
          Réessayer
        </button>

      </div>
    );
  }

  return (
    <div className="admin-dashboard-content">

      {/* =====================================================
          WELCOME
      ===================================================== */}

      <section className="admin-welcome">

        <div>

          <p className="admin-welcome-label">
            TABLEAU DE BORD
          </p>

          <h1>
            Bonjour, {user?.prenom || "Administrateur"}
          </h1>

          <p>
            Voici un aperçu de l'activité de votre plateforme BTP.
          </p>

        </div>

        <div className="admin-date">
          <span>
            ▣
          </span>

          {new Date().toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </div>

      </section>


      {/* =====================================================
          STATISTIQUES
      ===================================================== */}

      <section className="admin-stats-grid">

        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ▣
          </div>

          <div>

            <span>
              Total projets
            </span>

            <strong>
              {data?.projets ?? 0}
            </strong>

            <small>
              Projets enregistrés
            </small>

          </div>

        </div>


        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ♙
          </div>

          <div>

            <span>
              Employés
            </span>

            <strong>
              {data?.employes ?? 0}
            </strong>

            <small>
              Employés enregistrés
            </small>

          </div>

        </div>


        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ▤
          </div>

          <div>

            <span>
              Matériaux
            </span>

            <strong>
              {data?.materiaux ?? 0}
            </strong>

            <small>
              Références en stock
            </small>

          </div>

        </div>


        <div className="admin-stat-card">

          <div className="admin-stat-icon">
            ⚙
          </div>

          <div>

            <span>
              Équipements
            </span>

            <strong>
              {data?.equipements ?? 0}
            </strong>

            <small>
              Équipements enregistrés
            </small>

          </div>

        </div>

      </section>


      {/* =====================================================
          CONTENU PRINCIPAL
      ===================================================== */}

      <section className="admin-main-grid">

        {/* PROJETS */}

        <div className="admin-card">

          <div className="admin-card-header">

            <div>

              <h2>
                Projets récents
              </h2>

              <p>
                Derniers projets enregistrés dans la plateforme
              </p>

            </div>

          </div>


          <div className="admin-project-list">

            {data?.projets_recents?.length > 0 ? (
              data.projets_recents.map((project) => (
                <div
                  className="admin-project-item"
                  key={project.numero_projet}
                >

                  <div className="admin-project-icon">
                    P
                  </div>

                  <div className="admin-project-info">

                    <strong>
                      {project.nom}
                    </strong>

                    <span>
                      {project.numero_projet}
                      {project.localisation
                        ? ` · ${project.localisation}`
                        : ""}
                    </span>

                  </div>

                  <span className="admin-project-status">
                    {getStatusLabel(project.statut)}
                  </span>

                </div>
              ))
            ) : (
              <div className="admin-empty">
                Aucun projet enregistré.
              </div>
            )}

          </div>

        </div>


        {/* FINANCE */}

        <div className="admin-card">

          <div className="admin-card-header">

            <div>

              <h2>
                Situation financière
              </h2>

              <p>
                Vue globale du budget
              </p>

            </div>

          </div>


          <div className="financial-content">

            <div className="financial-row">

              <span>
                Budget initial
              </span>

              <strong>
                {formatMoney(data?.budget_initial)} DH
              </strong>

            </div>


            <div className="financial-row">

              <span>
                Total dépenses
              </span>

              <strong>
                {formatMoney(data?.total_depenses)} DH
              </strong>

            </div>


            <div className="financial-progress">

              <div className="financial-progress-header">

                <span>
                  Budget utilisé
                </span>

                <strong>
                  {data?.budget_utilise ?? 0}%
                </strong>

              </div>

              <div className="financial-progress-bar">

                <div
                  style={{
                    width: `${Math.min(
                      data?.budget_utilise ?? 0,
                      100
                    )}%`,
                  }}
                ></div>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          ALERTES
      ===================================================== */}

      <section className="admin-bottom-grid">

        <div className="admin-card">

          <div className="admin-card-header">

            <div>

              <h2>
                Alertes & Attention
              </h2>

              <p>
                Éléments nécessitant votre attention
              </p>

            </div>

            <span className="admin-alert-number">
              {data?.alertes_stock ?? 0}
            </span>

          </div>


          <div className="admin-alert-content">

            {data?.alertes_stock > 0 ? (
              <div className="admin-alert-item warning">
                <span className="admin-alert-icon">
                  !
                </span>

                <div>
                  <strong>
                    Stock faible
                  </strong>

                  <p>
                    {data.alertes_stock} matériau(x)
                    ont atteint leur seuil minimum.
                  </p>
                </div>
              </div>
            ) : (
              <div className="admin-alert-item success">

                <span className="admin-alert-icon">
                  ✓
                </span>

                <div>

                  <strong>
                    Aucun stock critique
                  </strong>

                  <p>
                    Aucun matériau n'est actuellement
                    sous son seuil minimum.
                  </p>

                </div>

              </div>
            )}

          </div>

        </div>


        {/* RESUME */}

        <div className="admin-card">

          <div className="admin-card-header">

            <div>

              <h2>
                Résumé de la plateforme
              </h2>

              <p>
                Vue globale des ressources
              </p>

            </div>

          </div>


          <div className="admin-summary-list">

            <div>
              <span>
                Projets
              </span>

              <strong>
                {data?.projets ?? 0}
              </strong>
            </div>

            <div>
              <span>
                Employés
              </span>

              <strong>
                {data?.employes ?? 0}
              </strong>
            </div>

            <div>
              <span>
                Matériaux
              </span>

              <strong>
                {data?.materiaux ?? 0}
              </strong>
            </div>

            <div>
              <span>
                Équipements
              </span>

              <strong>
                {data?.equipements ?? 0}
              </strong>
            </div>

          </div>

        </div>

      </section>


      {/* =====================================================
          AI
      ===================================================== */}

      <section className="admin-ai-card">

        <div className="admin-ai-icon">
          ✦
        </div>

        <div>

          <span>
            INTELLIGENCE ARTIFICIELLE
          </span>

          <h2>
            Assistant intelligent BTP
          </h2>

          <p>
            Analysez les données de vos chantiers et
            préparez progressivement l'intégration
            de fonctionnalités IA.
          </p>

        </div>

        <button>
          Ouvrir l'assistant →
        </button>

      </section>

    </div>
  );
}

export default Dashboard;