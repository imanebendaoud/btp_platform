import React from "react";
import "./ChefDashboard.css";

function ChefDashboard() {
  return (
    <div className="chef-dashboard">

      {/* ================= SIDEBAR ================= */}
      <aside className="sidebar">

        <div className="sidebar-logo">
          <div className="logo-icon">B</div>
          <div className="logo-text">
            <span>BTP</span>
            <small>Management</small>
          </div>
        </div>

        <div className="sidebar-section">
          <p className="menu-title">MENU PRINCIPAL</p>

          <a className="menu-item active">
            <span className="menu-icon">⌂</span>
            <span>Dashboard</span>
          </a>

          <a className="menu-item">
            <span className="menu-icon">▣</span>
            <span>Mes projets</span>
          </a>

          <a className="menu-item">
            <span className="menu-icon">♙</span>
            <span>Équipe</span>
          </a>

          <a className="menu-item">
            <span className="menu-icon">⚙</span>
            <span>Équipements</span>
          </a>

          <a className="menu-item">
            <span className="menu-icon">▤</span>
            <span>Stock</span>
          </a>

          <a className="menu-item">
            <span className="menu-icon">€</span>
            <span>Budget & dépenses</span>
          </a>

          <a className="menu-item">
            <span className="menu-icon">▥</span>
            <span>Rapports</span>
          </a>
        </div>

        <div className="sidebar-section">
          <p className="menu-title">AUTRES</p>

          <a className="menu-item">
            <span className="menu-icon">●</span>
            <span>Notifications</span>
            <span className="notification-count">3</span>
          </a>

          <a className="menu-item">
            <span className="menu-icon">⚙</span>
            <span>Paramètres</span>
          </a>
        </div>

        <div className="sidebar-footer">
          <div className="help-box">
            <div className="help-icon">?</div>
            <div>
              <strong>Besoin d'aide ?</strong>
              <p>Contactez l'administrateur</p>
            </div>
          </div>
        </div>

      </aside>


      {/* ================= MAIN ================= */}
      <main className="main-content">

        {/* ================= TOPBAR ================= */}
        <header className="topbar">

          <div className="search-container">
            <span className="search-icon">⌕</span>
            <input
              type="text"
              placeholder="Rechercher un projet, chantier..."
            />
          </div>

          <div className="topbar-right">

            <button className="notification-button">
              <span>♢</span>
              <i>3</i>
            </button>

            <div className="profile-divider"></div>

            <div className="profile">

              <div className="profile-avatar">
                C
              </div>

              <div className="profile-info">
                <strong>Chef de chantier</strong>
                <span>Chef de projet</span>
              </div>

              <span className="profile-arrow">⌄</span>

            </div>

          </div>

        </header>


        {/* ================= CONTENT ================= */}
        <section className="dashboard-content">

          {/* Welcome */}
          <div className="welcome-section">

            <div>
              <p className="welcome-label">TABLEAU DE BORD</p>

              <h1>
                Bonjour, Chef 
              </h1>

              <p className="welcome-description">
                Voici un aperçu de l'activité de vos chantiers aujourd'hui.
              </p>
            </div>

            <button className="date-button">
              <span>▣</span>
              24 Septembre 2026
            </button>

          </div>


          {/* ================= STATISTICS ================= */}
          <div className="stats-grid">

            <div className="stat-card">

              <div className="stat-top">
                <div className="stat-icon blue">
                  ▣
                </div>

                <span className="stat-trend positive">
                  ↑ 8.2%
                </span>
              </div>

              <div className="stat-content">
                <span className="stat-label">Total projets</span>
                <h2>12</h2>
                <p>Projets assignés</p>
              </div>

            </div>


            <div className="stat-card">

              <div className="stat-top">
                <div className="stat-icon cyan">
                  ◈
                </div>

                <span className="stat-trend positive">
                  ↑ 5.4%
                </span>
              </div>

              <div className="stat-content">
                <span className="stat-label">Projets en cours</span>
                <h2>5</h2>
                <p>Actuellement actifs</p>
              </div>

            </div>


            <div className="stat-card">

              <div className="stat-top">
                <div className="stat-icon purple">
                  ◔
                </div>

                <span className="stat-trend positive">
                  ↑ 3.1%
                </span>
              </div>

              <div className="stat-content">
                <span className="stat-label">Avancement moyen</span>
                <h2>68<span>%</span></h2>
                <p>Sur tous les projets</p>
              </div>

            </div>


            <div className="stat-card warning-card">

              <div className="stat-top">
                <div className="stat-icon yellow">
                  !
                </div>

                <span className="stat-trend warning">
                  À vérifier
                </span>
              </div>

              <div className="stat-content">
                <span className="stat-label">Alertes</span>
                <h2>3</h2>
                <p>Nécessitent votre attention</p>
              </div>

            </div>

          </div>


          {/* ================= MAIN GRID ================= */}
          <div className="main-grid">

            {/* PROJECTS */}
            <div className="dashboard-card projects-card">

              <div className="card-header">

                <div>
                  <h3>Projets en cours</h3>
                  <p>Suivi de l'avancement de vos chantiers</p>
                </div>

                <button className="view-all">
                  Voir tout →
                </button>

              </div>


              <div className="projects-list">

                {/* Project 1 */}
                <div className="project-item">

                  <div className="project-header">

                    <div className="project-name">
                      <div className="project-symbol blue-bg">
                        P
                      </div>

                      <div>
                        <strong>Construction Résidence A</strong>
                        <span>Laâyoune · Projet #PRJ-001</span>
                      </div>
                    </div>

                    <span className="status active-status">
                      En cours
                    </span>

                  </div>

                  <div className="project-progress">

                    <div className="progress-label">
                      <span>Avancement</span>
                      <strong>75%</strong>
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-value blue-progress"
                        style={{ width: "75%" }}
                      ></div>
                    </div>

                  </div>

                  <div className="project-footer">
                    <span>📅 Fin prévue : 15 Déc. 2026</span>
                    <span>👷 24 employés</span>
                  </div>

                </div>


                {/* Project 2 */}
                <div className="project-item">

                  <div className="project-header">

                    <div className="project-name">
                      <div className="project-symbol cyan-bg">
                        P
                      </div>

                      <div>
                        <strong>Infrastructure B</strong>
                        <span>Laâyoune · Projet #PRJ-002</span>
                      </div>
                    </div>

                    <span className="status active-status">
                      En cours
                    </span>

                  </div>

                  <div className="project-progress">

                    <div className="progress-label">
                      <span>Avancement</span>
                      <strong>42%</strong>
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-value cyan-progress"
                        style={{ width: "42%" }}
                      ></div>
                    </div>

                  </div>

                  <div className="project-footer">
                    <span>📅 Fin prévue : 28 Fév. 2027</span>
                    <span>👷 18 employés</span>
                  </div>

                </div>


                {/* Project 3 */}
                <div className="project-item">

                  <div className="project-header">

                    <div className="project-name">
                      <div className="project-symbol purple-bg">
                        P
                      </div>

                      <div>
                        <strong>Chantier El Marsa</strong>
                        <span>El Marsa · Projet #PRJ-003</span>
                      </div>
                    </div>

                    <span className="status active-status">
                      En cours
                    </span>

                  </div>

                  <div className="project-progress">

                    <div className="progress-label">
                      <span>Avancement</span>
                      <strong>60%</strong>
                    </div>

                    <div className="progress-bar">
                      <div
                        className="progress-value purple-progress"
                        style={{ width: "60%" }}
                      ></div>
                    </div>

                  </div>

                  <div className="project-footer">
                    <span>📅 Fin prévue : 10 Jan. 2027</span>
                    <span>👷 31 employés</span>
                  </div>

                </div>

              </div>

            </div>


            {/* ACTIVITIES */}
            <div className="dashboard-card activity-card">

              <div className="card-header">

                <div>
                  <h3>Activités récentes</h3>
                  <p>Dernières actions effectuées</p>
                </div>

                <button className="more-button">•••</button>

              </div>


              <div className="activity-list">

                <div className="activity-item">

                  <div className="activity-icon money">
                    €
                  </div>

                  <div className="activity-content">
                    <strong>Nouvelle dépense</strong>
                    <span>
                      12 500 DH · Projet Résidence A
                    </span>
                    <small>Il y a 20 min</small>
                  </div>

                </div>


                <div className="activity-item">

                  <div className="activity-icon equipment">
                    ⚙
                  </div>

                  <div className="activity-content">
                    <strong>Maintenance équipement</strong>
                    <span>
                      Excavatrice EX-024
                    </span>
                    <small>Il y a 1 heure</small>
                  </div>

                </div>


                <div className="activity-item">

                  <div className="activity-icon employee">
                    ♙
                  </div>

                  <div className="activity-content">
                    <strong>Nouvel employé affecté</strong>
                    <span>
                      Projet Infrastructure B
                    </span>
                    <small>Il y a 2 heures</small>
                  </div>

                </div>


                <div className="activity-item">

                  <div className="activity-icon stock">
                    ▤
                  </div>

                  <div className="activity-content">
                    <strong>Stock mis à jour</strong>
                    <span>
                      Ciment · 150 sacs
                    </span>
                    <small>Il y a 3 heures</small>
                  </div>

                </div>

              </div>


              <button className="all-activities">
                Voir toutes les activités
              </button>

            </div>

          </div>


          {/* ================= BOTTOM GRID ================= */}
          <div className="bottom-grid">

            {/* ALERTS */}
            <div className="dashboard-card alerts-card">

              <div className="card-header">

                <div>
                  <h3>Alertes & Attention</h3>
                  <p>Éléments nécessitant votre intervention</p>
                </div>

                <span className="alert-number">3</span>

              </div>


              <div className="alert-list">

                <div className="alert-item warning-alert">

                  <div className="alert-icon">
                    !
                  </div>

                  <div>
                    <strong>Stock de ciment faible</strong>
                    <span>
                      Stock actuel : 45 sacs · Seuil : 100 sacs
                    </span>
                  </div>

                  <button>Voir</button>

                </div>


                <div className="alert-item danger-alert">

                  <div className="alert-icon">
                    !
                  </div>

                  <div>
                    <strong>Maintenance en retard</strong>
                    <span>
                      Camion TR-018 · Maintenance prévue
                    </span>
                  </div>

                  <button>Voir</button>

                </div>


                <div className="alert-item info-alert">

                  <div className="alert-icon">
                    i
                  </div>

                  <div>
                    <strong>Projet proche de l'échéance</strong>
                    <span>
                      Résidence A · 18 jours restants
                    </span>
                  </div>

                  <button>Voir</button>

                </div>

              </div>

            </div>


            {/* QUICK ACTIONS */}
            <div className="dashboard-card quick-card">

              <div className="card-header">

                <div>
                  <h3>Actions rapides</h3>
                  <p>Accès rapide aux fonctionnalités</p>
                </div>

              </div>


              <div className="quick-actions">

                <button className="quick-action">
                  <div className="quick-icon blue">
                    +
                  </div>
                  <span>Nouveau projet</span>
                </button>

                <button className="quick-action">
                  <div className="quick-icon green">
                    €
                  </div>
                  <span>Ajouter dépense</span>
                </button>

                <button className="quick-action">
                  <div className="quick-icon purple">
                    ▤
                  </div>
                  <span>Gérer le stock</span>
                </button>

                <button className="quick-action">
                  <div className="quick-icon orange">
                    ≡
                  </div>
                  <span>Rapport</span>
                </button>

              </div>

            </div>

          </div>


          {/* ================= AI SECTION ================= */}
          <div className="ai-card">

            <div className="ai-left">

              <div className="ai-icon">
                ✦
              </div>

              <div>
                <span className="ai-label">
                  INTELLIGENCE ARTIFICIELLE
                </span>

                <h3>
                  Assistant intelligent du chantier
                </h3>

                <p>
                  Analysez vos projets, détectez les risques de retard
                  et obtenez des recommandations basées sur vos données.
                </p>
              </div>

            </div>

            <button className="ai-button">
              Ouvrir l'assistant →
            </button>

          </div>

        </section>

      </main>

    </div>
  );
}

export default ChefDashboard;

