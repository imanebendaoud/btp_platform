import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getDepense } from "../../../services/financeService";
import "./DepenseDetail.css";

function DepenseDetail() {
  const { id } = useParams();

  const [depense, setDepense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadDepense();
  }, [id]);

  const loadDepense = async () => {
    try {
      setLoading(true);

      const data = await getDepense(id);

      setDepense(data);
    } catch (err) {
      console.error(err);
      setError("Impossible de charger la dépense.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="depense-detail-page">
        Chargement...
      </div>
    );
  }

  if (error || !depense) {
    return (
      <div className="depense-detail-page">

        <div className="depense-detail-error">
          {error || "Dépense introuvable."}
        </div>

        <Link
          to="/admin/finance/depenses"
          className="back-button"
        >
          ← Retour aux dépenses
        </Link>

      </div>
    );
  }

  return (
    <div className="depense-detail-page">

      <div className="depense-detail-header">

        <div>
          <h1>Détail de la dépense</h1>
          <p>
            Dépense #{depense.id_depense}
          </p>
        </div>

        <Link
          to="/admin/finance/depenses"
          className="back-button"
        >
          ← Retour
        </Link>

      </div>

      <div className="depense-detail-card">

        <div className="detail-row">
          <span>ID</span>
          <strong>
            #{depense.id_depense}
          </strong>
        </div>

        <div className="detail-row">
          <span>Projet</span>
          <strong>
            Projet #{depense.id_projet}
          </strong>
        </div>

        <div className="detail-row">
          <span>Catégorie</span>
          <strong>
            {depense.categorie || "-"}
          </strong>
        </div>

        <div className="detail-row">
          <span>Montant</span>
          <strong className="detail-amount">
            {Number(
              depense.montant || 0
            ).toLocaleString("fr-FR")} DH
          </strong>
        </div>

        <div className="detail-row">
          <span>Date de dépense</span>
          <strong>
            {depense.date_depense || "-"}
          </strong>
        </div>

      </div>

      <div className="detail-text-card">

        <h2>Description</h2>

        <p>
          {depense.description ||
            "Aucune description fournie."}
        </p>

      </div>

      <div className="detail-text-card">

        <h2>Justification</h2>

        <p>
          {depense.justification ||
            "Aucune justification fournie."}
        </p>

      </div>

      <div className="detail-text-card">

        <h2>Pièce justificative</h2>

        {depense.piece_justificative ? (
          <p>
            {depense.piece_justificative}
          </p>
        ) : (
          <p className="no-document">
            Aucune pièce justificative enregistrée.
          </p>
        )}

      </div>

    </div>
  );
}

export default DepenseDetail;