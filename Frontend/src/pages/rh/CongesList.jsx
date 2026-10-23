import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getConges, patchConge  } from "../../services/rhService";
import "./CongesList.css";

function CongesList() {
  const navigate = useNavigate();

  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statutFilter, setStatutFilter] = useState("TOUS");
  const [actionId, setActionId] = useState(null);

  useEffect(() => {
    loadConges();
  }, []);

  const loadConges = async () => {
    try {
      setLoading(true);
      const data = await getConges();
      setConges(Array.isArray(data) ? data : data.results || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les congés.");
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (id, nouveauStatut, e) => {
    e.stopPropagation();
    try {
      setActionId(id);
      await patchConge(id, { statut: nouveauStatut });
      setConges((prev) =>
        prev.map((c) => (c.id_absence === id ? { ...c, statut: nouveauStatut } : c))
      );
    } catch (err) {
      console.error(err);
      alert("Impossible de mettre à jour ce congé.");
    } finally {
      setActionId(null);
    }
  };

  const statuts = useMemo(
    () =>
      Array.from(
        new Set(conges.map((c) => c.statut).filter((s) => s && s.trim() !== ""))
      ),
    [conges]
  );

  const filtered = conges.filter((c) => {
    const fullName = `${c.employe_prenom || ""} ${c.employe_nom || ""}`.toLowerCase();
    const matchesSearch =
      search.trim() === "" ||
      fullName.includes(search.toLowerCase()) ||
      (c.type || "").toLowerCase().includes(search.toLowerCase());

    const matchesStatut =
      statutFilter === "TOUS" ||
      String(c.statut || "").toUpperCase() === statutFilter.toUpperCase();

    return matchesSearch && matchesStatut;
  });

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.date_debut || 0) - new Date(a.date_debut || 0)
  );

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return value;
    return date.toLocaleDateString("fr-FR");
  };

  const getStatutClass = (statut) => {
    const value = String(statut || "").toUpperCase();
    if (value === "VALIDE") return "valide";
    if (value === "REFUSE") return "refuse";
    return "attente";
  };

  if (loading) {
    return (
      <div className="rh-conges-page">
        <div className="rh-conges-loading">
          <div className="rh-conges-loader"></div>
          <span>Chargement des congés...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rh-conges-page">

      <div className="rh-conges-header">
        <div>
          <p className="rh-conges-eyebrow">RESSOURCES HUMAINES</p>
          <h1>Congés & Absences</h1>
          <p className="rh-conges-subtitle">
            Validez ou refusez les demandes de congés des employés.
          </p>
        </div>

        <button
          type="button"
          className="rh-conges-new-button"
          onClick={() => navigate("/rh/conges/nouveau")}
        >
          + Nouvelle demande
        </button>
      </div>

      {error && <div className="rh-conges-error">{error}</div>}

      <div className="rh-conges-toolbar">
        <input
          type="text"
          placeholder="Rechercher un employé, un type de congé..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select value={statutFilter} onChange={(e) => setStatutFilter(e.target.value)}>
          <option value="TOUS">Tous les statuts</option>
          {statuts.map((statut) => (
            <option key={statut} value={statut}>{statut}</option>
          ))}
        </select>

        <span className="rh-conges-count">{sorted.length} demande(s)</span>
      </div>

      <div className="rh-conges-list">
        {sorted.length === 0 ? (
          <div className="rh-conges-empty">Aucune demande de congé trouvée.</div>
        ) : (
          sorted.map((conge) => (
            <div
              key={conge.id_absence}
              className="rh-conge-card"
              onClick={() => navigate(`/rh/conges/${conge.id_absence}`)}
            >
              <div className="rh-conge-card-main">
                <div className="rh-conge-card-top">
                  <strong>{conge.employe_prenom} {conge.employe_nom}</strong>
                  <span className={"rh-conges-badge " + getStatutClass(conge.statut)}>
                    {conge.statut || "EN_ATTENTE"}
                  </span>
                </div>
                <p className="rh-conge-card-type">{conge.type || "Congé"}</p>
                <p className="rh-conge-card-dates">
                  {formatDate(conge.date_debut)} → {formatDate(conge.date_fin)}
                </p>
                {conge.motif && <p className="rh-conge-card-motif">{conge.motif}</p>}
              </div>

              {String(conge.statut || "").toUpperCase() === "EN_ATTENTE" && (
                <div className="rh-conge-card-actions">
                  <button
                    type="button"
                    className="rh-conge-validate"
                    disabled={actionId === conge.id_absence}
                    onClick={(e) => handleDecision(conge.id_absence, "VALIDE", e)}
                  >
                    ✓ Valider
                  </button>
                  <button
                    type="button"
                    className="rh-conge-refuse"
                    disabled={actionId === conge.id_absence}
                    onClick={(e) => handleDecision(conge.id_absence, "REFUSE", e)}
                  >
                    ✕ Refuser
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default CongesList;