import React from "react";
import "./ChefDashboard.css";

function ChefDashboard() {
  return (
    <div className="chef-dashboard-content">

      {/* WELCOME */}
      <div className="chef-welcome">
        <div>
          <p className="chef-welcome-label">TABLEAU DE BORD</p>
          <h1>Bonjour, Chef</h1>
          <p className="chef-welcome-description">
            Voici un aperçu de l'activité de vos chantiers aujourd'hui.
          </p>
        </div>

        <button className="chef-date-button">
          <span>▣</span>
          24 Septembre 2026
        </button>
      </div>

      {/* STATISTIQUES */}
      <div className="chef-stats-grid">

        <div className="chef-stat-card">
          <div className="chef-stat-top">
            <div className="chef-stat-icon">▣</div>
            <span className="chef-stat-trend positive">↑ 8.2%</span>
          </div>
          <div className="chef-stat-content">
            <span className="chef-stat-label">Total projets</span>
            <h2>12</h2>
            <p>Projets assignés</p>
          </div>
        </div>

        <div className="chef-stat-card">
          <div className="chef-stat-top">
            <div className="chef-stat-icon">◈</div>
            <span className="chef-stat-trend positive">↑ 5.4%</span>
          </div>
          <div className="chef-stat-content">
            <span className="chef-stat-label">Projets en cours</span>
            <h2>5</h2>
            <p>Actuellement actifs</p>
          </div>
        </div>

        <div className="chef-stat-card">
          <div className="chef-stat-top">
            <div className="chef-stat-icon">◔</div>
            <span className="chef-stat-trend positive">↑ 3.1%</span>
          </div>
          <div className="chef-stat-content">
            <span className="chef-stat-label">Avancement moyen</span>
            <h2>68<span>%</span></h2>
            <p>Sur tous les projets</p>
          </div>
        </div>

        <div className="chef-stat-card">
          <div className="chef-stat-top">
            <div className="chef-stat-icon">!</div>
            <span className="chef-stat-trend warning">À vérifier</span>
          </div>
          <div className="chef-stat-content">
            <span className="chef-stat-label">Alertes</span>
            <h2>3</h2>
            <p>Nécessitent votre attention</p>
          </div>
        </div>

      </div>

      {/* PROJETS + ACTIVITÉS */}
      <div className="chef-main-grid">

        <div className="chef-card">
          <div className="chef-card-header">
            <div>
              <h3>Projets en cours</h3>
              <p>Suivi de l'avancement de vos chantiers</p>
            </div>
            <button className="chef-view-all">Voir tout →</button>
          </div>

          <div className="chef-projects-list">

            <div className="chef-project-item">
              <div className="chef-project-top">
                <div className="chef-project-symbol">P</div>
                <div className="chef-project-name">
                  <strong>Construction Résidence A</strong>
                  <span>Laâyoune · Projet #PRJ-001</span>
                </div>
                <span className="chef-project-status chef-active-status">En cours</span>
              </div>

              <div className="chef-progress-label">
                <span>Avancement</span>
                <strong>75%</strong>
              </div>
              <div className="chef-progress-bar">
                <div className="chef-progress-fill" style={{ width: "75%" }}></div>
              </div>

              <div className="chef-project-footer">
                <span>📅 Fin prévue : 15 Déc. 2026</span>
                <span>👷 24 employés</span>
              </div>
            </div>

            <div className="chef-project-item">
              <div className="chef-project-top">
                <div className="chef-project-symbol">P</div>
                <div className="chef-project-name">
                  <strong>Infrastructure B</strong>
                  <span>Laâyoune · Projet #PRJ-002</span>
                </div>
                <span className="chef-project-status chef-active-status">En cours</span>
              </div>

              <div className="chef-progress-label">
                <span>Avancement</span>
                <strong>42%</strong>
              </div>
              <div className="chef-progress-bar">
                <div className="chef-progress-fill" style={{ width: "42%" }}></div>
              </div>

              <div className="chef-project-footer">
                <span>📅 Fin prévue : 28 Fév. 2027</span>
                <span>👷 18 employés</span>
              </div>
            </div>

            <div className="chef-project-item">
              <div className="chef-project-top">
                <div className="chef-project-symbol">P</div>
                <div className="chef-project-name">
                  <strong>Chantier El Marsa</strong>
                  <span>El Marsa · Projet #PRJ-003</span>
                </div>
                <span className="chef-project-status chef-active-status">En cours</span>
              </div>

              <div className="chef-progress-label">
                <span>Avancement</span>
                <strong>60%</strong>
              </div>
              <div className="chef-progress-bar">
                <div className="chef-progress-fill" style={{ width: "60%" }}></div>
              </div>

              <div className="chef-project-footer">
                <span>📅 Fin prévue : 10 Jan. 2027</span>
                <span>👷 31 employés</span>
              </div>
            </div>

          </div>
        </div>

        <div className="chef-card">
          <div className="chef-card-header">
            <div>
              <h3>Activités récentes</h3>
              <p>Dernières actions effectuées</p>
            </div>
            <button className="chef-more-button">•••</button>
          </div>

          <div className="chef-activities-list">

            <div className="chef-activity-item">
              <div className="chef-activity-icon">€</div>
              <div className="chef-activity-content">
                <strong>Nouvelle dépense</strong>
                <span>12 500 DH · Projet Résidence A</span>
                <small>Il y a 20 min</small>
              </div>
            </div>

            <div className="chef-activity-item">
              <div className="chef-activity-icon">⚙</div>
              <div className="chef-activity-content">
                <strong>Maintenance équipement</strong>
                <span>Excavatrice EX-024</span>
                <small>Il y a 1 heure</small>
              </div>
            </div>

            <div className="chef-activity-item">
              <div className="chef-activity-icon">♙</div>
              <div className="chef-activity-content">
                <strong>Nouvel employé affecté</strong>
                <span>Projet Infrastructure B</span>
                <small>Il y a 2 heures</small>
              </div>
            </div>

            <div className="chef-activity-item">
              <div className="chef-activity-icon">▤</div>
              <div className="chef-activity-content">
                <strong>Stock mis à jour</strong>
                <span>Ciment · 150 sacs</span>
                <small>Il y a 3 heures</small>
              </div>
            </div>

          </div>

          <button className="chef-all-activities">Voir toutes les activités</button>
        </div>

      </div>

      {/* ALERTES + ACTIONS */}
      <div className="chef-bottom-grid">

        <div className="chef-card">
          <div className="chef-card-header">
            <div>
              <h3>Alertes & Attention</h3>
              <p>Éléments nécessitant votre intervention</p>
            </div>
            <span className="chef-alert-number">3</span>
          </div>

          <div className="chef-alerts-list">

            <div className="chef-alert-item chef-warning-alert">
              <div className="chef-alert-icon">!</div>
              <div className="chef-alert-content">
                <strong>Stock de ciment faible</strong>
                <span>Stock actuel : 45 sacs · Seuil : 100 sacs</span>
              </div>
              <button>Voir</button>
            </div>

            <div className="chef-alert-item chef-danger-alert">
              <div className="chef-alert-icon">!</div>
              <div className="chef-alert-content">
                <strong>Maintenance en retard</strong>
                <span>Camion TR-018 · Maintenance prévue</span>
              </div>
              <button>Voir</button>
            </div>

            <div className="chef-alert-item chef-info-alert">
              <div className="chef-alert-icon">i</div>
              <div className="chef-alert-content">
                <strong>Projet proche de l'échéance</strong>
                <span>Résidence A · 18 jours restants</span>
              </div>
              <button>Voir</button>
            </div>

          </div>
        </div>

        <div className="chef-card">
          <div className="chef-card-header">
            <div>
              <h3>Actions rapides</h3>
              <p>Accès rapide aux fonctionnalités</p>
            </div>
          </div>

          <div className="chef-quick-actions">
            <button className="chef-quick-action">
              <div className="chef-quick-icon">+</div>
              <span>Nouveau projet</span>
            </button>
            <button className="chef-quick-action">
              <div className="chef-quick-icon">€</div>
              <span>Ajouter dépense</span>
            </button>
            <button className="chef-quick-action">
              <div className="chef-quick-icon">▤</div>
              <span>Gérer le stock</span>
            </button>
            <button className="chef-quick-action">
              <div className="chef-quick-icon">≡</div>
              <span>Rapport</span>
            </button>
          </div>
        </div>

      </div>

      {/* AI */}
      <div className="chef-ai-card">
        <div className="chef-ai-icon">✦</div>
        <div className="chef-ai-content">
          <span className="chef-ai-label">INTELLIGENCE ARTIFICIELLE</span>
          <h3>Assistant intelligent du chantier</h3>
          <p>
            Analysez vos projets, détectez les risques de retard
            et obtenez des recommandations basées sur vos données.
          </p>
        </div>
        <button className="chef-ai-button">Ouvrir l'assistant →</button>
      </div>

    </div>
  );
}

export default ChefDashboard;