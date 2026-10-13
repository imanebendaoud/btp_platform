import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  getMateriau,
} from "../../../services/stockService";

import "./MateriauDetail.css";

function MateriauDetail() {
  const { id } = useParams();

  const [materiau, setMateriau] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadMateriau = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMateriau(id);

        setMateriau(data);
      } catch (err) {
        console.error(
          "Erreur chargement matériau :",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Impossible de charger le matériau."
        );
      } finally {
        setLoading(false);
      }
    };

    loadMateriau();
  }, [id]);

  const getEtat = () => {
    if (!materiau) {
      return "NORMAL";
    }

    return Number(materiau.stock_actuel) <=
      Number(materiau.stock_minimum)
      ? "ALERTE"
      : "NORMAL";
  };

  if (loading) {
    return (
      <div className="materiau-detail-page">
        <div className="detail-loading">
          Chargement...
        </div>
      </div>
    );
  }

  if (error || !materiau) {
    return (
      <div className="materiau-detail-page">

        <Link
          to="/admin/stock/materiaux"
          className="back-link"
        >
          ← Retour aux matériaux
        </Link>

        <div className="detail-error">
          {error || "Matériau introuvable."}
        </div>

      </div>
    );
  }

  const etat = getEtat();

  return (
    <div className="materiau-detail-page">

      {/* HEADER */}

      <div className="detail-header">

        <div>

          <Link
            to="/admin/stock/materiaux"
            className="back-link"
          >
            ← Retour aux matériaux
          </Link>

          <div className="page-kicker">
            DÉTAIL DU MATÉRIAU
          </div>

          <div className="title-line">

            <div>

              <h1>
                {materiau.nom}
              </h1>

              <span className="material-reference">
                #{materiau.id_materiau}
              </span>

            </div>

            {etat === "ALERTE" ? (
              <span className="detail-status alert">
                ⚠ Stock faible
              </span>
            ) : (
              <span className="detail-status normal">
                ✓ Stock normal
              </span>
            )}

          </div>

        </div>

      </div>

      {/* INFORMATIONS */}

      <div className="detail-grid">

        <div className="detail-card">

          <div className="card-title">
            Informations générales
          </div>

          <div className="info-row">

            <span>Nom</span>

            <strong>
              {materiau.nom}
            </strong>

          </div>

          <div className="info-row">

            <span>Unité</span>

            <strong>
              {materiau.unite}
            </strong>

          </div>

          <div className="info-row">

            <span>Identifiant</span>

            <strong>
              #{materiau.id_materiau}
            </strong>

          </div>

        </div>

        {/* STOCK */}

        <div className="detail-card">

          <div className="card-title">
            État du stock
          </div>

          <div className="stock-number">

            {materiau.stock_actuel}

            <span>
              {materiau.unite}
            </span>

          </div>

          <div className="stock-label">
            Stock actuel
          </div>

          <div className="stock-minimum">

            <span>
              Seuil minimum
            </span>

            <strong>
              {materiau.stock_minimum}{" "}
              {materiau.unite}
            </strong>

          </div>

        </div>

      </div>

      {/* ALERTE */}

      {etat === "ALERTE" && (
        <div className="stock-alert-box">

          <div className="alert-icon">
            ⚠
          </div>

          <div>

            <strong>
              Niveau de stock faible
            </strong>

            <p>
              Le stock actuel est inférieur ou égal
              au seuil minimum défini pour ce matériau.
            </p>

          </div>

        </div>
      )}

    </div>
  );
}

export default MateriauDetail;