import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAchats } from "../../../services/stockService";

import "./AchatsList.css";

function AchatsList() {
  const navigate = useNavigate();

  const [achats, setAchats] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAchats = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAchats();

      setAchats(
        Array.isArray(data)
          ? data
          : data.results || data.value || []
      );
    } catch (err) {
      console.error("Erreur chargement achats :", err);

      setError(
        err.response?.data?.detail ||
          "Impossible de charger les achats."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchats();
  }, []);

  const filtered = useMemo(() => {
    const text = search.toLowerCase().trim();

    return achats.filter((achat) => {
      return (
        String(achat.reference || "")
          .toLowerCase()
          .includes(text) ||

        String(achat.id_achat || "")
          .toLowerCase()
          .includes(text) ||

        String(achat.id_projet || "")
          .toLowerCase()
          .includes(text) ||

        String(achat.id_fournisseur || "")
          .toLowerCase()
          .includes(text) ||

        String(achat.id_materiau || "")
          .toLowerCase()
          .includes(text)
      );
    });
  }, [achats, search]);

  const totalMontant = achats.reduce(
    (total, achat) =>
      total + Number(achat.montant_total || 0),
    0
  );

  return (
    <div className="achats-page">

      {/* ==================================================
          HEADER
      ================================================== */}

      <div className="page-header">
        <div>
          <div className="page-kicker">
            GESTION DU STOCK
          </div>

          <h1>
            Historique des achats
          </h1>

          <p>
            Consultation des achats de matériaux effectués
            par le responsable financier.
          </p>
        </div>
      </div>


      {/* ==================================================
          STATISTIQUES
      ================================================== */}

      <div className="stats-row">

        <div className="stat-card">
          <span>
            TOTAL ACHATS
          </span>

          <strong>
            {achats.length}
          </strong>
        </div>

        <div className="stat-card">
          <span>
            MONTANT TOTAL
          </span>

          <strong>
            {totalMontant.toFixed(2)} DH
          </strong>
        </div>

      </div>


      {/* ==================================================
          ERREUR
      ================================================== */}

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}


      {/* ==================================================
          TABLE
      ================================================== */}

      <div className="content-card">

        <div className="table-header">

          <div>
            <h2>
              Historique des achats
            </h2>

            <span>
              {filtered.length} achat(s)
            </span>
          </div>

          <input
            className="search-input"
            type="text"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

        </div>


        {loading ? (

          <div className="message">
            Chargement des achats...
          </div>

        ) : filtered.length === 0 ? (

          <div className="empty">
            Aucun achat trouvé.
          </div>

        ) : (

          <div className="table-container">

            <table>

              <thead>
                <tr>
                  <th>ID</th>
                  <th>RÉFÉRENCE</th>
                  <th>PROJET</th>
                  <th>FOURNISSEUR</th>
                  <th>MATÉRIAU</th>
                  <th>QUANTITÉ</th>
                  <th>PRIX UNITAIRE</th>
                  <th>MONTANT TOTAL</th>
                  <th>DATE</th>
                  <th>STATUT</th>
                  <th>FACTURE</th>
                  <th>ACTION</th>
                </tr>
              </thead>


              <tbody>

                {filtered.map((achat) => (

                  <tr key={achat.id_achat}>

                    <td>
                      #{achat.id_achat}
                    </td>


                    <td>
                      <strong>
                        {achat.reference}
                      </strong>
                    </td>


                    <td>
                      #{achat.id_projet}
                    </td>


                    <td>
                      #{achat.id_fournisseur}
                    </td>


                    <td>
                      #{achat.id_materiau}
                    </td>


                    <td>
                      {achat.quantite}{" "}
                      {achat.unite || ""}
                    </td>


                    <td>
                      {Number(
                        achat.prix_unitaire || 0
                      ).toFixed(2)}{" "}
                      DH
                    </td>


                    <td>
                      <strong>
                        {Number(
                          achat.montant_total || 0
                        ).toFixed(2)}{" "}
                        DH
                      </strong>
                    </td>


                    <td>
                      {achat.date_achat || "-"}
                    </td>


                    <td>
                      <span className="status-badge">
                        {achat.statut || "-"}
                      </span>
                    </td>


                    <td>
                      {achat.facture ? (
                        <span className="invoice-available">
                          🧾
                        </span>
                      ) : (
                        <span className="invoice-missing">
                          —
                        </span>
                      )}
                    </td>


                    <td>
                      <button
                        className="btn-view-icon"
                        title="Voir le détail"
                        aria-label="Voir le détail"
                        onClick={() =>
                          navigate(
                            `/admin/stock/achats/${achat.id_achat}`
                          )
                        }
                      >
                        👁
                      </button>
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
}

export default AchatsList;