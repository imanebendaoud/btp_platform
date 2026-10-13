
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getAffectationEmploye } from "../../../services/hrService";
import "./HRDataPages.css";

function AffectationDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    getAffectationEmploye(id)
      .then((data) => {
        if (active) setItem(data);
      })
      .catch((err) => {
        if (active) {
          setError(err.message || "Impossible de charger l'affectation.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const nomEmploye = item
    ? [item.employe_prenom, item.employe_nom]
        .filter(Boolean)
        .join(" ") || `Employé #${item.id_employe ?? "—"}`
    : "";

  const nomProjet = item
    ? [item.projet_numero, item.projet_nom]
        .filter(Boolean)
        .join(" — ") || `Projet #${item.id_projet ?? "—"}`
    : "";

  const fields = item
    ? [
        ["Identifiant de l'affectation", item.id_affectation],
        ["Employé", nomEmploye],
        ["Projet", nomProjet],
        ["Fonction sur chantier", item.fonction_sur_chantier],
        ["Date de début", item.date_debut],
        ["Date de fin", item.date_fin || "Aucune date de fin"],
        [
          "Coût journalier",
          item.cout_journalier != null
            ? `${item.cout_journalier} DH`
            : null,
        ],
      ]
    : [];

  return (
    <main className="hr-data-page">
      <header className="hr-data-header">
        <div>
          <p className="hr-data-eyebrow">FICHE D'AFFECTATION</p>
          <h1>Affectation #{id}</h1>
          <p>Détails de l'affectation du personnel au chantier.</p>
        </div>

        <Link className="hr-back-link" to="/admin/rh/affectations">
          ← Retour
        </Link>
      </header>

      {loading && (
        <p className="hr-data-message">Chargement...</p>
      )}

      {error && <div className="hr-data-error">{error}</div>}

      {item && !loading && (
        <section className="hr-detail-card">
          {fields.map(([label, value]) => (
            <div className="hr-detail-field" key={label}>
              <span>{label}</span>
              <strong>{value ?? "—"}</strong>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}

export default AffectationDetail;
