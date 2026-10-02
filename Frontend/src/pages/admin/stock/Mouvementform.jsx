import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createMouvement, getMateriaux } from "../../../services/stockService";
import { getProjects } from "../../../services/projectsService";
import "./MouvementForm.css";

const EMPTY_FORM = {
  id_materiau: "",
  id_projet: "",
  type_mouvement: "ENTREE",
  quantite: "",
  motif: "",
};

function MouvementForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState(EMPTY_FORM);
  const [materiaux, setMateriaux] = useState([]);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([getMateriaux(), getProjects()])
      .then(([materiauxData, projetsData]) => {
        setMateriaux(materiauxData);
        setProjets(projetsData);
      })
      .catch((err) => {
        console.error("Erreur chargement données :", err);
        setError("Impossible de charger les matériaux/projets.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.id_materiau) {
      setError("Sélectionne un matériau.");
      return;
    }

    setSaving(true);
    try {
      await createMouvement({
        id_materiau: form.id_materiau,
        id_projet: form.id_projet || null,
        type_mouvement: form.type_mouvement,
        quantite: form.quantite,
        motif: form.motif,
        date_mouvement: new Date().toISOString(),
      });
      navigate("/admin/stock/mouvements");
    } catch (err) {
      console.error("Erreur création mouvement :", err);

      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Impossible d'enregistrer ce mouvement.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="mvt-form-loading">Chargement...</p>;
  }

  return (
    <div className="mvt-form-page">

      <p className="mvt-eyebrow">GESTION DES STOCKS</p>
      <h1>Nouveau mouvement de stock</h1>

      <form className="mvt-form-card" onSubmit={handleSubmit}>

        <div className="mvt-form-grid">

          <div className="mvt-field mvt-field-full">
            <label>Matériau *</label>
            <select value={form.id_materiau} onChange={handleChange("id_materiau")} required>
              <option value="">— Sélectionner —</option>
              {materiaux.map((m) => (
                <option key={m.id_materiau} value={m.id_materiau}>
                  {m.nom} ({m.unite}) — stock actuel : {Number(m.stock_actuel).toLocaleString("fr-MA")}
                </option>
              ))}
            </select>
          </div>

          <div className="mvt-field">
            <label>Type de mouvement *</label>
            <select value={form.type_mouvement} onChange={handleChange("type_mouvement")}>
              <option value="ENTREE">Entrée</option>
              <option value="SORTIE">Sortie</option>
              <option value="AJUSTEMENT">Ajustement</option>
            </select>
          </div>

          <div className="mvt-field">
            <label>Quantité *</label>
            <input
              type="number"
              step="0.001"
              min="0.001"
              value={form.quantite}
              onChange={handleChange("quantite")}
              placeholder="0"
              required
            />
          </div>

          <div className="mvt-field mvt-field-full">
            <label>Projet concerné</label>
            <select value={form.id_projet} onChange={handleChange("id_projet")}>
              <option value="">— Stock central (aucun projet) —</option>
              {projets.map((p) => (
                <option key={p.id_projet} value={p.id_projet}>
                  {p.numero_projet} — {p.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="mvt-field mvt-field-full">
            <label>Motif</label>
            <input
              type="text"
              value={form.motif}
              onChange={handleChange("motif")}
              placeholder="Réception livraison, consommation chantier..."
            />
          </div>

        </div>

        {error && <div className="mvt-form-error">{error}</div>}

        <div className="mvt-form-actions">
          <button type="button" className="mvt-btn-secondary" onClick={() => navigate(-1)}>
            Annuler
          </button>

          <button type="submit" className="mvt-btn-primary" disabled={saving}>
            {saving ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>

      </form>
    </div>
  );
}

export default MouvementForm;