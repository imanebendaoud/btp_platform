import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getContrat,
  createContrat,
  updateContrat,
  getEmployes,
} from "../../services/rhService";
import "./ContratForm.css";

const emptyForm = {
  id_employe: "",
  type_contrat: "CDI",
  date_debut: "",
  date_fin: "",
  salaire: "",
  statut: "ACTIF",
};

function ContratForm() {
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
        const data = await getContrat(id);
        setForm({
          id_employe: data.id_employe || "",
          type_contrat: data.type_contrat || "CDI",
          date_debut: data.date_debut || "",
          date_fin: data.date_fin || "",
          salaire: data.salaire ?? "",
          statut: data.statut || "ACTIF",
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
        salaire: form.salaire === "" ? null : form.salaire,
        date_fin: form.date_fin === "" ? null : form.date_fin,
      };

      if (isEdit) {
        await updateContrat(id, payload);
        navigate(`/rh/contrats/${id}`);
      } else {
        const created = await createContrat(payload);
        navigate(`/rh/contrats/${created.id_contrat}`);
      }
    } catch (err) {
      console.error(err);
      setError("Impossible d'enregistrer ce contrat. Vérifie les champs saisis.");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rh-contrat-form-page">
        <div className="rh-contrat-form-loading">
          <div className="rh-contrat-form-loader"></div>
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rh-contrat-form-page">

      <div className="rh-contrat-form-header">
        <p className="rh-contrat-form-eyebrow">RESSOURCES HUMAINES</p>
        <h1>{isEdit ? "Modifier le contrat" : "Nouveau contrat"}</h1>
      </div>

      {error && <div className="rh-contrat-form-error">{error}</div>}

      <form className="rh-contrat-form-card" onSubmit={handleSubmit}>

        <div className="rh-contrat-form-grid">

          <div className="rh-contrat-form-field">
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

          <div className="rh-contrat-form-field">
            <label>Type de contrat *</label>
            <select name="type_contrat" value={form.type_contrat} onChange={handleChange} required>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="INTERIM">Intérim</option>
              <option value="STAGE">Stage</option>
              <option value="AUTRE">Autre</option>
            </select>
          </div>

          <div className="rh-contrat-form-field">
            <label>Date de début *</label>
            <input type="date" name="date_debut" value={form.date_debut} onChange={handleChange} required />
          </div>

          <div className="rh-contrat-form-field">
            <label>Date de fin</label>
            <input type="date" name="date_fin" value={form.date_fin || ""} onChange={handleChange} />
          </div>

          <div className="rh-contrat-form-field">
            <label>Salaire (DH)</label>
            <input type="number" step="0.01" name="salaire" value={form.salaire} onChange={handleChange} />
          </div>

          <div className="rh-contrat-form-field">
            <label>Statut</label>
            <select name="statut" value={form.statut} onChange={handleChange}>
              <option value="ACTIF">Actif</option>
              <option value="TERMINE">Terminé</option>
              <option value="SUSPENDU">Suspendu</option>
              <option value="RESILIE">Résilié</option>
            </select>
          </div>

        </div>

        <div className="rh-contrat-form-actions">
          <button type="button" className="rh-contrat-form-cancel" onClick={() => navigate(-1)}>
            Annuler
          </button>
          <button type="submit" className="rh-contrat-form-submit" disabled={saving}>
            {saving ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer le contrat"}
          </button>
        </div>

      </form>

    </div>
  );
}

export default ContratForm;