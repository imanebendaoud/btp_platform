
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Wallet,
  ReceiptText,
  PiggyBank,
  Clock3,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  ChartNoAxesCombined,
  FileText,
  CircleAlert,
  CalendarDays,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import "./FinanceDashboard.css";

// À adapter uniquement si ton backend utilise une autre adresse.
const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

const ENDPOINTS = {
  budgets: `${API_BASE_URL}/finance/budgets/`,
  depenses: `${API_BASE_URL}/finance/depenses/`,
  demandes: `${API_BASE_URL}/finance/demandes-financement/`,
};

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
};

const toNumber = (value) => {
  const number = Number(value ?? 0);
  return Number.isFinite(number) ? number : 0;
};

const formatMoney = (value) =>
  new Intl.NumberFormat("fr-MA", {
    style: "currency",
    currency: "MAD",
    maximumFractionDigits: 2,
  })
    .format(toNumber(value))
    .replace("MAD", "DH");

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getProjectId = (item) => {
  const project = item?.id_projet;

  if (project && typeof project === "object") {
    return project.id_projet ?? project.id ?? null;
  }

  return project ?? null;
};

const getProjectName = (item) => {
  const project = item?.id_projet;

  if (project && typeof project === "object") {
    return (
      project.nom ||
      project.nom_projet ||
      project.numero_projet ||
      `Chantier #${project.id_projet ?? project.id ?? ""}`
    );
  }

  return project ? `Chantier #${project}` : "Chantier non précisé";
};

const getExpenseCategory = (expense) =>
  expense?.categorie || "Autre";

const getDemandStatus = (status) => {
  const normalized = String(status || "").toUpperCase();

  if (normalized === "EN_ATTENTE") return "En attente";
  if (normalized === "VALIDEE" || normalized === "VALIDÉE") {
    return "Validée";
  }
  if (normalized === "REFUSEE" || normalized === "REFUSÉE") {
    return "Refusée";
  }

  return status || "Non défini";
};

