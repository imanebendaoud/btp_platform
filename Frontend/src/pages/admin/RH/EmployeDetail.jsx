import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getEmploye } from "../../../services/hrService";
import "./HRDataPages.css";

function EmployeDetail() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEmploye(id)
      .then(setItem)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  const fields = item ? [
    ["Identifiant", item.id_employe],
    ["Nom", item.nom],
    ["Prénom", item.prenom],
    ["CIN", item.cin],
    ["Téléphone", item.telephone],
    ["Email", item.email],
    ["Poste", item.poste],
    ["Date d'embauche", item.date_embauche],
    ["Coût journalier", item.cout_journalier != null ? `${item.cout_journalier} DH` : null],
    ["Statut", item.statut],
  ] : [];

  return (
    <main className="hr-data-page">
      <header className="hr-data-header">
        <div>
          <p className="hr-data-eyebrow">FICHE DU PERSONNEL</p>
          <h1>{item ? `${item.prenom || ""} ${item.nom || ""}` : "Détail de l'employé"}</h1>
          <p>Informations en consultation uniquement.</p>
        </div>
        <Link className="hr-back-link" to="/admin/rh/employes">← Retour</Link>
      </header>

      {loading && <p className="hr-data-message">Chargement...</p>}
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

export default EmployeDetail;