import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getDemande,
  deleteDemande,
  motifLabel,
  statutDemandeBadge,
  statutDemandeLabel,
  extractError,
} from "../../services/demandeService";
import { formatDate, formatMoney } from "../../services/mtService";
import "./MT.css";

function MTDemandeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setDemande(await getDemande(id));
      } catch (err) {
        console.error(err);
        setError("Impossible de charger cette demande.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Supprimer cette demande ?")) return;
    try {
      setDeleting(true);
      await deleteDemande(id);
      navigate("/maintenance/demandes");
    } catch (err) {
      alert(extractError(err, "Impossible de supprimer cette demande."));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-page">
        <div className="mt-loading"><div className="mt-loader"></div><span>Chargement...</span></div>
      </div>
    );
  }

  if (!demande) {
    return (
      <div className="mt-page">
        <div className="mt-error">{error || "Demande introuvable."}</div>
        <Link to="/maintenance/demandes" className="mt-btn">← Retour</Link>
      </div>
    );
  }

  const enAttente = demande.statut === "EN_ATTENTE";

  return (
    <div className="mt-page">
      <div className="mt-header">
        <div>
          <p className="mt-eyebrow">DEMANDE DE FINANCEMENT #{demande.id_demande}</p>
          <h1>{demande.equipement_nom}</h1>
          <p className="mt-subtitle">{motifLabel(demande.motif)} · {demande.projet_nom}</p>
        </div>
        <div className="mt-actions">
          <Link to="/maintenance/demandes" className="mt-btn">← Retour</Link>
          {enAttente && (
            <>
              <Link to={`/maintenance/demandes/${id}/modifier`} className="mt-btn">Modifier</Link>
              <button className="mt-btn-danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Suppression..." : "Supprimer"}
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 20, display: "flex", gap: 10 }}>
        <span className={"mt-badge " + statutDemandeBadge(demande.statut)}>
          {statutDemandeLabel(demande.statut)}
        </span>
        {demande.urgence === "URGENTE" && <span className="mt-badge danger">Urgente</span>}
      </div>

      <div className="mt-info-grid">
        <div className="mt-info"><span>Montant demandé</span><strong>{formatMoney(demande.montant_demande)}</strong></div>
        <div className="mt-info"><span>Montant accordé</span><strong>{demande.montant_accorde ? formatMoney(demande.montant_accorde) : "-"}</strong></div>
        <div className="mt-info"><span>Date de la demande</span><strong>{formatDate(demande.date_demande)}</strong></div>
        <div className="mt-info"><span>Date de décision</span><strong>{formatDate(demande.date_decision)}</strong></div>
        <div className="mt-info"><span>Décidé par</span><strong>{demande.decideur_nom || "-"}</strong></div>
        <div className="mt-info"><span>Urgence</span><strong>{demande.urgence === "URGENTE" ? "Urgente" : "Normale"}</strong></div>
        <div className="mt-info" style={{ gridColumn: "1 / -1" }}>
          <span>Justification</span>
          <strong style={{ whiteSpace: "pre-wrap" }}>{demande.justification || "-"}</strong>
        </div>
        {demande.commentaire_decision && (
          <div className="mt-info" style={{ gridColumn: "1 / -1" }}>
            <span>Commentaire du responsable financier</span>
            <strong style={{ whiteSpace: "pre-wrap" }}>{demande.commentaire_decision}</strong>
          </div>
        )}
      </div>
    </div>
  );
}

export default MTDemandeDetail;