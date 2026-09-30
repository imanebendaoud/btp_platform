import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProject, createProject, updateProject } from "../../../services/projectsService";
import { getUsers } from "../../../services/usersService";
import "./ProjectForm.css";

const EMPTY_FORM = {
  numero_projet: "",
  nom: "",
  description: "",
  client: "",
  localisation: "",
  date_debut: "",
  date_fin_prevue: "",
  budget_initial: "",
  id_chef_projet: "",
  statut: "EN_PREPARATION",
};

function ProjectForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((err) => console.error("Erreur chargement utilisateurs :", err));

    if (isEditing) {
      getProject(id)
        .then((data) => {
          setForm({
            numero_projet: data.numero_projet || "",
            nom: data.nom || "",
            description: data.description || "",
            client: data.client || "",
            localisation: data.localisation || "",
            date_debut: data.date_debut || "",
            date_fin_prevue: data.date_fin_prevue || "",
            budget_initial: data.budget_initial || "",
            id_chef_projet: data.id_chef_projet || "",
            statut: data.statut || "EN_PREPARATION",
          });
        })
        .catch((err) => {
          console.error("Erreur chargement projet :", err);
          setError("Impossible de charger ce projet.");
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
      ...form,
      budget_initial: form.budget_initial || 0,
      id_chef_projet: form.id_chef_projet || null,
      date_debut: form.date_debut || null,
      date_fin_prevue: form.date_fin_prevue || null,
    };

    try {
      if (isEditing) {
        await updateProject(id, payload);
        navigate(`/admin/projets/${id}`);
      } else {
        const created = await createProject(payload);
        navigate(`/admin/projets/${created.id_projet}`);
      }
    } catch (err) {
      console.error("Erreur enregistrement projet :", err);

      if (err.response?.data) {
        setError(JSON.stringify(err.response.data));
      } else {
        setError("Impossible d'enregistrer le projet.");
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="proj-form-loading">Chargement...</p>;
  }

  return (
    <div className="proj-form-page">

      <p className="proj-eyebrow">GESTION DES PROJETS</p>
      <h1>{isEditing ? "Modifier le projet" : "Nouveau projet"}</h1>

      <form className="proj-form-card" onSubmit={handleSubmit}>

        <div className="proj-form-grid">

          <div className="proj-field">
            <label>Numéro de projet *</label>
            <input
              type="text"
              value={form.numero_projet}
              onChange={handleChange("numero_projet")}
              placeholder="PRJ-2026-004"
              required
            />
          </div>

          <div className="proj-field">
            <label>Statut</label>
            <select value={form.statut} onChange={handleChange("statut")}>
              <option value="EN_PREPARATION">En préparation</option>
              <option value="EN_COURS">En cours</option>
              <option value="SUSPENDU">Suspendu</option>
              <option value="TERMINE">Terminé</option>
            </select>
          </div>

          <div className="proj-field proj-field-full">
            <label>Nom du projet *</label>
            <input
              type="text"
              value={form.nom}
              onChange={handleChange("nom")}
              placeholder="Résidence Al Amal"
              required
            />
          </div>

          <div className="proj-field proj-field-full">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={handleChange("description")}
              rows={3}
              placeholder="Construction de 40 logements..."
            />
          </div>

          <div className="proj-field">
            <label>Client</label>
            <input
              type="text"
              value={form.client}
              onChange={handleChange("client")}
              placeholder="Groupe Al Amal"
            />
          </div>

          <div className="proj-field">
            <label>Localisation</label>
            <input
              type="text"
              value={form.localisation}
              onChange={handleChange("localisation")}
              placeholder="Casablanca"
            />
          </div>

          <div className="proj-field">
            <label>Date de début</label>
            <input
              type="date"
              value={form.date_debut}
              onChange={handleChange("date_debut")}
            />
          </div>

          <div className="proj-field">
            <label>Fin prévue</label>
            <input
              type="date"
              value={form.date_fin_prevue}
              onChange={handleChange("date_fin_prevue")}
            />
          </div>

          <div className="proj-field">
            <label>Budget initial (DH) *</label>
            <input
              type="number"
              step="0.01"
              value={form.budget_initial}
              onChange={handleChange("budget_initial")}
              placeholder="5000000"
              required
            />
          </div>

          <div className="proj-field">
            <label>Chef de chantier</label>
            <select value={form.id_chef_projet} onChange={handleChange("id_chef_projet")}>
              <option value="">— Non assigné —</option>
              {users
                .filter((u) => u.role === "CHEF_CHANTIER")
                .map((u) => (
                  <option key={u.id_utilisateur} value={u.id_utilisateur}>
                    {u.prenom} {u.nom}
                  </option>
                ))}
            </select>
            {users.filter((u) => u.role === "CHEF_CHANTIER").length === 0 && (
              <p className="proj-field-hint">
                Aucun compte "Chef de chantier" n'existe encore. Crée-en un depuis
                Utilisateurs avant d'assigner un projet.
              </p>
            )}
          </div>

        </div>

        {error && <div className="proj-form-error">{error}</div>}

        <div className="proj-form-actions">
          <button
            type="button"
            className="proj-btn-secondary"
            onClick={() => navigate(-1)}
          >
            Annuler
          </button>

          <button type="submit" className="proj-btn-primary" disabled={saving}>
            {saving ? "Enregistrement..." : isEditing ? "Enregistrer" : "Créer le projet"}
          </button>
        </div>

      </form>
    </div>
  );
}

export default ProjectForm;