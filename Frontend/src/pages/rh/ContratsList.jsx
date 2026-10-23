import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getContrats } from "../../services/rhService";
import "./ContratsList.css";

function ContratsList() {
  const navigate = useNavigate();

  const [contrats, setContrats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("TOUS");

  useEffect(() => {
    loadContrats();
  }, []);

  const loadContrats = async () => {
    try {
      setLoading(true);
      const data = await getContrats();
      setContrats(Array.isArray(data) ? data : data.results || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les contrats.");
    } finally {
      setLoading(false);
    }
  };

  const statuts = useMemo(
    () =>
      Array.from(
        new Set(contrats.map((c) => c.statut).filter((s) => s && s.trim() !== ""))
      ),
    [contrats]
  );

  const filtered = contrats.filter((c) => {
    const fullName = `${c.employe_prenom || ""} ${c.employe_nom || ""}`.toLowerCase();
    const matchesSearch =
      search.trim() === "" ||
      fullName.includes(search.toLowerCase()) ||
      (c.type_contrat || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatut =
      statutFilter === "TOUS" ||
      String(c.statut || "").toUpperCase() === statutFilter.toUpperCase();

    return matchesSearch && matchesStatut;
  });

  const formatMoney = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    return new Intl.NumberFormat("fr-MA").format(value) + " DH";
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString("fr-FR");
  };

  if (loading) {
    return (
      <div className="rh-contrats-page">
        <div className="rh-contrats-loading">
          <div className="rh-contrats-loader"></div>
          <span>Chargement des contrats...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rh-contrats-page">

      <div className="rh-contrats-header">
        <div>
          <p className="rh-contrats-eyebrow">RESSOURCES HUMAINES</p>
          <h1>Contrats</h1>
          <p className="rh-contrats-subtitle">
            Gérez les contrats de travail des employés.
          </p>
        </div>

        <button
          type="button"
          className="rh-contrats-new-button"
          onClick={() => navigate("/rh/contrats/nouveau")}
        >
          + Nouveau contrat
        </button>
      </div>

      {error && <div className="rh-contrats-error">{error}</div>}

      <div className="rh-contrats-toolbar">
        <input
          type="text"
          placeholder="Rechercher un employé, un type de contrat..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          value={statutFilter}
          onChange={(e) => setStatutFilter(e.target.value)}
        >
          <option value="TOUS">Tous les statuts</option>
          {statuts.map((statut) => (
            <option key={statut} value={statut}>{statut}</option>
          ))}
        </select>

        <span className="rh-contrats-count">{filtered.length} contrat(s)</span>
      </div>

      <div className="rh-contrats-table-wrapper">
        <table className="rh-contrats-table">
          <thead>
            <tr>
              <th>Employé</th>
              <th>Type</th>
              <th>Date début</th>
              <th>Date fin</th>
              <th>Salaire</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="rh-contrats-empty">
                  Aucun contrat trouvé.
                </td>
              </tr>
            ) : (
              filtered.map((contrat) => (
                <tr
                  key={contrat.id_contrat}
                  onClick={() => navigate(`/rh/contrats/${contrat.id_contrat}`)}
                >
                  <td>
                    <strong>{contrat.employe_prenom} {contrat.employe_nom}</strong>
                  </td>
                  <td>{contrat.type_contrat || "-"}</td>
                  <td>{formatDate(contrat.date_debut)}</td>
                  <td>{formatDate(contrat.date_fin)}</td>
                  <td>{formatMoney(contrat.salaire)}</td>
                  <td>
                    <span className={
                      "rh-contrats-badge " +
                      (String(contrat.statut || "").toUpperCase() === "ACTIF" ? "active" : "inactive")
                    }>
                      {contrat.statut || "Non défini"}
                    </span>
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

export default ContratsList;