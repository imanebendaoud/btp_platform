
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAffectationsEmployes } from "../../../services/hrService";
import "./HRDataPages.css";

function nomEmploye(a) {
  const nom = [a.employe_prenom, a.employe_nom]
    .filter(Boolean)
    .join(" ");

  return nom || `Employé #${a.id_employe ?? "—"}`;
}

function nomProjet(a) {
  const nom = [a.projet_numero, a.projet_nom]
    .filter(Boolean)
    .join(" — ");

  return nom || `Projet #${a.id_projet ?? "—"}`;
}

function AffectationsList() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getAffectationsEmployes()
      .then((data) => {
        if (!active) return;
        setItems(
          Array.isArray(data)
            ? data
            : Array.isArray(data?.results)
              ? data.results
              : []
        );
      })
      .catch((err) => {
        if (active) setError(err.message || "Erreur de chargement.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();

    return items.filter((a) =>
      [
        nomEmploye(a),
        nomProjet(a),
        a.fonction_sur_chantier,
        a.date_debut,
        a.date_fin,
      ].some((v) => String(v ?? "").toLowerCase().includes(term))
    );
  }, [items, search]);

  return (
    <main className="hr-data-page">
      <header className="hr-data-header">
        <div>
          <p className="hr-data-eyebrow">RESSOURCES HUMAINES</p>
          <h1>Affectations des employés</h1>
          <p>Consultation des affectations du personnel aux projets.</p>
        </div>

        <Link className="hr-back-link" to="/admin/rh">
          ← Retour
        </Link>
      </header>

      {error && <div className="hr-data-error">{error}</div>}

      <div className="hr-data-toolbar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par employé, projet ou fonction..."
          aria-label="Rechercher une affectation"
        />
        <span>{filtered.length} affectation(s)</span>
      </div>

      {loading ? (
        <p className="hr-data-message">Chargement...</p>
      ) : (
        <div className="hr-data-table-wrap">
          <table className="hr-data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Employé</th>
                <th>Projet</th>
                <th>Fonction</th>
                <th>Date début</th>
                <th>Date fin</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="hr-data-empty">
                    Aucune affectation trouvée.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id_affectation}>
                    <td>#{a.id_affectation}</td>
                    <td>{nomEmploye(a)}</td>
                    <td>{nomProjet(a)}</td>
                    <td>{a.fonction_sur_chantier || "—"}</td>
                    <td>{a.date_debut || "—"}</td>
                    <td>{a.date_fin || "En cours"}</td>
                    <td>
                      <Link
                        className="hr-view-link"
                        to={`/admin/rh/affectations/${a.id_affectation}`}
                      >
                        Voir →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default AffectationsList;
