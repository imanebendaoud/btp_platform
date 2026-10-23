import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  getDemande,
  createDemande,
  updateDemande,
  MOTIFS,
  extractError,
} from "../../services/demandeService";
import {
  getEquipements,
  getMaintenances,
  getProjets,
  isOpen,
} from "../../services/mtService";
import "./MT.css";

const emptyForm = {
  id_equipement: "",
  id_maintenance: "",
  id_projet: "",
  motif: "REPARATION",
  montant_demande: "",
  urgence: "NORMALE",
  justification: "",
};

function MTDemandeForm() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(emptyForm);
  const [equipements, setEquipements] = useState([]);
  const [maintenances, setMaintenances] = useState([]);
  const [projets, setProjets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [locked, setLocked] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [e, m, p] = await Promise.all([getEquipements(), getMaintenances(), getProjets()]);
        setEquipements(e);
        setMaintenances(m);
        setProjets(p);

        if (isEdit) {
          const d = await getDemande(id);
          if (d.statut !== "EN_ATTENTE") {
            setLocked(true);
            setError("Cette demande a déjà été traitée et ne peut plus être modifiée.");
          }
          setForm({
            id_equipement: d.id_equipement || "",
            id_maintenance: d.id_maintenance || "",
            id_projet: d.id_projet || "",
            motif: d.motif || "REPARATION",
            montant_demande: d.montant_demande ?? "",
            urgence: d.urgence || "NORMALE",
            justification: d.justification || "",
          });
        } else {
          const eq = searchParams.get("equipement");
          if (eq) setForm((prev) => ({ ...prev, id_equipement: eq }));
        }
      } catch (err) {
        console.error(err);
        setError("Impossible de charger les données.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEdit, searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // changer d'équipement invalide l'intervention choisie
      if (name === "id_equipement") next.id_maintenance = "";
      return next;
    });
  };

  const interventions = maintenances.filter(
    (m) => String(m.id_equipement) === String(form.id_equipement) && isOpen(m.statut)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError("");
      const payload = {
        ...form,
        id_equipement: Number(form.id_equipement),
        id_projet: Number(form.id_projet),
        id_maintenance: form.id_maintenance ? Number(form.id_maintenance) : null,
      };
      if (isEdit) await updateDemande(id, payload);
      else await createDemande(payload);
      navigate("/maintenance/demandes");
    } catch (err) {
      console.error(err);
      setError(extractError(err, "Impossible d'enregistrer cette demande. Vérifiez les champs."));
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
          <h1>{isEdit ? "Modifier la demande" : "Nouvelle demande de financement"}</h1>
          <p className="mt-subtitle">
            Le responsable financier sera notifié. Si la demande est validée, une dépense est créée sur le projet choisi.
          </p>
        </div>
      </div>

      {error && <div className="mt-error">{error}</div>}

      <form className="mt-form-card" onSubmit={handleSubmit}>
        <div className="mt-form-grid">
          <div className="mt-field">
            <label>Équipement *</label>
            <select name="id_equipement" value={form.id_equipement} onChange={handleChange} required disabled={locked}>
              <option value="">Sélectionner un équipement</option>
              {equipements.map((e) => (
                <option key={e.id_equipement} value={e.id_equipement}>{e.nom}</option>
              ))}
            </select>
          </div>

          <div className="mt-field">
            <label>Intervention liée (facultatif)</label>
            <select name="id_maintenance" value={form.id_maintenance} onChange={handleChange} disabled={locked || !form.id_equipement}>
              <option value="">Aucune</option>
              {interventions.map((m) => (
                <option key={m.id_maintenance} value={m.id_maintenance}>
                  #{m.id_maintenance} · {m.type_intervention} · {m.statut}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-field">
            <label>Projet à imputer *</label>
            <select name="id_projet" value={form.id_projet} onChange={handleChange} required disabled={locked}>
              <option value="">Sélectionner un projet</option>
              {projets.map((p) => (
                <option key={p.id_projet} value={p.id_projet}>{p.nom}</option>
              ))}
            </select>
          </div>

          <div className="mt-field">
            <label>Motif *</label>
            <select name="motif" value={form.motif} onChange={handleChange} required disabled={locked}>
              {Object.entries(MOTIFS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="mt-field">
            <label>Montant demandé (DH) *</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              name="montant_demande"
              value={form.montant_demande}
              onChange={handleChange}
              required
              disabled={locked}
            />
          </div>

          <div className="mt-field">
            <label>Urgence</label>
            <select name="urgence" value={form.urgence} onChange={handleChange} disabled={locked}>
              <option value="NORMALE">Normale</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>

          <div className="mt-field mt-field-full">
            <label>Justification *</label>
            <textarea
              name="justification"
              rows={5}
              value={form.justification}
              onChange={handleChange}
              placeholder="Décrivez la panne, le besoin, le devis du fournisseur..."
              required
              disabled={locked}
            />
          </div>
        </div>

        <div className="mt-form-actions">
          <button type="button" className="mt-btn" onClick={() => navigate(-1)}>Annuler</button>
          <button type="submit" className="mt-btn-primary" disabled={saving || locked}>
            {saving ? "Envoi..." : isEdit ? "Enregistrer" : "Envoyer la demande"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default MTDemandeForm;