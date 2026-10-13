import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { displayHRValue } from "./HRResourceList";
import "./HRDataPages.css";

export default function HRResourceDetail({
  title,
  backPath,
  getData,
  fields,
  id,
}) {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    getData(id)
      .then((data) => {
        if (active) setItem(data);
      })
      .catch((err) => {
        if (active) setError(err.message || "Impossible de charger le détail.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id, getData]);

  return (
    <main className="hr-data-page">
      <header className="hr-data-header">
        <div>
          <p className="hr-data-eyebrow">RESSOURCES HUMAINES</p>
          <h1>{title}</h1>
          <p>Consultation détaillée — aucune modification possible.</p>
        </div>
        <p>CHEMIN DE RETOUR : /admin/rh</p>

        <Link className="hr-back-link" to="/admin/rh">
  ← Retour
        </Link>
      </header>

      {loading && <p className="hr-data-message">Chargement...</p>}
      {error && <div className="hr-data-error">{error}</div>}

      {item && !loading && (
        <section className="hr-detail-card">
          {fields.map((field) => (
            <div className="hr-detail-field" key={field.label}>
              <span>{field.label}</span>
              <strong>
                {field.render
                  ? field.render(item)
                  : displayHRValue(item[field.key])}
              </strong>
            </div>
          ))}
        </section>
      )}
    </main>
  );
}