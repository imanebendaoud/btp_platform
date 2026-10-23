import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getMaintenance,
  createMaintenance,
  updateMaintenance,
  getEquipements,
  nullIfEmpty,
} from "../../services/mtService";
import "./MT.css";

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  id_equipement: "",
  type_intervention: "CORRECTIVE",
  description: "",
  date_declaration: today(),
  date_planifiee: "",
  date_intervention: "",
  cout: "",
  statut: "PLANIFIEE",
  technicien: "",
};

function MTMaintenanceForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [equipements, setEquipements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setEquipements(await getEquipements());
        if (isEdit) {
          const d = await getMaintenance(id);
          setForm({
            id_equipement: d.id_equipement || "",
            type_intervention: d.type_intervention || "CORRECTIVE",
            description: d.description || "",
            date_declaration: d.date_declaration || today(),
            date_planifiee: d.date_planifiee || "",
            date_intervention: d.date_intervention || "",
            cout: d.cout ?? "",
            statut: d.statut || "PLANIFIEE",
            technicien: d.technicien || "",
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
      const payload = {
        ...form,
        description: nullIfEmpty(form.description),
        date_planifiee: nullIfEmpty(form.date_planifiee),
        date_intervention: nullIfEmpty(form.date_intervention),
        cout: nullIfEmpty(form.cout),
        technicien: nullIfEmpty(form.technicien),
      };
      if (isEdit) await updateMaintenance(id, payload);
      else await createMaintenance(payload);
      navigate("/maintenance/interventions");
    } catch (err) {
      console.error(err);
      setError("Impossible d'enregistrer cette intervention. Vérifiez les champs.");
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
          <h1>{isEdit ? "Modifier l'intervention" : "Nouvelle intervention"}</h1>
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
            <label>Type d'intervention *</label>
            <select name="type_intervention" value={form.type_intervention} onChange={handleChange} required>
              <option value="CORRECTIVE">Corrective (panne)</option>
              <option value="PREVENTIVE">Préventive</option>
              <option value="REVISION">Révision</option>
            </select>
          </div>
          <div className="mt-field">
            <label>Date de déclaration *</label>
            <input type="date" name="date_declaration" value={form.date_declaration} onChange={handleChange} required />
          </div>
          <div className="mt-field">
            <label>Date planifiée</label>
            <input type="date" name="date_planifiee" value={form.date_planifiee || ""} onChange={handleChange} />
          </div>
          <div className="mt-field">
            <label>Date d'intervention</label>
            <input type="date" name="date_intervention" value={form.date_intervention || ""} onChange={handleChange} />
          </div>
          <div className="mt-field">
            <label>Statut</label>
            <select name="statut" value={form.statut} onChange={handleChange}>
              <option value="PLANIFIEE">Planifiée</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINEE">Terminée</option>
              <option value="ANNULEE">Annulée</option>
            </select>
          </div>
          <div className="mt-field">
            <label>Technicien</label>
            <input name="technicien" value={form.technicien} onChange={handleChange} />
          </div>
          <div className="mt-field">
            <label>Coût (DH)</label>
            <input type="number" step="0.01" name="cout" value={form.cout} onChange={handleChange} />
          </div>
          <div className="mt-field mt-field-full">
            <label>Description</label>
            <textarea name="description" rows={4} value={form.description} onChange={handleChange} />
          </div>
        </div>

        <div className="mt-form-actions">
          <button type="button" className="mt-btn" onClick={() => navigate(-1)}>Annuler</button>
          <button type="submit" className="mt-btn-primary" disabled={saving}>
            {saving ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer l'intervention"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MTMaintenanceForm;