import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createFournisseur,
  getFournisseur,
  updateFournisseur,
} from "../../../services/stockService";

import "./FournisseurForm.css";

function FournisseurForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    nom: "",
    telephone: "",
    email: "",
    adresse: "",
    registre_commerce: "",
    identifiant_fiscal: "",
    ice: "",
    date_creation: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;

    const loadFournisseur = async () => {
      try {
        const data = await getFournisseur(id);

        setFormData({
          nom: data.nom || "",
          telephone: data.telephone || "",
          email: data.email || "",
          adresse: data.adresse || "",
          registre_commerce: data.registre_commerce || "",
          identifiant_fiscal: data.identifiant_fiscal || "",
          ice: data.ice || "",
          date_creation: data.date_creation || "",
        });
      } catch (err) {
        console.error(err);
        setError("Impossible de charger le fournisseur.");
      } finally {
        setLoadingData(false);
      }
    };

    loadFournisseur();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nom.trim()) {
      setError("Le nom du fournisseur est obligatoire.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = {
        nom: formData.nom,
        telephone: formData.telephone || null,
        email: formData.email || null,
        adresse: formData.adresse || null,
        registre_commerce: formData.registre_commerce || null,
        identifiant_fiscal: formData.identifiant_fiscal || null,
        ice: formData.ice || null,
        date_creation: formData.date_creation || null,
      };

      if (isEdit) {
        await updateFournisseur(id, data);
      } else {
        await createFournisseur(data);
      }

      navigate("/admin/stock/fournisseurs");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Une erreur est survenue lors de l'enregistrement."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="form-page">Chargement...</div>;
  }

  return (
    <div className="form-page">
      <div className="form-header">
        <div>
          <h1>
            {isEdit ? "Modifier le fournisseur" : "Nouveau fournisseur"}
          </h1>

          <p>
            {isEdit
              ? "Modifier les informations du fournisseur"
              : "Ajouter un fournisseur de matériaux"}
          </p>
        </div>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="form-grid">
          <div className="form-group">
            <label>Nom *</label>

            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              placeholder="Nom du fournisseur"
              required
            />
          </div>

          <div className="form-group">
            <label>Téléphone</label>

            <input
              type="text"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              placeholder="Téléphone"
            />
          </div>

          <div className="form-group">
            <label>Email</label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@fournisseur.com"
            />
          </div>

          <div className="form-group">
            <label>Date de création</label>

            <input
              type="date"
              name="date_creation"
              value={formData.date_creation}
              onChange={handleChange}
            />
          </div>

          <div className="form-group full-width">
            <label>Adresse</label>

            <textarea
              name="adresse"
              value={formData.adresse}
              onChange={handleChange}
              placeholder="Adresse du fournisseur"
              rows="3"
            />
          </div>

          <div className="form-group">
            <label>Registre de commerce</label>

            <input
              type="text"
              name="registre_commerce"
              value={formData.registre_commerce}
              onChange={handleChange}
              placeholder="RC"
            />
          </div>

          <div className="form-group">
            <label>Identifiant fiscal</label>

            <input
              type="text"
              name="identifiant_fiscal"
              value={formData.identifiant_fiscal}
              onChange={handleChange}
              placeholder="Identifiant fiscal"
            />
          </div>

          <div className="form-group">
            <label>ICE</label>

            <input
              type="text"
              name="ice"
              value={formData.ice}
              onChange={handleChange}
              placeholder="ICE"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/admin/stock/fournisseurs")}
          >
            Annuler
          </button>

          <button type="submit" className="btn-save" disabled={loading}>
            {loading
              ? "Enregistrement..."
              : isEdit
              ? "Enregistrer les modifications"
              : "Créer le fournisseur"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FournisseurForm;