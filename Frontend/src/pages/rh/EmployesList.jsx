import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getEmployes } from "../../services/rhService";
import "./EmployesList.css";

function EmployesList() {
  const navigate = useNavigate();

  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("TOUS");

  useEffect(() => {
    loadEmployes();
  }, []);

  const loadEmployes = async () => {
    try {
      setLoading(true);
      const data = await getEmployes();
      setEmployes(Array.isArray(data) ? data : data.results || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les employés.");
    } finally {
      setLoading(false);
    }
  };

  const statuts = useMemo(
    () =>
      Array.from(
        new Set(employes.map((e) => e.statut).filter((s) => s && s.trim() !== ""))
      ),
    [employes]
  );

  const filtered = employes.filter((e) => {
    const fullName = `${e.prenom || ""} ${e.nom || ""}`.toLowerCase();
    const matchesSearch =
      search.trim() === "" ||
      fullName.includes(search.toLowerCase()) ||
      (e.poste || "").toLowerCase().includes(search.toLowerCase()) ||
      (e.cin || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatut =
      statutFilter === "TOUS" ||
      String(e.statut || "").toUpperCase() === statutFilter.toUpperCase();

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
      <div className="rh-employes-page">
        <div className="rh-list-loading">
          <div className="rh-list-loader"></div>
          <span>Chargement des employés...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rh-employes-page">

      <div className="rh-employes-header">
        <div>
          <p className="rh-employes-eyebrow">RESSOURCES HUMAINES</p>
          <h1>Employés</h1>
          <p className="rh-employes-subtitle">
            Gérez les employés de votre plateforme BTP.
          </p>
        </div>

        <button
          type="button"
          className="rh-employes-new-button"
          onClick={() => navigate("/rh/employes/nouveau")}
        >
          + Nouvel employé
        </button>
      </div>

      {error && <div className="rh-employes-error">{error}</div>}

      <div className="rh-employes-toolbar">
        <input
          type="text"
          placeholder="Rechercher un employé, un poste, un CIN..."
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

        <span className="rh-employes-count">{filtered.length} employé(s)</span>
      </div>

      <div className="rh-employes-table-wrapper">
        <table className="rh-employes-table">
          <thead>
            <tr>
              <th>Employé</th>
              <th>Poste</th>
              <th>Téléphone</th>
              <th>Date d'embauche</th>
              <th>Coût journalier</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="rh-employes-empty">
                  Aucun employé trouvé.
                </td>
              </tr>
            ) : (
              filtered.map((employe) => (
                <tr
                  key={employe.id_employe}
                  onClick={() => navigate(`/rh/employes/${employe.id_employe}`)}
                >
                  <td>
                    <div className="rh-employes-name-cell">
                      <div className="rh-employes-avatar">
                        {`${(employe.prenom || "").charAt(0)}${(employe.nom || "").charAt(0)}`.toUpperCase() || "E"}
                      </div>
                      <div>
                        <strong>{employe.prenom} {employe.nom}</strong>
                        {employe.cin && <span>{employe.cin}</span>}
                      </div>
                    </div>
                  </td>
                  <td>{employe.poste || "-"}</td>
                  <td>{employe.telephone || "-"}</td>
                  <td>{formatDate(employe.date_embauche)}</td>
                  <td>{formatMoney(employe.cout_journalier)}</td>
                  <td>
                    <span className={
                      "rh-employes-badge " +
                      (String(employe.statut || "").toUpperCase() === "ACTIF" ? "active" : "inactive")
                    }>
                      {employe.statut || "Non défini"}
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

export default EmployesList;