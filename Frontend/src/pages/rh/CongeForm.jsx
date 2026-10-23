import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getConge,
  createConge,
  updateConge,
  getEmployes,
} from "../../services/rhService";
import "./CongeForm.css";

const emptyForm = {
  id_employe: "",
  type: "CONGE_PAYE",
  date_debut: "",
  date_fin: "",
  motif: "",
  statut: "EN_ATTENTE",
};

function CongeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadInitialData();
  }, [id]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const employesData = await getEmployes();
      setEmployes(Array.isArray(employesData) ? employesData : employesData.results || []);

      if (isEdit) {
        const data = await getConge(id);
        setForm({
          id_employe: data.id_employe || "",
          type: data.type || "CONGE_PAYE",
          date_debut: data.date_debut || "",
          date_fin: data.date_fin || "",
          motif: data.motif || "",
          statut: data.statut || "EN_ATTENTE",
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

      if (isEdit) {
        await updateConge(id, form);
        navigate(`/rh/conges/${id}`);
      } else {
        const created = await createConge(form);
        navigate(`/rh/conges/${created.id_absence}`);
      }
    } catch (err) {
      console.error(err);
      setError("Impossible d'enregistrer cette demande. Vérifie les champs saisis.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rh-conge-form-page">
        <div className="rh-conge-form-loading">
          <div className="rh-conge-form-loader"></div>
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rh-conge-form-page">

      <div className="rh-conge-form-header">
        <p className="rh-conge-form-eyebrow">RESSOURCES HUMAINES</p>
        <h1>{isEdit ? "Modifier la demande" : "Nouvelle demande de congé"}</h1>
      </div>

      {error && <div className="rh-conge-form-error">{error}</div>}

      <form className="rh-conge-form-card" onSubmit={handleSubmit}>

        <div className="rh-conge-form-grid">

          <div className="rh-conge-form-field">
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

          <div className="rh-conge-form-field">
            <label>Type de congé *</label>
            <select name="type" value={form.type} onChange={handleChange} required>
              <option value="CONGE_PAYE">Congé payé</option>
              <option value="MALADIE">Maladie</option>
              <option value="SANS_SOLDE">Sans solde</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          <div className="rh-conge-form-field">
            <label>Date de début *</label>
            <input type="date" name="date_debut" value={form.date_debut} onChange={handleChange} required />
          </div>

          <div className="rh-conge-form-field">
            <label>Date de fin *</label>
            <input type="date" name="date_fin" value={form.date_fin} onChange={handleChange} required />
          </div>

          {isEdit && (
            <div className="rh-conge-form-field">
              <label>Statut</label>
              <select name="statut" value={form.statut} onChange={handleChange}>
                <option value="EN_ATTENTE">En attente</option>
                <option value="VALIDE">Validé</option>
                <option value="REFUSE">Refusé</option>
              </select>
            </div>
          )}

          <div className="rh-conge-form-field rh-conge-form-field-full">
            <label>Motif</label>
            <textarea
              name="motif"
              rows={4}
              value={form.motif}
              onChange={handleChange}
            />
          </div>

        </div>

        <div className="rh-conge-form-actions">
          <button type="button" className="rh-conge-form-cancel" onClick={() => navigate(-1)}>
            Annuler
          </button>
          <button type="submit" className="rh-conge-form-submit" disabled={saving}>
            {saving ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer la demande"}
          </button>
        </div>

      </form>

    </div>
  );
}

export default CongeForm;