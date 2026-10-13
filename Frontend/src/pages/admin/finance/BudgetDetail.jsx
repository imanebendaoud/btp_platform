import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getBudget } from "../../../services/financeService";
import "./BudgetDetail.css";

function BudgetDetail() {
  const { id } = useParams();

  const [budget, setBudget] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBudget();
  }, [id]);

  const loadBudget = async () => {
    try {
      setLoading(true);

      const data = await getBudget(id);

      setBudget(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger le budget.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="budget-detail-page">
        Chargement...
      </div>
    );
  }

  if (error || !budget) {
    return (
      <div className="budget-detail-page">
        <div className="budget-detail-error">
          {error || "Budget introuvable."}
        </div>

        <Link
          to="/admin/finance/budgets"
          className="back-button"
        >
          ← Retour aux budgets
        </Link>
      </div>
    );
  }

  const amount = (value) =>
    Number(value || 0).toLocaleString("fr-FR");

  return (
    <div className="budget-detail-page">

      <div className="budget-detail-header">

        <div>
          <h1>Détail du budget</h1>
          <p>
            Budget #{budget.id_budget}
          </p>
        </div>

        <Link
          to="/admin/finance/budgets"
          className="back-button"
        >
          ← Retour
        </Link>

      </div>

      <div className="budget-project-card">

        <span>Projet</span>

        <strong>
          Projet #{budget.id_projet}
        </strong>

      </div>

      <div className="budget-detail-grid">

        <div className="budget-detail-card">
          <span>Main d'œuvre</span>
          <strong>
            {amount(budget.montant_main_oeuvre)} DH
          </strong>
        </div>

        <div className="budget-detail-card">
          <span>Matériaux</span>
          <strong>
            {amount(budget.montant_materiaux)} DH
          </strong>
        </div>

        <div className="budget-detail-card">
          <span>Équipements</span>
          <strong>
            {amount(budget.montant_equipements)} DH
          </strong>
        </div>

        <div className="budget-detail-card">
          <span>Sous-traitance</span>
          <strong>
            {amount(budget.montant_sous_traitance)} DH
          </strong>
        </div>

        <div className="budget-detail-card">
          <span>Transport</span>
          <strong>
            {amount(budget.montant_transport)} DH
          </strong>
        </div>

        <div className="budget-detail-card">
          <span>Divers</span>
          <strong>
            {amount(budget.montant_divers)} DH
          </strong>
        </div>

      </div>

      <div className="budget-total-card">

        <span>Montant total du budget</span>

        <strong>
          {amount(budget.montant_total)} DH
        </strong>

      </div>

    </div>
  );
}

export default BudgetDetail;