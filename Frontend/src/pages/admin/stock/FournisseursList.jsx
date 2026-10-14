import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getFournisseurs,
  deleteFournisseur,
} from "../../../services/stockService";

import "./FournisseursList.css";

function FournisseursList() {
  const navigate = useNavigate();

  const [fournisseurs, setFournisseurs] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFournisseurs = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getFournisseurs();

      setFournisseurs(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les fournisseurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFournisseurs();
  }, []);

  const handleDelete = async (id) => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce fournisseur ?"
    );

    if (!confirmation) return;

    try {
      await deleteFournisseur(id);

      setFournisseurs((prev) =>
        prev.filter((fournisseur) => fournisseur.id_fournisseur !== id)
      );
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.detail ||
          "Impossible de supprimer ce fournisseur."
      );
    }
  };

  const filteredFournisseurs = fournisseurs.filter((fournisseur) => {
    const text = search.toLowerCase();

    return (
      fournisseur.nom?.toLowerCase().includes(text) ||
      String(fournisseur.id_fournisseur).includes(text) ||
      fournisseur.email?.toLowerCase().includes(text) ||
      fournisseur.telephone?.toLowerCase().includes(text)
    );
  });

  return (
    <div className="fournisseurs-page">
      <div className="page-header">
        <div>
          <h1>Fournisseurs</h1>
          <p>Gestion des fournisseurs de matériaux</p>
        </div>

        <button
          className="btn-primary"
          onClick={() => navigate("/admin/stock/fournisseurs/nouveau")}
        >
          + Ajouter un fournisseur
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <span>Total fournisseurs</span>
          <strong>{fournisseurs.length}</strong>
        </div>
      </div>

      <div className="content-card">
        <div className="search-container">
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone ou ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading && <p className="message">Chargement...</p>}

        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>NOM</th>
                  <th>TÉLÉPHONE</th>
                  <th>EMAIL</th>
                  <th>ICE</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>

              <tbody>
                {filteredFournisseurs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty">
                      Aucun fournisseur trouvé.
                    </td>
                  </tr>
                ) : (
                  filteredFournisseurs.map((fournisseur) => (
                    <tr key={fournisseur.id_fournisseur}>
                      <td>#{fournisseur.id_fournisseur}</td>

                      <td>
                        <strong>{fournisseur.nom}</strong>
                      </td>

                      <td>{fournisseur.telephone || "-"}</td>

                      <td>{fournisseur.email || "-"}</td>

                      <td>{fournisseur.ice || "-"}</td>

                      <td>
                        <div className="actions">
                          <button
                            className="btn-view"
                            onClick={() =>
                              navigate(
                                `/admin/stock/fournisseurs/${fournisseur.id_fournisseur}`
                              )
                            }
                          >
                            Voir
                          </button>

                          <button
                            className="btn-edit"
                            onClick={() =>
                              navigate(
                                `/admin/stock/fournisseurs/${fournisseur.id_fournisseur}/modifier`
                              )
                            }
                          >
                            Modifier
                          </button>

                          <button
                            className="btn-delete"
                            onClick={() =>
                              handleDelete(fournisseur.id_fournisseur)
                            }
                          >
                            Supprimer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default FournisseursList;