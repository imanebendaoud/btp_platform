import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getMateriau, createMateriau, updateMateriau } from "../../../services/stockService";
import "./MateriauForm.css";

const EMPTY_FORM = {
  nom: "",
  unite: "",
  stock_actuel: "",
  stock_minimum: "",
};

function MateriauForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing) {
      getMateriau(id)
        .then((data) => {
          setForm({
            nom: data.nom || "",
            unite: data.unite || "",
            stock_actuel: data.stock_actuel ?? "",
            stock_minimum: data.stock_minimum ?? "",
          });
        })
        .catch((err) => {
          console.error("Erreur chargement matériau :", err);
          setError("Impossible de charger ce matériau.");
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEditing]);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      nom: form.nom,
      unite: form.unite,
      stock_actuel: form.stock_actuel || 0,
      stock_minimum: form.stock_minimum || 0,
    };

    try {
      if (isEditing) {
        await updateMateriau(id, payload);
      } else {
        await createMateriau(payload);
      }
      navigate("/admin/stock/materiaux");
    } catch (err) {
      console.error("Erreur enregistrement matériau :", err);

      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Impossible d'enregistrer ce matériau.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="mat-form-loading">Chargement...</p>;
  }

  return (
    <div className="mat-form-page">

      <p className="mat-eyebrow">GESTION DES STOCKS</p>
      <h1>{isEditing ? "Modifier le matériau" : "Nouveau matériau"}</h1>

      <form className="mat-form-card" onSubmit={handleSubmit}>

        <div className="mat-form-grid">

          <div className="mat-field mat-field-full">
            <label>Nom du matériau *</label>
            <input
              type="text"
              value={form.nom}
              onChange={handleChange("nom")}
              placeholder="Ciment CPJ 45"
              required
            />
          </div>

          <div className="mat-field">
            <label>Unité *</label>
            <input
              type="text"
              value={form.unite}
              onChange={handleChange("unite")}
              placeholder="sac, m3, L..."
              required
            />
          </div>

          <div className="mat-field">
            <label>Stock actuel *</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={form.stock_actuel}
              onChange={handleChange("stock_actuel")}
              placeholder="0"
              required
            />
          </div>

          <div className="mat-field">
            <label>Stock minimum *</label>
            <input
              type="number"
              step="0.001"
              min="0"
              value={form.stock_minimum}
              onChange={handleChange("stock_minimum")}
              placeholder="0"
              required
            />
            <p className="mat-field-hint">
              Une alerte "Stock faible" s'affichera si le stock actuel descend sous ce seuil.
            </p>
          </div>

        </div>

        {error && <div className="mat-form-error">{error}</div>}

        <div className="mat-form-actions">
          <button type="button" className="mat-btn-secondary" onClick={() => navigate(-1)}>
            Annuler
          </button>

          <button type="submit" className="mat-btn-primary" disabled={saving}>
            {saving ? "Enregistrement..." : isEditing ? "Enregistrer" : "Créer le matériau"}
          </button>
        </div>

      </form>
    </div>
  );
}

export default MateriauForm;