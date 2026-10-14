import { useNavigate } from "react-router-dom";
import "./StockHome.css";

function StockHome() {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Matériaux",
      description:
        "Gérer les matériaux disponibles et suivre les niveaux de stock.",
      icon: "📦",
      path: "/admin/stock/materiaux",
    },
    {
      title: "Fournisseurs",
      description:
        "Gérer les fournisseurs et consulter leurs informations.",
      icon: "🏢",
      path: "/admin/stock/fournisseurs",
    },
    {
      title: "Achats",
      description:
        "Gérer les achats de matériaux et suivre les commandes.",
      icon: "🛒",
      path: "/admin/stock/achats",
    },
    {
      title: "Mouvements de stock",
      description:
        "Suivre les entrées et sorties de matériaux.",
      icon: "🔄",
      path: "/admin/stock/mouvements",
    },
  ];

  return (
    <div className="stock-home">
      <div className="stock-home-header">
        <div>
          <h1>Gestion du stock</h1>
          <p>
            Gérez les matériaux, fournisseurs, achats et mouvements
            de stock.
          </p>
        </div>
      </div>

      <div className="stock-sections">
        {sections.map((section) => (
          <div className="stock-card" key={section.path}>
            <div className="stock-card-icon">
              {section.icon}
            </div>

            <div className="stock-card-content">
              <h2>{section.title}</h2>

              <p>{section.description}</p>

              <button
                className="stock-card-button"
                onClick={() => navigate(section.path)}
              >
                Consulter →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StockHome;