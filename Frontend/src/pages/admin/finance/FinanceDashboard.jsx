import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getBudgets,
  getDepenses,
} from "../../../services/financeService";
import "./FinanceDashboard.css";

function FinanceDashboard() {
  const [budgets, setBudgets] = useState([]);
  const [depenses, setDepenses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadFinanceData();
  }, []);

  const loadFinanceData = async () => {
    try {
      setLoading(true);
      setError("");

      const [budgetsData, depensesData] = await Promise.all([
        getBudgets(),
        getDepenses(),
      ]);

      setBudgets(
        Array.isArray(budgetsData)
          ? budgetsData
          : budgetsData.results || []
      );

      setDepenses(
        Array.isArray(depensesData)
          ? depensesData
          : depensesData.results || []
      );
    } catch (err) {
      console.error(err);
      setError(
        "Impossible de charger les données financières."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     CALCULS GLOBAUX
     ===================================================== */

  const totalBudget = budgets.reduce(
    (sum, budget) =>
      sum + Number(budget.montant_total || 0),
    0
  );

  const totalDepenses = depenses.reduce(
    (sum, depense) =>
      sum + Number(depense.montant || 0),
    0
  );

  const budgetRestant = totalBudget - totalDepenses;

  /* =====================================================
     CONSTRUCTION DE LA SITUATION PAR PROJET
     ===================================================== */

  const projectMap = {};

  // On commence par les budgets.
  budgets.forEach((budget) => {
    const projectId =
      budget.id_projet?.id_projet ||
      budget.id_projet;

    if (!projectId) return;

    projectMap[projectId] = {
      id_projet: projectId,
      budget: Number(budget.montant_total || 0),
      depenses: 0,
    };
  });

  // On ajoute les dépenses correspondant à chaque projet.
  depenses.forEach((depense) => {
    const projectId =
      depense.id_projet?.id_projet ||
      depense.id_projet;

    if (!projectId) return;

    if (!projectMap[projectId]) {
      projectMap[projectId] = {
        id_projet: projectId,
        budget: 0,
        depenses: 0,
      };
    }

    projectMap[projectId].depenses += Number(
      depense.montant || 0
    );
  });

  const projectsFinance = Object.values(projectMap).map(
    (project) => {
      const restant =
        project.budget - project.depenses;

      const taux =
        project.budget > 0
          ? (project.depenses / project.budget) * 100
          : 0;

      return {
        ...project,
        restant,
        taux: Math.min(Math.max(taux, 0), 100),
      };
    }
  );

  // Trier les projets par ID
  projectsFinance.sort(
    (a, b) => Number(a.id_projet) - Number(b.id_projet)
  );

  /* =====================================================
     FORMATAGE
     ===================================================== */

  const formatMoney = (value) => {
    return `${Number(value || 0).toLocaleString(
      "fr-FR"
    )} DH`;
  };

  /* =====================================================
     LOADING
     ===================================================== */

  if (loading) {
    return (
      <div className="finance-page">
        <div className="finance-loading">
          <div className="finance-loader"></div>

          <span>
            Chargement des données financières...
          </span>
        </div>
      </div>
    );
  }

  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <div className="finance-page">

      {/* =================================================
          HEADER
          ================================================= */}

      <div className="finance-header">

        <div className="finance-title-area">

          <div className="finance-title-icon">
            €
          </div>

          <div>

            <div className="finance-breadcrumb">
              Administration
              <span>/</span>
              Finance
            </div>

            <h1>Gestion financière</h1>

            <p>
              Suivez les budgets et les dépenses
              de vos projets.
            </p>

          </div>

        </div>

        <div className="finance-status">

          <span className="finance-status-dot"></span>

          Données à jour

        </div>

      </div>

      {/* =================================================
          ERROR
          ================================================= */}

      {error && (
        <div className="finance-error">

          <div className="finance-error-icon">
            !
          </div>

          <div>
            <strong>
              Erreur de chargement
            </strong>

            <p>{error}</p>
          </div>

        </div>
      )}

      {/* =================================================
          STATISTIQUES
          ================================================= */}

      <div className="finance-stats">

        {/* Budget cumulé */}

        <div className="finance-stat-card budget-card">

          <div className="finance-stat-top">

            <div className="finance-stat-icon budget-icon">
              €
            </div>

            <span className="finance-stat-label">
              BUDGET CUMULÉ
            </span>

          </div>

          <div className="finance-stat-value">
            {formatMoney(totalBudget)}
          </div>

          <div className="finance-stat-footer">

            <span className="stat-indicator positive">
              ↑
            </span>

            <span>
              Total des budgets des projets
            </span>

          </div>

        </div>

        {/* Dépenses cumulées */}

        <div className="finance-stat-card expense-card">

          <div className="finance-stat-top">

            <div className="finance-stat-icon expense-icon">
              ↓
            </div>

            <span className="finance-stat-label">
              DÉPENSES CUMULÉES
            </span>

          </div>

          <div className="finance-stat-value">
            {formatMoney(totalDepenses)}
          </div>

          <div className="finance-stat-footer">

            <span className="stat-indicator expense">
              ↓
            </span>

            <span>
              Total dépensé sur les projets
            </span>

          </div>

        </div>

        {/* Disponible */}

        <div className="finance-stat-card remaining-card">

          <div className="finance-stat-top">

            <div className="finance-stat-icon remaining-icon">
              ✓
            </div>

            <span className="finance-stat-label">
              DISPONIBLE CUMULÉ
            </span>

          </div>

          <div className="finance-stat-value">
            {formatMoney(budgetRestant)}
          </div>

          <div className="finance-stat-footer">

            <span className="stat-indicator positive">
              ✓
            </span>

            <span>
              Budget restant cumulé
            </span>

          </div>

        </div>

        {/* Projets */}

        <div className="finance-stat-card projects-card">

          <div className="finance-stat-top">

            <div className="finance-stat-icon projects-icon">
              ▦
            </div>

            <span className="finance-stat-label">
              PROJETS BUDGÉTÉS
            </span>

          </div>

          <div className="finance-stat-value">
            {budgets.length}
          </div>

          <div className="finance-stat-footer">

            <span className="stat-indicator neutral">
              #
            </span>

            <span>
              Projets possédant un budget
            </span>

          </div>

        </div>

      </div>

      {/* =================================================
          SITUATION PAR PROJET
          ================================================= */}

      <div className="finance-projects-section">

        <div className="finance-projects-header">

          <div>

            <h2>
              Situation des projets
            </h2>

            <p>
              Suivez le budget, les dépenses et le
              montant restant pour chaque projet.
            </p>

          </div>

          <div className="finance-project-count">
            {projectsFinance.length} projet
            {projectsFinance.length !== 1 ? "s" : ""}
          </div>

        </div>

        {projectsFinance.length === 0 ? (

          <div className="finance-empty-projects">

            <div className="finance-empty-icon">
              €
            </div>

            <h3>
              Aucun projet budgété
            </h3>

            <p>
              Aucun budget n'est actuellement
              enregistré pour les projets.
            </p>

          </div>

        ) : (

          <div className="finance-project-list">

            {projectsFinance.map((project) => (

              <div
                className="finance-project-card"
                key={project.id_projet}
              >

                {/* Partie gauche */}

                <div className="finance-project-info">

                  <div className="finance-project-icon">
                    €
                  </div>

                  <div>

                    <span className="finance-project-label">
                      PROJET
                    </span>

                    <h3>
                      Projet #{project.id_projet}
                    </h3>

                  </div>

                </div>

                {/* Budget */}

                <div className="finance-project-column">

                  <span>
                    Budget
                  </span>

                  <strong>
                    {formatMoney(project.budget)}
                  </strong>

                </div>

                {/* Dépenses */}

                <div className="finance-project-column">

                  <span>
                    Dépenses
                  </span>

                  <strong className="expense-text">
                    {formatMoney(project.depenses)}
                  </strong>

                </div>

                {/* Restant */}

                <div className="finance-project-column">

                  <span>
                    Restant
                  </span>

                  <strong
                    className={
                      project.restant < 0
                        ? "danger-text"
                        : "remaining-text"
                    }
                  >
                    {formatMoney(project.restant)}
                  </strong>

                </div>

                {/* Pourcentage */}

                <div className="finance-project-progress">

                  <div className="finance-project-progress-header">

                    <span>
                      Utilisation
                    </span>

                    <strong>
                      {project.taux.toFixed(1)}%
                    </strong>

                  </div>

                  <div className="finance-project-progress-bar">

                    <div
                      className={
                        project.taux >= 90
                          ? "finance-project-progress-fill danger"
                          : project.taux >= 70
                          ? "finance-project-progress-fill warning"
                          : "finance-project-progress-fill"
                      }
                      style={{
                        width: `${project.taux}%`,
                      }}
                    ></div>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

      {/* =================================================
          ACCÈS AUX MODULES
          ================================================= */}

      <div className="finance-section-title">

        <div>

          <h2>
            Gestion financière
          </h2>

          <p>
            Accédez aux informations détaillées.
          </p>

        </div>

      </div>

      <div className="finance-sections">

        {/* Budgets */}

        <div className="finance-section-card">

          <div className="finance-module-icon budget-module">
            €
          </div>

          <div className="finance-section-main">

            <div className="finance-section-header">

              <div>

                <h2>
                  Budgets
                </h2>

                <p>
                  Consultez les budgets attribués
                  aux différents projets.
                </p>

              </div>

              <span className="finance-count">
                {budgets.length}
              </span>

            </div>

            <div className="finance-section-bottom">

              <span>
                <strong>
                  {budgets.length}
                </strong>{" "}
                budget
                {budgets.length !== 1 ? "s" : ""} enregistré
                {budgets.length !== 1 ? "s" : ""}
              </span>

              <Link
                to="/admin/finance/budgets"
                className="finance-view-button"
              >
                Consulter
                <span>→</span>
              </Link>

            </div>

          </div>

        </div>

        {/* Dépenses */}

        <div className="finance-section-card">

          <div className="finance-module-icon expense-module">
            ↓
          </div>

          <div className="finance-section-main">

            <div className="finance-section-header">

              <div>

                <h2>
                  Dépenses
                </h2>

                <p>
                  Consultez l'historique des dépenses
                  enregistrées.
                </p>

              </div>

              <span className="finance-count">
                {depenses.length}
              </span>

            </div>

            <div className="finance-section-bottom">

              <span>
                <strong>
                  {depenses.length}
                </strong>{" "}
                dépense
                {depenses.length !== 1 ? "s" : ""} enregistrée
                {depenses.length !== 1 ? "s" : ""}
              </span>

              <Link
                to="/admin/finance/depenses"
                className="finance-view-button"
              >
                Consulter
                <span>→</span>
              </Link>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default FinanceDashboard;