import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../services/api";
import {
  getPointage,
  createPointage,
  updatePointage,
  getEmployes,
} from "../../services/rhService";
import "./PointageForm.css";

const emptyForm = {
  id_employe: "",
  id_projet: "",
  date: "",
  heure_entree: "",
  heure_sortie: "",
};

function PointageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [employes, setEmployes] = useState([]);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);

      const [employesData, projetsResponse] = await Promise.all([
        getEmployes(),
        api.get("/projects/projets/"),
      ]);

      setEmployes(Array.isArray(employesData) ? employesData : employesData.results || []);

      const projetsData = projetsResponse.data;
      setProjets(Array.isArray(projetsData) ? projetsData : projetsData.results || []);

      if (isEdit) {
        const data = await getPointage(id);
        setForm({
          id_employe: data.id_employe || "",
          id_projet: data.id_projet || "",
          date: data.date || "",
          heure_entree: data.heure_entree ? data.heure_entree.slice(0, 5) : "",
          heure_sortie: data.heure_sortie ? data.heure_sortie.slice(0, 5) : "",
        });
      }
    } catch (err) {
      console.error(err);
      setError("Impossible de charger les données.");
    } finally {
      setLoading(false);
    }
  };

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
        heure_entree: form.heure_entree === "" ? null : form.heure_entree,
        heure_sortie: form.heure_sortie === "" ? null : form.heure_sortie,
      };

      if (isEdit) {
        await updatePointage(id, payload);
        navigate(`/rh/pointages/${id}`);
      } else {
        const created = await createPointage(payload);
        navigate(`/rh/pointages/${created.id_pointage}`);
      }
    } catch (err) {
      console.error(err);
      setError("Impossible d'enregistrer ce pointage. Vérifie les champs saisis.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rh-pointage-form-page">
        <div className="rh-pointage-form-loading">
          <div className="rh-pointage-form-loader"></div>
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rh-pointage-form-page">

      <div className="rh-pointage-form-header">
        <p className="rh-pointage-form-eyebrow">RESSOURCES HUMAINES</p>
        <h1>{isEdit ? "Modifier le pointage" : "Nouveau pointage"}</h1>
      </div>

      {error && <div className="rh-pointage-form-error">{error}</div>}

      <form className="rh-pointage-form-card" onSubmit={handleSubmit}>

        <div className="rh-pointage-form-grid">

          <div className="rh-pointage-form-field">
            <label>Employé *</label>
            <select name="id_employe" value={form.id_employe} onChange={handleChange} required>
              <option value="">Sélectionner un employé</option>
              {employes.map((e) => (
                <option key={e.id_employe} value={e.id_employe}>
                  {e.prenom} {e.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="rh-pointage-form-field">
            <label>Projet *</label>
            <select name="id_projet" value={form.id_projet} onChange={handleChange} required>
              <option value="">Sélectionner un projet</option>
              {projets.map((p) => (
                <option key={p.id_projet} value={p.id_projet}>
                  {p.nom}
                </option>
              ))}
            </select>
          </div>

          <div className="rh-pointage-form-field">
            <label>Date *</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} required />
          </div>

          <div className="rh-pointage-form-field">
            <label>Heure d'entrée</label>
            <input type="time" name="heure_entree" value={form.heure_entree} onChange={handleChange} />
          </div>

          <div className="rh-pointage-form-field">
            <label>Heure de sortie</label>
            <input type="time" name="heure_sortie" value={form.heure_sortie} onChange={handleChange} />
          </div>

        </div>

        <div className="rh-pointage-form-actions">
          <button type="button" className="rh-pointage-form-cancel" onClick={() => navigate(-1)}>
            Annuler
          </button>
          <button type="submit" className="rh-pointage-form-submit" disabled={saving}>
            {saving ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer le pointage"}
          </button>
        </div>

      </form>

    </div>
  );
}

export default PointageForm;