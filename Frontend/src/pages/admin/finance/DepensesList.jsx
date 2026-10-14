import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDepenses } from "../../../services/financeService";
import "./DepensesList.css";

function DepensesList() {
  const [depenses, setDepenses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDepenses();
  }, []);

  const loadDepenses = async () => {
    try {
      setLoading(true);

      const data = await getDepenses();

      setDepenses(
        Array.isArray(data)
          ? data
          : data.results || []
      );
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les dépenses.");
    } finally {
      setLoading(false);
    }
  };

  const filteredDepenses = depenses.filter((depense) => {
    const value = search.toLowerCase();

    return (
      String(depense.id_depense)
        .toLowerCase()
        .includes(value) ||
      String(depense.id_projet)
        .toLowerCase()
        .includes(value) ||
      String(depense.categorie || "")
        .toLowerCase()
        .includes(value) ||
      String(depense.description || "")
        .toLowerCase()
        .includes(value)
    );
  });

  const totalDepenses = filteredDepenses.reduce(
    (sum, depense) =>
      sum + Number(depense.montant || 0),
    0
  );

  if (loading) {
    return (
      <div className="depenses-page">
        Chargement des dépenses...
      </div>
    );
  }

  return (
    <div className="depenses-page">

      <div className="depenses-header">

        <div>
          <h1>Dépenses</h1>
          <p>
            Historique des dépenses des projets
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
        <div className="depenses-error">
          {error}
        </div>
      )}

      <div className="depenses-summary">

        <div>
          <span>Nombre de dépenses</span>
          <strong>{filteredDepenses.length}</strong>
        </div>

        <div>
          <span>Total</span>
          <strong>
            {totalDepenses.toLocaleString("fr-FR")} DH
          </strong>
        </div>

      </div>

      <div className="depenses-toolbar">

        <input
          type="text"
          placeholder="Rechercher par catégorie, projet..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

      </div>

      <div className="depenses-table-container">

        <table className="depenses-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Projet</th>
              <th>Catégorie</th>
              <th>Description</th>
              <th>Montant</th>
              <th>Date</th>
              <th>Justification</th>
              <th>Pièce</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            {filteredDepenses.length === 0 ? (
              <tr>
                <td colSpan="9" className="empty-cell">
                  Aucune dépense trouvée.
                </td>
              </tr>
            ) : (
              filteredDepenses.map((depense) => (
                <tr key={depense.id_depense}>

                  <td>
                    #{depense.id_depense}
                  </td>

                  <td>
                    Projet #{depense.id_projet}
                  </td>

                  <td>
                    {depense.categorie || "-"}
                  </td>

                  <td>
                    {depense.description || "-"}
                  </td>

                  <td className="amount-cell">
                    {Number(
                      depense.montant || 0
                    ).toLocaleString("fr-FR")} DH
                  </td>

                  <td>
                    {depense.date_depense || "-"}
                  </td>

                  <td>
                    {depense.justification || "-"}
                  </td>

                  <td>
                    {depense.piece_justificative
                      ? "Disponible"
                      : "Aucune"}
                  </td>

                  <td>
                    <Link
                      to={`/admin/finance/depenses/${depense.id_depense}`}
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

export default DepensesList;