
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./HRDataPages.css";

export function displayHRValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  if (typeof value === "object") {
    if (value.prenom || value.nom) {
      return [value.prenom, value.nom].filter(Boolean).join(" ");
    }

    return (
      value.projet_nom ||
      value.nom_projet ||
      value.nom ||
      value.numero_projet ||
      value.titre ||
      value.id_employe ||
      value.id_projet ||
      value.id ||
      "—"
    );
  }

  return String(value);
}

// Affiche le nom associé à une relation au lieu de son ID.
export function displayHRField(item, field) {
  if (field.render) {
    return field.render(item);
  }

  const key = field.field || field.key;

  if (key === "id_employe") {
    const prenom = item.employe_prenom;
    const nom = item.employe_nom;

    if (prenom || nom) {
      return [prenom, nom].filter(Boolean).join(" ");
    }
  }

  if (key === "id_projet") {
    const numero = item.projet_numero;
    const nom = item.projet_nom;

    if (numero || nom) {
      return [numero, nom].filter(Boolean).join(" — ");
    }
  }

  return displayHRValue(item[key]);
}

export default function HRResourceList({
  title,
  description,
  backPath = "/admin/hr",
  detailPath,
  getData,
  idField,
  columns,
  searchFields = [],
}) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setLoading(true);
    setError("");

    getData()
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
        if (active) {
          setError(err.message || "Erreur de chargement.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [getData]);

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return items;

    return items.filter((item) => {
      const searchableValues = [
        ...searchFields.map((field) =>
          displayHRField(item, { field })
        ),
        item.employe_nom,
        item.employe_prenom,
        item.projet_nom,
        item.projet_numero,
      ];

      return searchableValues.some((value) =>
        String(value ?? "").toLowerCase().includes(term)
      );
    });
  }, [items, search, searchFields]);

  return (
    <main className="hr-data-page">
      <header className="hr-data-header">
        <div>
          <p className="hr-data-eyebrow">RESSOURCES HUMAINES</p>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>

        <Link className="hr-back-link" to={backPath}>
          ← Retour
        </Link>
      </header>

      {error && <div className="hr-data-error">{error}</div>}

      <div className="hr-data-toolbar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Rechercher : ${title.toLowerCase()}...`}
          aria-label={`Rechercher ${title.toLowerCase()}`}
        />
        <span>{filtered.length} résultat(s)</span>
      </div>

      {loading ? (
        <p className="hr-data-message">Chargement...</p>
      ) : (
        <div className="hr-data-table-wrap">
          <table className="hr-data-table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.label}>{column.label}</th>
                ))}
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + 1}
                    className="hr-data-empty"
                  >
                    Aucune donnée trouvée.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item[idField]}>
                    {columns.map((column) => (
                      <td key={column.label}>
                        {displayHRField(item, column)}
                      </td>
                    ))}

                    <td>
                      <Link
                        className="hr-view-link"
                        to={`${detailPath}/${item[idField]}`}
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
