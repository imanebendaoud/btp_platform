import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getAffectation,
  createAffectation,
  updateAffectation,
  getEquipements,
  getProjets,
  nullIfEmpty,
} from "../../services/mtService";
import "./MT.css";

const emptyForm = { id_equipement: "", id_projet: "", date_debut: "", date_fin: "" };

function MTAffectationForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [equipements, setEquipements] = useState([]);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [e, p] = await Promise.all([getEquipements(), getProjets()]);
        setEquipements(e);
        setProjets(p);
        if (isEdit) {
          const d = await getAffectation(id);
          setForm({
            id_equipement: d.id_equipement || "",
            id_projet: d.id_projet || "",
            date_debut: d.date_debut || "",
            date_fin: d.date_fin || "",
          });
        }
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      const payload = { ...form, date_fin: nullIfEmpty(form.date_fin) };
      if (isEdit) await updateAffectation(id, payload);
      else await createAffectation(payload);
      navigate("/maintenance/affectations");
    } catch (err) {
      console.error(err);
      setError("Impossible d'enregistrer cette affectation. Vérifiez les champs.");
      if (data) {
        const first = data.non_field_errors?.[0] || data.date_fin?.[0] || data.detail;
        if (first) message = first;
      }
      setError(message);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-page">
        <div className="mt-loading"><div className="mt-loader"></div><span>Chargement...</span></div>
      </div>
    );
  }

  return (
    <div className="mt-page">
      <div className="mt-header">
        <div>
          <p className="mt-eyebrow">MAINTENANCE</p>
          <h1>{isEdit ? "Modifier l'affectation" : "Nouvelle affectation"}</h1>
        </div>
      </div>

      {error && <div className="mt-error">{error}</div>}

      <form className="mt-form-card" onSubmit={handleSubmit}>
        <div className="mt-form-grid">
          <div className="mt-field">
            <label>Équipement *</label>
            <select name="id_equipement" value={form.id_equipement} onChange={handleChange} required>
              <option value="">Sélectionner un équipement</option>
              {equipements.map((e) => (
                <option key={e.id_equipement} value={e.id_equipement}>{e.nom}</option>
              ))}
            </select>
          </div>
          <div className="mt-field">
            <label>Projet *</label>
            <select name="id_projet" value={form.id_projet} onChange={handleChange} required>
              <option value="">Sélectionner un projet</option>
              {projets.map((p) => (
                <option key={p.id_projet} value={p.id_projet}>{p.nom}</option>
              ))}
            </select>
          </div>
          <div className="mt-field">
            <label>Date de début *</label>
            <input type="date" name="date_debut" value={form.date_debut} onChange={handleChange} required />
          </div>
          <div className="mt-field">
            <label>Date de fin</label>
            <input type="date" name="date_fin" value={form.date_fin || ""} onChange={handleChange} />
          </div>
        </div>

        <div className="mt-form-actions">
          <button type="button" className="mt-btn" onClick={() => navigate(-1)}>Annuler</button>
          <button type="submit" className="mt-btn-primary" disabled={saving}>
            {saving ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer l'affectation"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MTAffectationForm;