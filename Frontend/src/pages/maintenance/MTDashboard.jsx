import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getEquipements,
  getAffectations,
  getMaintenances,
  formatDate,
  isPanne,
  isOpen,
  statutBadge,
} from "../../services/mtService";
import "./MT.css";

function MTDashboard() {
  const { user } = useAuth();

  const [equipements, setEquipements] = useState([]);
  const [affectations, setAffectations] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [e, a, m] = await Promise.all([
          getEquipements(),
          getAffectations(),
          getMaintenances(),
        ]);
        setEquipements(e);
        setAffectations(a);
        setMaintenances(m);
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les données de maintenance.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="mt-page">
        <div className="mt-loading">
          <div className="mt-loader"></div>
          <span>Chargement du tableau de bord...</span>
        </div>
      </div>
    );
  }

  const nomEquip = (id) =>
    equipements.find((e) => e.id_equipement === id)?.nom || `Équipement #${id}`;

  const enPanne = equipements.filter((e) => isPanne(e.etat));
  const ouvertes = maintenances.filter((m) => isOpen(m.statut));
  const today = new Date().toISOString().slice(0, 10);
  const affectesActifs = affectations.filter((a) => !a.date_fin || a.date_fin >= today);

  return (
    <div className="mt-page">
      <div className="mt-header">
        <div>
          <p className="mt-eyebrow">MAINTENANCE</p>
          <h1>Bonjour, {user?.prenom || "Responsable"}</h1>
          <p className="mt-subtitle">Suivi du parc d'équipements et des interventions.</p>
        </div>
        <div className="mt-actions">
          <Link to="/maintenance/interventions/nouveau" className="mt-btn-primary">
            + Nouvelle intervention
          </Link>
        </div>
      </div>

      {error && <div className="mt-error">{error}</div>}

      <section className="mt-stats">
        <div className="mt-stat">
          <span>Équipements</span>
          <strong>{equipements.length}</strong>
          <small>au parc</small>
        </div>
        <div className={"mt-stat" + (enPanne.length > 0 ? " mt-stat-alert" : "")}>
          <span>En panne</span>
          <strong>{enPanne.length}</strong>
          <small>à traiter</small>
        </div>
        <div className="mt-stat">
          <span>Interventions ouvertes</span>
          <strong>{ouvertes.length}</strong>
          <small>sur {maintenances.length} au total</small>
        </div>
        <div className="mt-stat">
          <span>Affectations en cours</span>
          <strong>{affectesActifs.length}</strong>
          <small>équipements sur chantier</small>
        </div>
      </section>

      <section className="mt-two">
        <div className="mt-card">
          <div className="mt-card-header">
            <h2>Équipements en panne</h2>
            <Link to="/maintenance/equipements">Voir tout →</Link>
          </div>
          <div className="mt-list">
            {enPanne.length === 0 ? (
              <div className="mt-empty">Aucun équipement en panne.</div>
            ) : (
              enPanne.slice(0, 5).map((e) => (
                <Link
                  key={e.id_equipement}
                  to={`/maintenance/equipements/${e.id_equipement}`}
                  className="mt-list-item"
                >
                  <div>
                    <strong>{e.nom}</strong>
                    <span className="mt-sub">{e.type || "Type non défini"} · {e.numero_serie}</span>
                  </div>
                  <span className="mt-badge danger">{e.etat}</span>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="mt-card">
          <div className="mt-card-header">
            <h2>Interventions ouvertes</h2>
            <Link to="/maintenance/interventions">Voir tout →</Link>
          </div>
          <div className="mt-list">
            {ouvertes.length === 0 ? (
              <div className="mt-empty">Aucune intervention ouverte.</div>
            ) : (
              ouvertes.slice(0, 5).map((m) => (
                <Link
                  key={m.id_maintenance}
                  to={`/maintenance/interventions/${m.id_maintenance}/modifier`}
                  className="mt-list-item"
                >
                  <div>
                    <strong>{nomEquip(m.id_equipement)}</strong>
                    <span className="mt-sub">
                      {m.type_intervention || "Intervention"} · prévue le {formatDate(m.date_planifiee)}
                    </span>
                  </div>
                  <span className={"mt-badge " + statutBadge(m.statut)}>{m.statut || "-"}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default MTDashboard;