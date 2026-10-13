import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
  getEmployes,
  getAffectationsEmployes,
  getContrats,
  getCongesAbsences,
  getPointages,
} from "../../../services/hrService";

import "./HRDashboard.css";

const sections = [
  {
    title: "Employés",
    description: "Consulter les informations des employés.",
    path: "/admin/rh/employes",
    icon: "👥",
  },
  {
    title: "Affectations",
    description: "Consulter les affectations aux projets.",
    path: "/admin/rh/affectations",
    icon: "🏗️",
  },
  {
    title: "Contrats",
    description: "Consulter les informations contractuelles.",
    path: "/admin/rh/contrats",
    icon: "📄",
  },
  {
    title: "Congés et absences",
    description: "Consulter les demandes et les périodes d'absence.",
    path: "/admin/rh/conges-absences",
    icon: "📅",
  },
  {
    title: "Pointages",
    description: "Consulter l'historique des présences.",
    path: "/admin/rh/pointages",
    icon: "🕒",
  },
];

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

function HRDashboard() {
  const [stats, setStats] = useState({
    employes: 0,
    affectations: 0,
    contrats: 0,
    conges: 0,
    pointages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setLoading(true);

        const results = await Promise.all([
          getEmployes(),
          getAffectationsEmployes(),
          getContrats(),
          getCongesAbsences(),
          getPointages(),
        ]);

        if (!active) return;

        setStats({
          employes: normalizeList(results[0]).length,
          affectations: normalizeList(results[1]).length,
          contrats: normalizeList(results[2]).length,
          conges: normalizeList(results[3]).length,
          pointages: normalizeList(results[4]).length,
        });

        setError("");
      } catch (err) {
        console.error("Erreur chargement RH :", err);
        if (active) {
          setError(
            err.message ||
              "Impossible de charger les données RH."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);

  const cards = [
    {
      label: "Employés",
      value: stats.employes,
      icon: "👥",
    },
    {
      label: "Affectations",
      value: stats.affectations,
      icon: "🏗️",
    },
    {
      label: "Contrats",
      value: stats.contrats,
      icon: "📄",
    },
    {
      label: "Congés et absences",
      value: stats.conges,
      icon: "📅",
    },
    {
      label: "Pointages",
      value: stats.pointages,
      icon: "🕒",
    },
  ];

  return (
    <main className="hr-dashboard">
      <header className="hr-dashboard-header">
        <div>
          <p className="hr-eyebrow">GESTION DU PERSONNEL</p>
          <h1>Ressources humaines</h1>
          <p>
            Vue générale du personnel et des activités RH.
          </p>
        </div>
      </header>

      {error && (
        <div className="hr-error">
          <strong>Erreur de chargement</strong>
          <p>{error}</p>
          <small>
            Vérifie que Django fonctionne, que l'URL API est correcte
            et que ta session est toujours valide.
          </small>
        </div>
      )}

      <section className="hr-stats">
        {cards.map((card) => (
          <article className="hr-stat-card" key={card.label}>
            <div className="hr-stat-top">
              <span>{card.label}</span>
              <span className="hr-stat-icon">{card.icon}</span>
            </div>

            <strong>
              {loading ? "—" : card.value}
            </strong>

            <small>Enregistrements dans la base</small>
          </article>
        ))}
      </section>

      <section className="hr-section">
        <div className="hr-section-heading">
          <div>
            <h2>Gestion RH</h2>
            <p>Choisis une rubrique pour consulter ses informations.</p>
          </div>
          <span className="hr-readonly-label">
            Consultation uniquement
          </span>
        </div>

        <div className="hr-module-grid">
          {sections.map((section) => (
            <Link
              to={section.path}
              className="hr-module-card"
              key={section.path}
            >
              <span className="hr-module-icon">
                {section.icon}
              </span>

              <div className="hr-module-content">
                <h3>{section.title}</h3>
                <p>{section.description}</p>
              </div>

              <span className="hr-module-arrow">→</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}

export default HRDashboard;