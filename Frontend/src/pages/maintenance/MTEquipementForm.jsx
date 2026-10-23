import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getEquipement,
  createEquipement,
  updateEquipement,
  nullIfEmpty,
} from "../../services/mtService";
import "./MT.css";

const emptyForm = {
  nom: "",
  type: "",
  numero_serie: "",
  marque: "",
  modele: "",
  date_acquisition: "",
  etat: "BON",
  disponibilite: "DISPONIBLE",
};

function MTEquipementForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    const load = async () => {
      try {
        const d = await getEquipement(id);
        setForm({
          nom: d.nom || "",
          type: d.type || "",
          numero_serie: d.numero_serie || "",
          marque: d.marque || "",
          modele: d.modele || "",
          date_acquisition: d.date_acquisition || "",
          etat: d.etat || "BON",
          disponibilite: d.disponibilite || "DISPONIBLE",
        });
      } catch (err) {
        console.error(err);
        setError("Impossible de charger cet équipement.");
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
        type: nullIfEmpty(form.type),
        marque: nullIfEmpty(form.marque),
        modele: nullIfEmpty(form.modele),
        date_acquisition: nullIfEmpty(form.date_acquisition),
      };
      if (isEdit) {
        await updateEquipement(id, payload);
        navigate(`/maintenance/equipements/${id}`);
      } else {
        const created = await createEquipement(payload);
        navigate(`/maintenance/equipements/${created.id_equipement}`);
      }
    } catch (err) {
      console.error(err);
      setError("Impossible d'enregistrer. Vérifiez les champs (le n° de série doit être unique).");
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
          <h1>{isEdit ? "Modifier l'équipement" : "Nouvel équipement"}</h1>
        </div>
      </div>

      {error && <div className="mt-error">{error}</div>}

      <form className="mt-form-card" onSubmit={handleSubmit}>
        <div className="mt-form-grid">
          <div className="mt-field">
            <label>Nom *</label>
            <input name="nom" value={form.nom} onChange={handleChange} required />
          </div>
          <div className="mt-field">
            <label>Type</label>
            <input name="type" value={form.type} onChange={handleChange} placeholder="Pelleteuse, grue, bétonnière..." />
          </div>
          <div className="mt-field">
            <label>N° de série *</label>
            <input name="numero_serie" value={form.numero_serie} onChange={handleChange} required />
          </div>
          <div className="mt-field">
            <label>Date d'acquisition</label>
            <input type="date" name="date_acquisition" value={form.date_acquisition || ""} onChange={handleChange} />
          </div>
          <div className="mt-field">
            <label>Marque</label>
            <input name="marque" value={form.marque} onChange={handleChange} />
          </div>
          <div className="mt-field">
            <label>Modèle</label>
            <input name="modele" value={form.modele} onChange={handleChange} />
          </div>
          <div className="mt-field">
            <label>État</label>
            <select name="etat" value={form.etat} onChange={handleChange}>
              <option value="BON">Bon état</option>
              <option value="EN_PANNE">En panne</option>
              <option value="EN_MAINTENANCE">En maintenance</option>
            </select>
          </div>
          <div className="mt-field">
            <label>Disponibilité</label>
            <select name="disponibilite" value={form.disponibilite} onChange={handleChange}>
              <option value="DISPONIBLE">Disponible</option>
              <option value="AFFECTE">Affecté</option>
              <option value="INDISPONIBLE">Indisponible</option>
            </select>
          </div>
        </div>

        <div className="mt-form-actions">
          <button type="button" className="mt-btn" onClick={() => navigate(-1)}>Annuler</button>
          <button type="submit" className="mt-btn-primary" disabled={saving}>
            {saving ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer l'équipement"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MTEquipementForm;