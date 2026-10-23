import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getEmployes,
  getContrats,
  getConges,
  getPointages,
} from "../../services/rhService";
import "./RHDashboard.css";

function RHDashboard() {
  const { user } = useAuth();

  const [employes, setEmployes] = useState([]);
  const [contrats, setContrats] = useState([]);
  const [conges, setConges] = useState([]);
  const [pointages, setPointages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        const [employesData, contratsData, congesData, pointagesData] =
          await Promise.all([
            getEmployes(),
            getContrats(),
            getConges(),
            getPointages(),
          ]);

        setEmployes(Array.isArray(employesData) ? employesData : employesData.results || []);
        setContrats(Array.isArray(contratsData) ? contratsData : contratsData.results || []);
        setConges(Array.isArray(congesData) ? congesData : congesData.results || []);
        setPointages(Array.isArray(pointagesData) ? pointagesData : pointagesData.results || []);
        setError("");
      } catch (err) {
        console.error("Erreur chargement dashboard RH :", err);
        setError("Impossible de charger les données RH.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const totalEmployes = employes.length;

  const employesActifs = employes.filter(
    (e) => String(e.statut || "").toUpperCase() === "ACTIF"
  ).length;

  const contratsActifs = contrats.filter(
    (c) => String(c.statut || "").toUpperCase() === "ACTIF"
  ).length;

  const congesEnAttente = conges.filter(
    (c) => String(c.statut || "").toUpperCase() === "EN_ATTENTE"
  );

  const todayStr = new Date().toISOString().slice(0, 10);

  const pointagesAujourdhui = pointages.filter(
    (p) => p.date === todayStr
  ).length;

  if (loading) {
    return (
      <div className="rh-dashboard-loading">
        <div className="rh-loading-spinner"></div>
        <p>Chargement du tableau de bord RH...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rh-dashboard-error">
        <div className="rh-error-icon">!</div>
        <h2>Une erreur est survenue</h2>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="rh-dashboard-content">

      <section className="rh-welcome">
        <div>
          <p className="rh-welcome-label">RESSOURCES HUMAINES</p>
          <h1>Bonjour, {user?.prenom || "Responsable RH"}</h1>
          <p>Voici un aperçu de l'activité RH de votre plateforme BTP.</p>
        </div>

        <div className="rh-date">
          <span>▣</span>
          {new Date().toLocaleDateString("fr-FR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          })}
        </div>
      </section>

      <section className="rh-stats-grid">

        <div className="rh-stat-card">
          <div className="rh-stat-icon">♙</div>
          <div>
            <span>Employés</span>
            <strong>{totalEmployes}</strong>
            <small>{employesActifs} actif(s)</small>
          </div>
        </div>

        <div className="rh-stat-card">
          <div className="rh-stat-icon">▣</div>
          <div>
            <span>Contrats actifs</span>
            <strong>{contratsActifs}</strong>
            <small>sur {contrats.length} au total</small>
          </div>
        </div>

        <div className="rh-stat-card">
          <div className="rh-stat-icon">▤</div>
          <div>
            <span>Congés en attente</span>
            <strong>{congesEnAttente.length}</strong>
            <small>à valider</small>
          </div>
        </div>

        <div className="rh-stat-card">
          <div className="rh-stat-icon">◷</div>
          <div>
            <span>Pointages aujourd'hui</span>
            <strong>{pointagesAujourdhui}</strong>
            <small>employé(s) pointé(s)</small>
          </div>
        </div>

      </section>

      <section className="rh-main-grid">

        <div className="rh-card">
          <div className="rh-card-header">
            <div>
              <h2>Congés en attente de validation</h2>
              <p>Demandes nécessitant votre action</p>
            </div>
            <Link to="/rh/conges" className="rh-card-link">Voir tout →</Link>
          </div>

          <div className="rh-conge-list">
            {congesEnAttente.length > 0 ? (
              congesEnAttente.slice(0, 5).map((conge) => (
                <div className="rh-conge-item" key={conge.id_absence}>
                  <div className="rh-conge-icon">▤</div>
                  <div className="rh-conge-info">
                    <strong>{conge.employe_prenom} {conge.employe_nom}</strong>
                    <span>{conge.type} · {conge.date_debut} → {conge.date_fin}</span>
                  </div>
                  <span className="rh-conge-status">En attente</span>
                </div>
              ))
            ) : (
              <div className="rh-empty">Aucun congé en attente.</div>
            )}
          </div>
        </div>

        <div className="rh-card">
          <div className="rh-card-header">
            <div>
              <h2>Employés récents</h2>
              <p>Derniers employés enregistrés</p>
            </div>
            <Link to="/rh/employes" className="rh-card-link">Voir tout →</Link>
          </div>

          <div className="rh-employe-list">
            {employes.length > 0 ? (
              employes.slice(0, 5).map((employe) => (
                <div className="rh-employe-item" key={employe.id_employe}>
                  <div className="rh-employe-avatar">
                    {`${(employe.prenom || "").charAt(0)}${(employe.nom || "").charAt(0)}`.toUpperCase() || "E"}
                  </div>
                  <div className="rh-employe-info">
                    <strong>{employe.prenom} {employe.nom}</strong>
                    <span>{employe.poste || "Poste non défini"}</span>
                  </div>
                  <span className={
                    "rh-employe-status " +
                    (String(employe.statut || "").toUpperCase() === "ACTIF" ? "active" : "inactive")
                  }>
                    {employe.statut || "Non défini"}
                  </span>
                </div>
              ))
            ) : (
              <div className="rh-empty">Aucun employé enregistré.</div>
            )}
          </div>
        </div>

      </section>

    </div>
  );
}

export default RHDashboard;