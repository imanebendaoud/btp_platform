import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  createMateriau,
  getMateriau,
  updateMateriau,
} from "../../../services/stockService";

import "./MateriauForm.css";

function MateriauForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    nom: "",
    unite: "",
    stock_actuel: "",
    stock_minimum: "",
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // CHARGER LE MATÉRIAU EN MODE MODIFICATION
  // ============================================================

  useEffect(() => {
    const loadMateriau = async () => {
      if (!isEdit) {
        return;
      }

      try {
        setLoading(true);

        const data = await getMateriau(id);

        setFormData({
          nom: data.nom || "",
          unite: data.unite || "",
          stock_actuel: data.stock_actuel ?? "",
          stock_minimum: data.stock_minimum ?? "",
        });
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
  }, [id, isEdit]);

  // ============================================================
  // CHANGEMENT
  // ============================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!formData.nom.trim()) {
      setError("Le nom du matériau est obligatoire.");
      return;
    }

    if (!formData.unite.trim()) {
      setError("L'unité est obligatoire.");
      return;
    }

    if (
      formData.stock_actuel === "" ||
      Number(formData.stock_actuel) < 0
    ) {
      setError(
        "Le stock actuel doit être supérieur ou égal à 0."
      );
      return;
    }

    if (
      formData.stock_minimum === "" ||
      Number(formData.stock_minimum) < 0
    ) {
      setError(
        "Le stock minimum doit être supérieur ou égal à 0."
      );
      return;
    }

    try {
      setSaving(true);

      const data = {
        nom: formData.nom.trim(),
        unite: formData.unite.trim(),
        stock_actuel: formData.stock_actuel,
        stock_minimum: formData.stock_minimum,
      };

      if (isEdit) {
        await updateMateriau(id, data);
      } else {
        await createMateriau(data);
      }

      navigate("/admin/stock/materiaux");
    } catch (err) {
      console.error(
        "Erreur enregistrement matériau :",
        err
      );

      const backendError = err.response?.data;

      if (backendError) {
        setError(
          typeof backendError === "string"
            ? backendError
            : JSON.stringify(backendError)
        );
      } else {
        setError(
          "Impossible d'enregistrer le matériau."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <div className="materiau-form-page">
        <div className="form-loading">
          Chargement du matériau...
        </div>
      </div>
    );
  }

  // ============================================================
  // AFFICHAGE
  // ============================================================

  return (
    <div className="materiau-form-page">

      <div className="form-top">

        <Link
          to="/admin/stock/materiaux"
          className="back-link"
        >
          ← Retour aux matériaux
        </Link>

        <div className="form-title">

          <div>
            <div className="page-kicker">
              GESTION DU STOCK
            </div>

            <h1>
              {isEdit
                ? "Modifier le matériau"
                : "Nouveau matériau"}
            </h1>

            <p>
              {isEdit
                ? "Modifier les informations du matériau."
                : "Ajouter un nouveau matériau au stock."}
            </p>
          </div>

        </div>

      </div>

      {error && (
        <div className="form-error">
          {error}
        </div>
      )}

      <form
        className="materiau-form"
        onSubmit={handleSubmit}
      >

        {/* INFORMATIONS */}

        <div className="form-section">

          <div className="section-title">
            <h2>Informations du matériau</h2>

            <p>
              Informations générales concernant le matériau.
            </p>
          </div>

          <div className="form-grid">

            <div className="form-group form-group-full">
              <label htmlFor="nom">
                Nom du matériau *
              </label>

              <input
                id="nom"
                name="nom"
                type="text"
                value={formData.nom}
                onChange={handleChange}
                placeholder="Ex. Ciment CPJ 45"
              />
            </div>

            <div className="form-group">
              <label htmlFor="unite">
                Unité *
              </label>

              <input
                id="unite"
                name="unite"
                type="text"
                value={formData.unite}
                onChange={handleChange}
                placeholder="Ex. kg, sac, m³..."
              />
            </div>

          </div>

        </div>

        {/* STOCK */}

        <div className="form-section">

          <div className="section-title">
            <h2>Niveau de stock</h2>

            <p>
              Définissez le stock actuel et le seuil minimum.
            </p>
          </div>

          <div className="form-grid">

            <div className="form-group">
              <label htmlFor="stock_actuel">
                Stock actuel *
              </label>

              <input
                id="stock_actuel"
                name="stock_actuel"
                type="number"
                min="0"
                step="0.001"
                value={formData.stock_actuel}
                onChange={handleChange}
                placeholder="0"
              />

              <small>
                Quantité actuellement disponible.
              </small>
            </div>

            <div className="form-group">
              <label htmlFor="stock_minimum">
                Stock minimum *
              </label>

              <input
                id="stock_minimum"
                name="stock_minimum"
                type="number"
                min="0"
                step="0.001"
                value={formData.stock_minimum}
                onChange={handleChange}
                placeholder="0"
              />

              <small>
                Seuil déclenchant une alerte de stock.
              </small>
            </div>

          </div>

        </div>

        {/* ACTIONS */}

        <div className="form-actions">

          <Link
            to="/admin/stock/materiaux"
            className="btn-secondary"
          >
            Annuler
          </Link>

          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
          >
            {saving
              ? "Enregistrement..."
              : isEdit
              ? "Enregistrer les modifications"
              : "Créer le matériau"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default MateriauForm;