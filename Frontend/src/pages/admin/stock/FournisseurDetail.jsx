import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  getFournisseur,
  deleteFournisseur,
} from "../../../services/stockService";

import "./FournisseurDetail.css";

function FournisseurDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [fournisseur, setFournisseur] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFournisseur = async () => {
      try {
        const data = await getFournisseur(id);
        setFournisseur(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadFournisseur();
  }, [id]);

  const handleDelete = async () => {
    const confirmation = window.confirm(
      "Voulez-vous vraiment supprimer ce fournisseur ?"
    );

    if (!confirmation) return;

    try {
      await deleteFournisseur(id);
      navigate("/admin/stock/fournisseurs");
    } catch (error) {
      console.error(error);
      alert(
        error.response?.data?.detail ||
          "Impossible de supprimer ce fournisseur."
      );
    }
  };

  if (loading) {
    return <div className="detail-page">Chargement...</div>;
  }

  if (!fournisseur) {
    return (
      <div className="detail-page">
        <p>Fournisseur introuvable.</p>
      </div>
    );
  }

  return (
    <div className="detail-page">
      <div className="detail-header">
        <div>
          <h1>{fournisseur.nom}</h1>
          <p>Fournisseur #{fournisseur.id_fournisseur}</p>
        </div>

        <div className="detail-actions">
          <button
            className="btn-edit"
            onClick={() =>
              navigate(
                `/admin/stock/fournisseurs/${id}/modifier`
              )
            }
          >
            Modifier
          </button>

          <button className="btn-delete" onClick={handleDelete}>
            Supprimer
          </button>
        </div>
      </div>

      <div className="detail-card">
        <h2>Informations du fournisseur</h2>

        <div className="info-grid">
          <div>
            <span>Nom</span>
            <strong>{fournisseur.nom || "-"}</strong>
          </div>

          <div>
            <span>Téléphone</span>
            <strong>{fournisseur.telephone || "-"}</strong>
          </div>

          <div>
            <span>Email</span>
            <strong>{fournisseur.email || "-"}</strong>
          </div>

          <div>
            <span>Date de création</span>
            <strong>{fournisseur.date_creation || "-"}</strong>
          </div>

          <div>
            <span>Registre de commerce</span>
            <strong>{fournisseur.registre_commerce || "-"}</strong>
          </div>

          <div>
            <span>Identifiant fiscal</span>
            <strong>{fournisseur.identifiant_fiscal || "-"}</strong>
          </div>

          <div>
            <span>ICE</span>
            <strong>{fournisseur.ice || "-"}</strong>
          </div>

          <div className="full">
            <span>Adresse</span>
            <strong>{fournisseur.adresse || "-"}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FournisseurDetail;