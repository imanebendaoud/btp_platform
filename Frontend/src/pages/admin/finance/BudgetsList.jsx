import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBudgets } from "../../../services/financeService";
import "./BudgetsList.css";

function BudgetsList() {
  const [budgets, setBudgets] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    try {
      setLoading(true);

      const data = await getBudgets();

      setBudgets(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les budgets.");
    } finally {
      setLoading(false);
    }
  };

  const filteredBudgets = budgets.filter((budget) => {
    const value = search.toLowerCase();

    return (
      String(budget.id_budget)
        .toLowerCase()
        .includes(value) ||
      String(budget.id_projet)
        .toLowerCase()
        .includes(value)
    );
  });

  if (loading) {
    return (
      <div className="budgets-page">
        Chargement des budgets...
      </div>
    );
  }

  return (
    <div className="budgets-page">

      <div className="budgets-header">

        <div>
          <h1>Budgets</h1>
          <p>
            Consultation des budgets des projets
          </p>
        </div>

        <Link
          to="/admin/finance"
          className="back-button"
        >
          ← Finance
        </Link>

      </div>

      {error && (
        <div className="budgets-error">
          {error}
        </div>
      )}

      <div className="budgets-toolbar">

        <input
          type="text"
          placeholder="Rechercher un budget ou un projet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <span>
          {filteredBudgets.length} budget(s)
        </span>

      </div>

      <div className="budgets-table-container">

        <table className="budgets-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Projet</th>
              <th>Main d'œuvre</th>
              <th>Matériaux</th>
              <th>Équipements</th>
              <th>Sous-traitance</th>
              <th>Transport</th>
              <th>Divers</th>
              <th>Total</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredBudgets.length === 0 ? (
              <tr>
                <td colSpan="10" className="empty-cell">
                  Aucun budget trouvé.
                </td>
              </tr>
            ) : (
              filteredBudgets.map((budget) => (
                <tr key={budget.id_budget}>

                  <td>
                    #{budget.id_budget}
                  </td>

                  <td>
                    Projet #{budget.id_projet}
                  </td>

                  <td>
                    {Number(
                      budget.montant_main_oeuvre || 0
                    ).toLocaleString("fr-FR")} DH
                  </td>

                  <td>
                    {Number(
                      budget.montant_materiaux || 0
                    ).toLocaleString("fr-FR")} DH
                  </td>

                  <td>
                    {Number(
                      budget.montant_equipements || 0
                    ).toLocaleString("fr-FR")} DH
                  </td>

                  <td>
                    {Number(
                      budget.montant_sous_traitance || 0
                    ).toLocaleString("fr-FR")} DH
                  </td>

                  <td>
                    {Number(
                      budget.montant_transport || 0
                    ).toLocaleString("fr-FR")} DH
                  </td>

                  <td>
                    {Number(
                      budget.montant_divers || 0
                    ).toLocaleString("fr-FR")} DH
                  </td>

                  <td className="total-cell">
                    {Number(
                      budget.montant_total || 0
                    ).toLocaleString("fr-FR")} DH
                  </td>

                  <td>
                    <Link
                      to={`/admin/finance/budgets/${budget.id_budget}`}
                      className="eye-button"
                      title="Voir le détail"
                    >
                      👁
                    </Link>
                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default BudgetsList;