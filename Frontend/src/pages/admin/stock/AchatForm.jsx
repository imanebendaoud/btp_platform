import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../../services/api";

import {
  createAchat,
  getAchat,
  updateAchat,
} from "../../../services/stockService";

import "./AchatForm.css";

function AchatForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    reference: "",
    id_projet: "",
    id_fournisseur: "",
    id_materiau: "",
    quantite: "",
    unite: "",
    prix_unitaire: "",
    montant_total: "",
    date_achat: "",
    statut: "EN_ATTENTE",
    facture: "",
  });

  const [projets, setProjets] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [materiaux, setMateriaux] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [projetsRes, fournisseursRes, materiauxRes] =
          await Promise.all([
            api.get("/projects/projets/"),
            api.get("/stock/fournisseurs/"),
            api.get("/stock/materiaux/"),
          ]);

        setProjets(
          Array.isArray(projetsRes.data)
            ? projetsRes.data
            : projetsRes.data.results || []
        );

        setFournisseurs(
          Array.isArray(fournisseursRes.data)
            ? fournisseursRes.data
            : fournisseursRes.data.results || []
        );

        setMateriaux(
          Array.isArray(materiauxRes.data)
            ? materiauxRes.data
            : materiauxRes.data.results || []
        );
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les données nécessaires.");
      }
    };

    loadOptions();
  }, []);

  useEffect(() => {
    if (!isEdit) {
      setLoadingData(false);
      return;
    }

    const loadAchat = async () => {
      try {
        const data = await getAchat(id);

        setFormData({
          reference: data.reference || "",
          id_projet: data.id_projet || "",
          id_fournisseur: data.id_fournisseur || "",
          id_materiau: data.id_materiau || "",
          quantite: data.quantite || "",
          unite: data.unite || "",
          prix_unitaire: data.prix_unitaire || "",
          montant_total: data.montant_total || "",
          date_achat: data.date_achat || "",
          statut: data.statut || "EN_ATTENTE",
          facture: data.facture || "",
        });
      } catch (err) {
        console.error(err);
        setError("Impossible de charger l'achat.");
      } finally {
        setLoadingData(false);
      }
    };

    loadAchat();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = {
        ...prev,
        [name]: value,
      };

      if (name === "quantite" || name === "prix_unitaire") {
        const quantite = Number(updated.quantite) || 0;
        const prix = Number(updated.prix_unitaire) || 0;

        updated.montant_total = (quantite * prix).toFixed(2);
      }

      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.reference.trim()) {
      setError("La référence est obligatoire.");
      return;
    }

    if (!formData.id_projet) {
      setError("Le projet est obligatoire.");
      return;
    }

    if (!formData.id_fournisseur) {
      setError("Le fournisseur est obligatoire.");
      return;
    }

    if (!formData.id_materiau) {
      setError("Le matériau est obligatoire.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = {
        reference: formData.reference,
        id_projet: Number(formData.id_projet),
        id_fournisseur: Number(formData.id_fournisseur),
        id_materiau: Number(formData.id_materiau),
        quantite: Number(formData.quantite),
        unite: formData.unite || null,
        prix_unitaire: Number(formData.prix_unitaire),
        montant_total: Number(formData.montant_total),
        date_achat: formData.date_achat,
        statut: formData.statut || null,
        facture: formData.facture || null,
      };

      if (isEdit) {
        await updateAchat(id, data);
      } else {
        await createAchat(data);
      }

      navigate("/admin/stock/achats");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Erreur lors de l'enregistrement de l'achat."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="achat-form-page">Chargement...</div>;
  }

  return (
    <div className="achat-form-page">
      <div className="form-header">
        <h1>{isEdit ? "Modifier l'achat" : "Nouvel achat"}</h1>
        <p>Gestion d'un achat de matériau</p>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="form-grid">
          <div className="form-group">
            <label>Référence *</label>
            <input
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              placeholder="ACH-001"
              required
            />
          </div>

          <div className="form-group">
            <label>Date d'achat *</label>
            <input
              type="date"
              name="date_achat"
              value={formData.date_achat}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Projet *</label>
            <select
              name="id_projet"
              value={formData.id_projet}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionner un projet</option>

              {projets.map((projet) => (
                <option
                  key={projet.id_projet}
                  value={projet.id_projet}
                >
                  {projet.nom_projet ||
                    projet.reference ||
                    `Projet #${projet.id_projet}`}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Fournisseur *</label>
            <select
              name="id_fournisseur"
              value={formData.id_fournisseur}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionner un fournisseur</option>

              {fournisseurs.map((fournisseur) => (
                <option
                  key={fournisseur.id_fournisseur}
                  value={fournisseur.id_fournisseur}
                >
                  {fournisseur.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Matériau *</label>
            <select
              name="id_materiau"
              value={formData.id_materiau}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionner un matériau</option>

              {materiaux.map((materiau) => (
                <option
                  key={materiau.id_materiau}
                  value={materiau.id_materiau}
                >
                  {materiau.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Unité</label>
            <input
              name="unite"
              value={formData.unite}
              onChange={handleChange}
              placeholder="kg, m³, unité..."
            />
          </div>

          <div className="form-group">
            <label>Quantité *</label>
            <input
              type="number"
              step="0.001"
              min="0"
              name="quantite"
              value={formData.quantite}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Prix unitaire *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              name="prix_unitaire"
              value={formData.prix_unitaire}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Montant total</label>
            <input
              type="number"
              step="0.01"
              value={formData.montant_total}
              readOnly
            />
          </div>

          <div className="form-group">
            <label>Statut</label>

            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
            >
              <option value="EN_ATTENTE">En attente</option>
              <option value="VALIDE">Validé</option>
              <option value="LIVRE">Livré</option>
              <option value="ANNULE">Annulé</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>Facture / référence facture</label>

            <textarea
              name="facture"
              value={formData.facture}
              onChange={handleChange}
              rows="3"
              placeholder="Informations concernant la facture..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate("/admin/stock/achats")}
          >
            Annuler
          </button>

          <button className="btn-save" type="submit" disabled={loading}>
            {loading
              ? "Enregistrement..."
              : isEdit
              ? "Enregistrer"
              : "Créer l'achat"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AchatForm;