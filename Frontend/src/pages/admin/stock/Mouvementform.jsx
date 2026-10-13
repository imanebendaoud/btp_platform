import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../../../services/api";

import {
  createMouvement,
  getMouvement,
  updateMouvement,
} from "../../../services/stockService";

import "./Mouvementform.css";

function MouvementForm() {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEdit = Boolean(id);

  const [materiaux, setMateriaux] = useState([]);
  const [projets, setProjets] = useState([]);

  const [formData, setFormData] = useState({
    id_materiau: "",
    id_projet: "",
    type_mouvement: "ENTREE",
    quantite: "",
    date_mouvement: "",
    motif: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [materiauxRes, projetsRes] = await Promise.all([
          api.get("/stock/materiaux/"),
          api.get("/projects/projets/"),
        ]);

        setMateriaux(
          Array.isArray(materiauxRes.data)
            ? materiauxRes.data
            : materiauxRes.data.results || []
        );

        setProjets(
          Array.isArray(projetsRes.data)
            ? projetsRes.data
            : projetsRes.data.results || []
        );
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les données.");
      }
    };

    loadOptions();
  }, []);

  useEffect(() => {
    if (!isEdit) {
      setLoadingData(false);
      return;
    }

    const loadMouvement = async () => {
      try {
        const data = await getMouvement(id);

        setFormData({
          id_materiau: data.id_materiau || "",
          id_projet: data.id_projet || "",
          type_mouvement: data.type_mouvement || "ENTREE",
          quantite: data.quantite || "",
          date_mouvement: data.date_mouvement
            ? data.date_mouvement.slice(0, 16)
            : "",
          motif: data.motif || "",
        });
      } catch (err) {
        console.error(err);
        setError("Impossible de charger le mouvement.");
      } finally {
        setLoadingData(false);
      }
    };

    loadMouvement();
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

    if (!formData.id_materiau) {
      setError("Le matériau est obligatoire.");
      return;
    }

    if (!formData.id_projet) {
      setError("Le projet est obligatoire.");
      return;
    }

    if (!formData.quantite || Number(formData.quantite) <= 0) {
      setError("La quantité doit être supérieure à zéro.");
      return;
    }

    if (!formData.date_mouvement) {
      setError("La date du mouvement est obligatoire.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const data = {
        id_materiau: Number(formData.id_materiau),
        id_projet: Number(formData.id_projet),
        type_mouvement: formData.type_mouvement,
        quantite: Number(formData.quantite),
        date_mouvement: formData.date_mouvement,
        motif: formData.motif || null,
      };

      if (isEdit) {
        await updateMouvement(id, data);
      } else {
        await createMouvement(data);
      }

      navigate("/admin/stock/mouvements");
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Erreur lors de l'enregistrement du mouvement."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return <div className="mouvement-form-page">Chargement...</div>;
  }

  return (
    <div className="mouvement-form-page">
      <div className="form-header">
        <h1>
          {isEdit
            ? "Modifier le mouvement"
            : "Nouveau mouvement de stock"}
        </h1>

        <p>
          Enregistrer une entrée ou une sortie de matériau
        </p>
      </div>

      <form className="form-card" onSubmit={handleSubmit}>
        {error && <div className="form-error">{error}</div>}

        <div className="form-grid">
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
            <label>Type de mouvement *</label>

            <select
              name="type_mouvement"
              value={formData.type_mouvement}
              onChange={handleChange}
              required
            >
              <option value="ENTREE">Entrée</option>
              <option value="SORTIE">Sortie</option>
            </select>
          </div>

          <div className="form-group">
            <label>Quantité *</label>

            <input
              type="number"
              min="0.001"
              step="0.001"
              name="quantite"
              value={formData.quantite}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Date et heure *</label>

            <input
              type="datetime-local"
              name="date_mouvement"
              value={formData.date_mouvement}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group full-width">
            <label>Motif</label>

            <textarea
              name="motif"
              value={formData.motif}
              onChange={handleChange}
              rows="4"
              placeholder="Motif du mouvement..."
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() =>
              navigate("/admin/stock/mouvements")
            }
          >
            Annuler
          </button>

          <button
            type="submit"
            className="btn-save"
            disabled={loading}
          >
            {loading
              ? "Enregistrement..."
              : isEdit
              ? "Enregistrer"
              : "Créer le mouvement"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MouvementForm;