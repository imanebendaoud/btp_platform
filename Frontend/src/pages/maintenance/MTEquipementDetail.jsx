import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getEquipement,
  deleteEquipement,
  patchEquipement,
  getAffectations,
  getMaintenances,
  createMaintenance,
  getProjets,
  formatDate,
  formatMoney,
  etatBadge,
  statutBadge,
  isPanne,
} from "../../services/mtService";
import "./MT.css";

function MTEquipementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [equipement, setEquipement] = useState(null);
  const [affectations, setAffectations] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [declaring, setDeclaring] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [eq, aff, mnt, prj] = await Promise.all([
          getEquipement(id),
          getAffectations(),
          getMaintenances(),
          getProjets(),
        ]);
        setEquipement(eq);
        setAffectations(aff.filter((a) => String(a.id_equipement) === String(id)));
        setMaintenances(mnt.filter((m) => String(m.id_equipement) === String(id)));
        setProjets(prj);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger cet équipement.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("Supprimer définitivement cet équipement ?")) return;
    try {
      setDeleting(true);
      await deleteEquipement(id);
      navigate("/maintenance/equipements");
    } catch (err) {
      console.error(err);
      alert("Impossible de supprimer cet équipement (il est peut-être lié à des affectations ou interventions).");
      setDeleting(false);
    }
  };

  const handleDeclarerPanne = async () => {
    const description = window.prompt("Décrivez la panne :");
    if (description === null) return; // annulé

    try {
      setDeclaring(true);

      // 1) l'équipement passe en panne (déclenche la notification admin)
      const maj = await patchEquipement(id, { etat: "EN_PANNE" });

      // 2) intervention corrective à planifier
      const interv = await createMaintenance({
        id_equipement: Number(id),
        type_intervention: "CORRECTIVE",
        description: description.trim() || null,
        date_declaration: new Date().toISOString().slice(0, 10),
        statut: "PLANIFIEE",
      });

      setEquipement(maj);
      setMaintenances((prev) => [interv, ...prev]);
    } catch (err) {
      console.error(err);
      alert("Impossible de déclarer la panne.");
    } finally {
      setDeclaring(false);
    }
  };

  const nomProjet = (pid) => projets.find((p) => p.id_projet === pid)?.nom || `Projet #${pid}`;

  if (loading) {
    return (
      <div className="mt-page">
        <div className="mt-loading"><div className="mt-loader"></div><span>Chargement...</span></div>
      </div>
    );
  }

  if (error || !equipement) {
    return (
      <div className="mt-page">
        <div className="mt-error">{error || "Équipement introuvable."}</div>
        <Link to="/maintenance/equipements" className="mt-btn">← Retour</Link>
      </div>
    );
  }

  return (
    <div className="mt-page">
      <div className="mt-header">
        <div>
          <p className="mt-eyebrow">FICHE ÉQUIPEMENT</p>
          <h1>{equipement.nom}</h1>
          <p className="mt-subtitle">{equipement.type || "Type non défini"}</p>
        </div>
        <div className="mt-actions">
          <Link to={`/maintenance/demandes/nouveau?equipement=${id}`} className="mt-btn">€ Demander un financement</Link>
          <Link to="/maintenance/equipements" className="mt-btn">← Retour</Link>
          {!isPanne(equipement.etat) && (
            <button className="mt-btn-danger" onClick={handleDeclarerPanne} disabled={declaring}>
              {declaring ? "Déclaration..." : "⚠ Déclarer une panne"}
            </button>
          )}
          <Link to={`/maintenance/equipements/${id}/modifier`} className="mt-btn">Modifier</Link>
          <button className="mt-btn-danger" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Suppression..." : "Supprimer"}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <span className={"mt-badge " + etatBadge(equipement.etat)}>{equipement.etat || "État non défini"}</span>
      </div>

      <div className="mt-info-grid">
        <div className="mt-info"><span>N° de série</span><strong>{equipement.numero_serie || "-"}</strong></div>
        <div className="mt-info"><span>Disponibilité</span><strong>{equipement.disponibilite || "-"}</strong></div>
        <div className="mt-info"><span>Marque</span><strong>{equipement.marque || "-"}</strong></div>
        <div className="mt-info"><span>Modèle</span><strong>{equipement.modele || "-"}</strong></div>
        <div className="mt-info"><span>Date d'acquisition</span><strong>{formatDate(equipement.date_acquisition)}</strong></div>
        <div className="mt-info"><span>Type</span><strong>{equipement.type || "-"}</strong></div>
      </div>

      <div className="mt-card">
        <div className="mt-card-header">
          <h2>Historique des affectations</h2>
          <Link to="/maintenance/affectations/nouveau">+ Affecter</Link>
        </div>
        <div className="mt-list">
          {affectations.length === 0 ? (
            <div className="mt-empty">Aucune affectation.</div>
          ) : (
            affectations.map((a) => (
              <div key={a.id_affectation} className="mt-list-item">
                <div>
                  <strong>{nomProjet(a.id_projet)}</strong>
                  <span className="mt-sub">{formatDate(a.date_debut)} → {a.date_fin ? formatDate(a.date_fin) : "en cours"}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-card">
        <div className="mt-card-header">
          <h2>Historique des interventions</h2>
          <Link to="/maintenance/interventions/nouveau">+ Intervention</Link>
        </div>
        <div className="mt-list">
          {maintenances.length === 0 ? (
            <div className="mt-empty">Aucune intervention.</div>
          ) : (
            maintenances.map((m) => (
              <Link
                key={m.id_maintenance}
                to={`/maintenance/interventions/${m.id_maintenance}/modifier`}
                className="mt-list-item"
              >
                <div>
                  <strong>{m.type_intervention || "Intervention"}</strong>
                  <span className="mt-sub">
                    Déclarée le {formatDate(m.date_declaration)} · {formatMoney(m.cout)}
                  </span>
                </div>
                <span className={"mt-badge " + statutBadge(m.statut)}>{m.statut || "-"}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default MTEquipementDetail;