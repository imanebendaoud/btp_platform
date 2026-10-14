import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getMouvement,
} from "../../../services/stockService";

import "./MouvementDetail.css";

function MouvementDetail() {
  const { id } = useParams();

  const [mouvement, setMouvement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMouvement = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMouvement(id);

        setMouvement(data);
      } catch (err) {
        console.error(
          "Erreur chargement mouvement :",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Impossible de charger le mouvement."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMouvement();
  }, [id]);

  if (loading) {
    return (
      <div className="movement-detail-page">
        <div className="detail-loading">
          Chargement...
        </div>
      </div>
    );
  }

  if (error || !mouvement) {
    return (
      <div className="movement-detail-page">

        <Link
          to="/admin/stock/mouvements"
          className="back-link"
        >
          ← Retour aux mouvements
        </Link>

        <div className="detail-error">
          {error || "Mouvement introuvable."}
        </div>

      </div>
    );
  }

  return (
    <div className="movement-detail-page">

      {/* HEADER */}

      <div className="detail-header">

        <div>

          <Link
            to="/admin/stock/mouvements"
            className="back-link"
          >
            ← Retour aux mouvements
          </Link>

          <div className="page-kicker">
            DÉTAIL DU MOUVEMENT
          </div>

          <h1>
            Mouvement #{mouvement.id_mouvement}
          </h1>

          <p>
            Consultation du mouvement de stock
          </p>

        </div>

      </div>

      {/* INFORMATIONS */}

      <div className="detail-card">

        <div className="info-grid">

          <div>
            <span>Matériau</span>

            <strong>
              #{mouvement.id_materiau}
            </strong>
          </div>

          <div>
            <span>Projet</span>

            <strong>
              {mouvement.id_projet
                ? `#${mouvement.id_projet}`
                : "-"}
            </strong>
          </div>

          <div>
            <span>Type</span>

            <strong
              className={
                mouvement.type_mouvement === "ENTREE"
                  ? "entry"
                  : mouvement.type_mouvement === "SORTIE"
                  ? "exit"
                  : ""
              }
            >
              {mouvement.type_mouvement}
            </strong>
          </div>

          <div>
            <span>Quantité</span>

            <strong>
              {mouvement.quantite}
            </strong>
          </div>

          <div>
            <span>Date</span>

            <strong>
              {mouvement.date_mouvement
                ? new Date(
                    mouvement.date_mouvement
                  ).toLocaleString("fr-FR")
                : "-"}
            </strong>
          </div>

          <div className="full">
            <span>Motif</span>

            <strong>
              {mouvement.motif || "-"}
            </strong>
          </div>

        </div>

      </div>

    </div>
  );
}

export default MouvementDetail;