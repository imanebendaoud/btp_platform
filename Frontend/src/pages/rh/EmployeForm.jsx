import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getEmploye,
  createEmploye,
  updateEmploye,
} from "../../services/rhService";
import "./EmployeForm.css";

const emptyForm = {
  nom: "",
  prenom: "",
  cin: "",
  telephone: "",
  email: "",
  poste: "",
  date_embauche: "",
  cout_journalier: "",
  statut: "ACTIF",
};

function EmployeForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEdit) {
      loadEmploye();
    }
  }, [id]);

  const loadEmploye = async () => {
    try {
      setLoading(true);
      const data = await getEmploye(id);
      setForm({
        nom: data.nom || "",
        prenom: data.prenom || "",
        cin: data.cin || "",
        telephone: data.telephone || "",
        email: data.email || "",
        poste: data.poste || "",
        date_embauche: data.date_embauche || "",
        cout_journalier: data.cout_journalier ?? "",
        statut: data.statut || "ACTIF",
      });
    } catch (err) {
      console.error(err);
      setError("Impossible de charger cet employé.");
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
        cout_journalier: form.cout_journalier === "" ? null : form.cout_journalier,
        date_embauche: form.date_embauche === "" ? null : form.date_embauche,
      };

      if (isEdit) {
        await updateEmploye(id, payload);
        navigate(`/rh/employes/${id}`);
      } else {
        const created = await createEmploye(payload);
        navigate(`/rh/employes/${created.id_employe}`);
      }
    } catch (err) {
      console.error(err);
      setError(
        "Impossible d'enregistrer cet employé. Vérifie les champs saisis."
      );
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="rh-employe-form-page">
        <div className="rh-employe-form-loading">
          <div className="rh-employe-form-loader"></div>
          <span>Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="rh-employe-form-page">

      <div className="rh-employe-form-header">
        <p className="rh-employe-form-eyebrow">RESSOURCES HUMAINES</p>
        <h1>{isEdit ? "Modifier l'employé" : "Nouvel employé"}</h1>
      </div>

      {error && <div className="rh-employe-form-error">{error}</div>}

      <form className="rh-employe-form-card" onSubmit={handleSubmit}>

        <div className="rh-employe-form-grid">

          <div className="rh-employe-form-field">
            <label>Prénom *</label>
            <input
              type="text"
              name="prenom"
              value={form.prenom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="rh-employe-form-field">
            <label>Nom *</label>
            <input
              type="text"
              name="nom"
              value={form.nom}
              onChange={handleChange}
              required
            />
          </div>

          <div className="rh-employe-form-field">
            <label>CIN</label>
            <input
              type="text"
              name="cin"
              value={form.cin}
              onChange={handleChange}
            />
          </div>

          <div className="rh-employe-form-field">
            <label>Téléphone</label>
            <input
              type="text"
              name="telephone"
              value={form.telephone}
              onChange={handleChange}
            />
          </div>

          <div className="rh-employe-form-field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>

          <div className="rh-employe-form-field">
            <label>Poste</label>
            <input
              type="text"
              name="poste"
              value={form.poste}
              onChange={handleChange}
            />
          </div>

          <div className="rh-employe-form-field">
            <label>Date d'embauche</label>
            <input
              type="date"
              name="date_embauche"
              value={form.date_embauche || ""}
              onChange={handleChange}
            />
          </div>

          <div className="rh-employe-form-field">
            <label>Coût journalier (DH)</label>
            <input
              type="number"
              step="0.01"
              name="cout_journalier"
              value={form.cout_journalier}
              onChange={handleChange}
            />
          </div>

          <div className="rh-employe-form-field">
            <label>Statut</label>
            <select name="statut" value={form.statut} onChange={handleChange}>
              <option value="ACTIF">Actif</option>
              <option value="INACTIF">Inactif</option>
              <option value="SUSPENDU">Suspendu</option>
            </select>
          </div>

        </div>

        <div className="rh-employe-form-actions">
          <button
            type="button"
            className="rh-employe-form-cancel"
            onClick={() => navigate(-1)}
          >
            Annuler
          </button>

          <button
            type="submit"
            className="rh-employe-form-submit"
            disabled={saving}
          >
            {saving ? "Enregistrement..." : isEdit ? "Enregistrer" : "Créer l'employé"}
          </button>
        </div>

      </form>

    </div>
  );
}

export default EmployeForm;