import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { getAchat } from "../../../services/stockService";

import "./AchatDetail.css";

function AchatDetail() {
  const { id } = useParams();

  const [achat, setAchat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadAchat = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getAchat(id);

        setAchat(data);
      } catch (err) {
        console.error("Erreur chargement achat :", err);

        setError(
          err.response?.data?.detail ||
            "Impossible de charger les informations de l'achat."
        );
      } finally {
        setLoading(false);
      }
    };

    loadAchat();
  }, [id]);

  if (loading) {
    return (
      <div className="achat-detail-page">
        <div className="detail-message">
          Chargement des informations de l'achat...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="achat-detail-page">
        <div className="detail-error">
          <h2>Erreur</h2>
          <p>{error}</p>

          <Link
            to="/admin/stock/achats"
            className="btn-back"
          >
            ← Retour aux achats
          </Link>
        </div>
      </div>
    );
  }

  if (!achat) {
    return (
      <div className="achat-detail-page">
        <div className="detail-error">
          <h2>Achat introuvable</h2>

          <p>
            L'achat demandé n'existe pas ou n'est plus disponible.
          </p>

          <Link
            to="/admin/stock/achats"
            className="btn-back"
          >
            ← Retour aux achats
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="achat-detail-page">

      {/* HEADER */}
      <div className="detail-header">

        <div>
          <div className="page-kicker">
            GESTION DU STOCK
          </div>

          <h1>
            Détail de l'achat
          </h1>

          <p>
            Consultation des informations de l'achat
            <strong> {achat.reference}</strong>
          </p>
        </div>


      </div>

      {/* INFORMATIONS PRINCIPALES */}
      <div className="detail-card">

        <div className="card-title">
          <div>
            <span className="section-label">
              ACHAT
            </span>

            <h2>
              {achat.reference || `Achat #${achat.id_achat}`}
            </h2>
          </div>

          <span className="status-badge">
            {achat.statut || "Non renseigné"}
          </span>
        </div>

        <div className="detail-grid">

          <div className="detail-item">
            <span className="detail-label">
              ID achat
            </span>

            <strong>
              #{achat.id_achat}
            </strong>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              Référence
            </span>

            <strong>
              {achat.reference || "-"}
            </strong>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              Date d'achat
            </span>

            <strong>
              {achat.date_achat || "-"}
            </strong>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              Statut
            </span>

            <strong>
              {achat.statut || "-"}
            </strong>
          </div>

        </div>

      </div>

      {/* PROJET / FOURNISSEUR / MATÉRIAU */}
      <div className="detail-card">

        <div className="section-header">
          <span className="section-label">
            INFORMATIONS
          </span>

          <h2>
            Projet et fournisseurs
          </h2>
        </div>

        <div className="detail-grid">

          <div className="detail-item">
            <span className="detail-label">
              Projet
            </span>

            <strong>
              {achat.id_projet
                ? `Projet #${achat.id_projet}`
                : "-"}
            </strong>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              Fournisseur
            </span>

            <strong>
              {achat.id_fournisseur
                ? `Fournisseur #${achat.id_fournisseur}`
                : "-"}
            </strong>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              Matériau
            </span>

            <strong>
              {achat.id_materiau
                ? `Matériau #${achat.id_materiau}`
                : "-"}
            </strong>
          </div>

          <div className="detail-item">
            <span className="detail-label">
              Unité
            </span>

            <strong>
              {achat.unite || "-"}
            </strong>
          </div>

        </div>

      </div>

      {/* INFORMATIONS FINANCIÈRES */}
      <div className="detail-card">

        <div className="section-header">
          <span className="section-label">
            FINANCES
          </span>

          <h2>
            Détails du montant
          </h2>
        </div>

        <div className="financial-grid">

          <div className="financial-item">
            <span>
              Quantité
            </span>

            <strong>
              {achat.quantite || "0"}{" "}
              {achat.unite || ""}
            </strong>
          </div>

          <div className="financial-item">
            <span>
              Prix unitaire
            </span>

            <strong>
              {Number(
                achat.prix_unitaire || 0
              ).toFixed(2)}{" "}
              DH
            </strong>
          </div>

          <div className="financial-item total">
            <span>
              Montant total
            </span>

            <strong>
              {Number(
                achat.montant_total || 0
              ).toFixed(2)}{" "}
              DH
            </strong>
          </div>

        </div>

      </div>

      {/* FACTURE */}
      <div className="detail-card">

        <div className="section-header">
          <span className="section-label">
            DOCUMENT
          </span>

          <h2>
            Facture
          </h2>
        </div>

        {achat.facture ? (
          <div className="invoice-box">

            <div className="invoice-icon">
              🧾
            </div>

            <div className="invoice-content">
              <strong>
                Facture disponible
              </strong>

              <p>
                {achat.facture}
              </p>
            </div>

          </div>
        ) : (
          <div className="invoice-empty">

            <span className="invoice-empty-icon">
              📄
            </span>

            <div>
              <strong>
                Aucune facture enregistrée
              </strong>

              <p>
                Aucune information de facture
                n'est actuellement disponible.
              </p>
            </div>

          </div>
        )}

      </div>

      {/* ACTIONS */}
      <div className="detail-actions">

        <Link
          to="/admin/stock/achats"
          className="btn-back-bottom"
        >
          ← Retour à la liste
        </Link>

      </div>

    </div>
  );
}

export default AchatDetail;