function FinanceDashboard() {
  const navigate = useNavigate();
  const { user, accessToken, loading: authLoading } = useAuth();

  const [budgets, setBudgets] = useState([]);
  const [depenses, setDepenses] = useState([]);
  const [demandes, setDemandes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadDashboard = useCallback(
    async ({ silent = false } = {}) => {
      if (!accessToken) return;

      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      const fetchEndpoint = async (url) => {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          const detail = await response.text().catch(() => "");
          throw new Error(
            `Erreur ${response.status} lors du chargement des données. ${
              detail && response.status >= 500 ? "" : ""
            }`
          );
        }

        return response.json();
      };

      try {
        const [budgetsData, depensesData, demandesData] =
          await Promise.all([
            fetchEndpoint(ENDPOINTS.budgets),
            fetchEndpoint(ENDPOINTS.depenses),
            fetchEndpoint(ENDPOINTS.demandes),
          ]);

        setBudgets(normalizeList(budgetsData));
        setDepenses(normalizeList(depensesData));
        setDemandes(normalizeList(demandesData));
        setLastUpdated(new Date());
      } catch (err) {
        console.error("Erreur dashboard financier :", err);
        setError(
          err?.message ||
            "Impossible de charger les données financières."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    if (authLoading) return;

    if (!accessToken) {
      setLoading(false);
      setError("Session introuvable. Veuillez vous reconnecter.");
      return;
    }

    loadDashboard();
  }, [authLoading, accessToken, loadDashboard]);

  const stats = useMemo(() => {
    const totalBudget = budgets.reduce(
      (sum, budget) => sum + toNumber(budget.montant_total),
      0
    );

    const totalDepenses = depenses.reduce(
      (sum, depense) => sum + toNumber(depense.montant),
      0
    );

    const solde = totalBudget - totalDepenses;

    const projects = new Set(
      budgets
        .map(getProjectId)
        .filter((id) => id !== null && id !== undefined)
        .map(String)
    );

    const pendingRequests = demandes.filter(
      (demand) =>
        String(demand.statut || "").toUpperCase() === "EN_ATTENTE"
    ).length;

    return {
      totalBudget,
      totalDepenses,
      solde,
      projectsCount: projects.size || budgets.length,
      pendingRequests,
      consumption:
        totalBudget > 0
          ? Math.round((totalDepenses / totalBudget) * 100)
          : 0,
    };
  }, [budgets, depenses, demandes]);

  const categoryData = useMemo(() => {
    const totals = {};

    depenses.forEach((expense) => {
      const category = getExpenseCategory(expense);
      totals[category] =
        (totals[category] || 0) + toNumber(expense.montant);
    });

    return Object.entries(totals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  }, [depenses]);

  const maxCategoryAmount = Math.max(
    ...categoryData.map((item) => item.amount),
    1
  );

  const recentExpenses = useMemo(() => {
    return [...depenses]
      .sort((a, b) => {
        const dateA = new Date(a.date_depense || 0).getTime();
        const dateB = new Date(b.date_depense || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [depenses]);

  const pendingDemands = useMemo(() => {
    return demandes
      .filter(
        (demand) =>
          String(demand.statut || "").toUpperCase() === "EN_ATTENTE"
      )
      .sort((a, b) => {
        const dateA = new Date(a.date_demande || 0).getTime();
        const dateB = new Date(b.date_demande || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }, [demandes]);

  const fullName = [user?.prenom, user?.nom]
    .filter(Boolean)
    .join(" ");

  const firstName = user?.prenom || "Responsable";

  if (authLoading) {
    return (
      <div className="finance-page">
        <div className="finance-loading">
          <span className="finance-spinner" />
          <p>Vérification de la session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="finance-page">
      <header className="finance-page-header">
        <div className="finance-heading">
          <span className="finance-eyebrow">
            ESPACE FINANCE
          </span>
          <h1>Tableau de bord financier</h1>
          <p>
            Bonjour {firstName}, voici la situation financière de
            vos chantiers.
          </p>
        </div>

        <div className="finance-header-actions">
          <div className="finance-update-info">
            <CalendarDays size={15} />
            <span>
              {lastUpdated
                ? `Actualisé à ${lastUpdated.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}`
                : "Vue financière"}
            </span>
          </div>

          <button
            type="button"
            className="finance-refresh-button"
            onClick={() => loadDashboard({ silent: true })}
            disabled={loading || refreshing}
          >
            <RefreshCw
              size={15}
              className={refreshing ? "finance-rotate" : ""}
            />
            <span>Actualiser</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="finance-alert" role="alert">
          <CircleAlert size={19} />
          <div>
            <strong>Chargement incomplet</strong>
            <p>{error}</p>
            <small>
              Vérifie que les routes API finance sont actives et que
              ta session est valide.
            </small>
          </div>
          <button
            type="button"
            onClick={() => loadDashboard()}
            className="finance-alert-retry"
          >
            Réessayer
          </button>
        </div>
      )}

      <section className="finance-stats-grid">
        <article className="finance-stat-card">
          <div className="finance-stat-top">
            <div className="finance-stat-icon finance-icon-blue">
              <Wallet size={21} />
            </div>
            <span className="finance-stat-caption">
              Tous les budgets
            </span>
          </div>
          <p className="finance-stat-label">Budget total</p>
          <h2>
            {loading ? "…" : formatMoney(stats.totalBudget)}
          </h2>
          <div className="finance-stat-foot">
            <Building2 size={14} />
            {stats.projectsCount} chantier(s) budgété(s)
          </div>
        </article>

        <article className="finance-stat-card">
          <div className="finance-stat-top">
            <div className="finance-stat-icon finance-icon-orange">
              <ReceiptText size={21} />
            </div>
            <span className="finance-stat-caption">
              Dépenses enregistrées
            </span>
          </div>
          <p className="finance-stat-label">Total des dépenses</p>
          <h2>
            {loading ? "…" : formatMoney(stats.totalDepenses)}
          </h2>
          <div className="finance-stat-foot">
            <TrendingUp size={14} />
            {stats.consumption}% du budget total
          </div>
        </article>

        <article className="finance-stat-card">
          <div className="finance-stat-top">
            <div className="finance-stat-icon finance-icon-green">
              <PiggyBank size={21} />
            </div>
            <span className="finance-stat-caption">
              Budget moins dépenses
            </span>
          </div>
          <p className="finance-stat-label">Solde théorique</p>
          <h2 className={stats.solde < 0 ? "finance-negative" : ""}>
            {loading ? "…" : formatMoney(stats.solde)}
          </h2>
          <div className="finance-stat-foot">
            {stats.solde < 0 ? (
              <ArrowDownRight size={14} />
            ) : (
              <ArrowUpRight size={14} />
            )}
            {stats.solde < 0
              ? "Dépassement du budget"
              : "Reste théorique disponible"}
          </div>
        </article>

        <article className="finance-stat-card">
          <div className="finance-stat-top">
            <div className="finance-stat-icon finance-icon-purple">
              <Clock3 size={21} />
            </div>
            <span className="finance-stat-caption">
              À traiter
            </span>
          </div>
          <p className="finance-stat-label">
            Demandes en attente
          </p>
          <h2>{loading ? "…" : stats.pendingRequests}</h2>
          <button
            type="button"
            className="finance-inline-link"
            onClick={() => navigate("/finance/demandes")}
          >
            Consulter les demandes <ChevronRight size={14} />
          </button>
        </article>
      </section>

      <section className="finance-main-grid">
        <article className="finance-panel finance-chart-panel">
          <div className="finance-panel-header">
            <div>
              <h2>Dépenses par catégorie</h2>
              <p>Répartition à partir des dépenses enregistrées</p>
            </div>
            <span className="finance-panel-icon">
              <ChartNoAxesCombined size={19} />
            </span>
          </div>

          {loading ? (
            <div className="finance-empty">
              Chargement des catégories…
            </div>
          ) : categoryData.length === 0 ? (
            <div className="finance-empty">
              <ReceiptText size={28} />
              <strong>Aucune dépense disponible</strong>
              <span>
                Les catégories apparaîtront dès que des dépenses
                seront enregistrées.
              </span>
            </div>
          ) : (
            <div className="finance-category-list">
              {categoryData.map((item) => (
                <div className="finance-category-row" key={item.category}>
                  <div className="finance-category-label">
                    <span>{item.category}</span>
                    <strong>{formatMoney(item.amount)}</strong>
                  </div>
                  <div
                    className="finance-category-track"
                    aria-label={`${item.category}: ${formatMoney(item.amount)}`}
                  >
                    <div
                      className="finance-category-fill"
                      style={{
                        width: `${Math.max(
                          3,
                          (item.amount / maxCategoryAmount) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="finance-panel-link"
            onClick={() => navigate("/finance/depenses")}
          >
            Voir toutes les dépenses <ChevronRight size={15} />
          </button>
        </article>

        <article className="finance-panel finance-budget-panel">
          <div className="finance-panel-header">
            <div>
              <h2>Utilisation du budget</h2>
              <p>Dépenses comparées au budget total</p>
            </div>
            <span className="finance-panel-icon">
              <TrendingUp size={19} />
            </span>
          </div>

          <div className="finance-budget-summary">
            <strong>{loading ? "…" : `${stats.consumption}%`}</strong>
            <span>consommé</span>
          </div>

          <div
            className="finance-budget-track"
            role="progressbar"
            aria-valuenow={Math.min(stats.consumption, 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Pourcentage du budget consommé"
          >
            <div
              className={`finance-budget-fill ${
                stats.consumption > 100 ? "over-budget" : ""
              }`}
              style={{
                width: `${Math.min(stats.consumption, 100)}%`,
              }}
            />
          </div>

          <div className="finance-budget-legend">
            <div>
              <span className="finance-legend-dot finance-dot-blue" />
              <span>Budget total</span>
              <strong>
                {loading ? "…" : formatMoney(stats.totalBudget)}
              </strong>
            </div>
            <div>
              <span className="finance-legend-dot finance-dot-orange" />
              <span>Dépenses</span>
              <strong>
                {loading ? "…" : formatMoney(stats.totalDepenses)}
              </strong>
            </div>
            <div>
              <span className="finance-legend-dot finance-dot-green" />
              <span>Solde théorique</span>
              <strong className={stats.solde < 0 ? "finance-negative" : ""}>
                {loading ? "…" : formatMoney(stats.solde)}
              </strong>
            </div>
          </div>

          <div className="finance-budget-note">
            <CircleAlert size={16} />
            <p>
              Le solde est calculé à partir des budgets et dépenses
              enregistrés. Il ne représente pas nécessairement la
              trésorerie réellement disponible.
            </p>
          </div>
        </article>
      </section>

      <section className="finance-main-grid finance-bottom-grid">
        <article className="finance-panel">
          <div className="finance-panel-header">
            <div>
              <h2>Dernières dépenses</h2>
              <p>Les 5 dépenses les plus récentes</p>
            </div>
            <button
              type="button"
              className="finance-text-button"
              onClick={() => navigate("/finance/depenses")}
            >
              Tout voir <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="finance-empty">Chargement…</div>
          ) : recentExpenses.length === 0 ? (
            <div className="finance-empty">
              <FileText size={28} />
              <strong>Aucune dépense</strong>
              <span>Aucune dépense n’a été enregistrée.</span>
            </div>
          ) : (
            <div className="finance-table-wrap">
              <table className="finance-table">
                <thead>
                  <tr>
                    <th>Dépense</th>
                    <th>Chantier</th>
                    <th>Date</th>
                    <th className="finance-amount-cell">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {recentExpenses.map((expense) => (
                    <tr key={expense.id_depense}>
                      <td>
                        <div className="finance-expense-name">
                          <span className="finance-table-icon">
                            <ReceiptText size={15} />
                          </span>
                          <div>
                            <strong>{getExpenseCategory(expense)}</strong>
                            <small>
                              {expense.description || "Sans description"}
                            </small>
                          </div>
                        </div>
                      </td>
                      <td>{getProjectName(expense)}</td>
                      <td>{formatDate(expense.date_depense)}</td>
                      <td className="finance-amount-cell">
                        {formatMoney(expense.montant)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="finance-panel">
          <div className="finance-panel-header">
            <div>
              <h2>Demandes de financement</h2>
              <p>Demandes à examiner en priorité</p>
            </div>
            <button
              type="button"
              className="finance-text-button"
              onClick={() => navigate("/finance/demandes")}
            >
              Tout voir <ChevronRight size={14} />
            </button>
          </div>

          {loading ? (
            <div className="finance-empty">Chargement…</div>
          ) : pendingDemands.length === 0 ? (
            <div className="finance-empty">
              <Clock3 size={28} />
              <strong>Aucune demande en attente</strong>
              <span>
                Les nouvelles demandes de financement apparaîtront ici.
              </span>
            </div>
          ) : (
            <div className="finance-demand-list">
              {pendingDemands.map((demand) => (
                <div
                  className="finance-demand-item"
                  key={demand.id_demande}
                >
                  <div className="finance-demand-icon">
                    <FileText size={17} />
                  </div>
                  <div className="finance-demand-content">
                    <strong>
                      {demand.equipement_nom ||
                        demand.id_equipement?.nom ||
                        `Demande #${demand.id_demande}`}
                    </strong>
                    <span>{getProjectName(demand)}</span>
                    <small>{formatDate(demand.date_demande)}</small>
                  </div>
                  <div className="finance-demand-amount">
                    <strong>
                      {formatMoney(demand.montant_demande)}
                    </strong>
                    <span className="finance-status-pending">
                      {getDemandStatus(demand.statut)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="button"
            className="finance-panel-link"
            onClick={() => navigate("/finance/demandes")}
          >
            Examiner les demandes <ChevronRight size={15} />
          </button>
        </article>
      </section>

      <footer className="finance-footer">
        <span>
          <span className="finance-footer-dot" />
          Espace Responsable financier
        </span>
        <span>
          {fullName || "BTP Management"} · Données issues de la plateforme
        </span>
      </footer>
    </div>
  );
}

export default FinanceDashboard;
