import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createUser,
  getUser,
  updateUser,
} from "../../../services/usersService";
import "./UserForm.css";
const ROLES = [
  {
    id: 1,
    value: "CHEF_CHANTIER",
    label: "Chef de chantier",
  },
  {
    id: 2,
    value: "ADMINISTRATEUR",
    label: "Administrateur",
  },
  {
    id: 3,
    value: "RESPONSABLE_FINANCIER",
    label: "Responsable financier",
  },
  {
    id: 4,
    value: "RESPONSABLE_MAINTENANCE",
    label: "Responsable maintenance",
  },
  {
    id: 5,
    value: "RESPONSABLE_RH",
    label: "Responsable RH",
  },
];

const EMPTY_FORM = {
  nom: "",
  prenom: "",
  email: "",
  password: "",
  id_role: "",
  actif: true,
};

function UserForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    const loadUser = async () => {
      try {
        setLoading(true);

        const data = await getUser(id);

        setForm({
          nom: data.nom || "",
          prenom: data.prenom || "",
          email: data.email || "",
          password: "",
          id_role: data.id_role || "",
          actif: data.actif ?? true,
        });

        setError("");
      } catch (err) {
        console.error(
          "Erreur chargement utilisateur :",
          err
        );

        setError(
          err.response?.data?.detail ||
            "Impossible de charger cet utilisateur."
        );
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!form.nom.trim()) {
      setError("Le nom est obligatoire.");
      return;
    }

    if (!form.prenom.trim()) {
      setError("Le prénom est obligatoire.");
      return;
    }

    if (!form.email.trim()) {
      setError("L'email est obligatoire.");
      return;
    }

    if (!form.id_role) {
      setError("Veuillez sélectionner un rôle.");
      return;
    }

    if (!isEdit && !form.password) {
      setError("Le mot de passe est obligatoire.");
      return;
    }

    if (!isEdit && form.password.length < 8) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères."
      );
      return;
    }

    try {
      setSaving(true);

      if (isEdit) {
        const data = {
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          id_role: Number(form.id_role),
          actif: form.actif,
        };

        await updateUser(id, data);

      } else {
        const data = {
          nom: form.nom,
          prenom: form.prenom,
          email: form.email,
          password: form.password,
          id_role: Number(form.id_role),
          actif: form.actif,
        };

        await createUser(data);
      }

      navigate("/admin/utilisateurs");

    } catch (err) {
      console.error(
        "Erreur sauvegarde utilisateur :",
        err
      );

      const backendError = err.response?.data;

      if (backendError) {
        if (typeof backendError === "object") {
          const messages = Object.entries(backendError)
            .map(([field, message]) => {
              const text = Array.isArray(message)
                ? message.join(", ")
                : message;

              return `${field} : ${text}`;
            })
            .join(" | ");

          setError(messages);
        } else {
          setError(String(backendError));
        }
      } else {
        setError(
          isEdit
            ? "Impossible de modifier l'utilisateur."
            : "Impossible de créer l'utilisateur."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="user-form-page">
        <p className="user-form-loading">
          Chargement de l'utilisateur...
        </p>
      </div>
    );
  }

  return (
    <div className="user-form-page">

      {/* HEADER */}
      <div className="user-form-header">

        <div>
          <Link
            to="/admin/utilisateurs"
            className="user-form-back"
          >
            ← Retour aux utilisateurs
          </Link>

          <p className="user-form-eyebrow">
            GESTION DES UTILISATEURS
          </p>

          <h1>
            {isEdit
              ? "Modifier l'utilisateur"
              : "Nouvel utilisateur"}
          </h1>

          <p className="user-form-subtitle">
            {isEdit
              ? "Modifier les informations et les accès du compte"
              : "Créer un compte d'accès à la plateforme"}
          </p>
        </div>

      </div>

      {/* ERREUR */}
      {error && (
        <div className="user-form-error">
          {error}
        </div>
      )}

      {/* FORMULAIRE */}
      <form
        className="user-form-card"
        onSubmit={handleSubmit}
      >

        <div className="user-form-section">

          <h2>
            Informations personnelles
          </h2>

          <div className="user-form-grid">

            <div className="user-form-field">

              <label htmlFor="nom">
                Nom *
              </label>

              <input
                id="nom"
                name="nom"
                type="text"
                value={form.nom}
                onChange={handleChange}
                placeholder="Ex. Dupont"
              />

            </div>

            <div className="user-form-field">

              <label htmlFor="prenom">
                Prénom *
              </label>

              <input
                id="prenom"
                name="prenom"
                type="text"
                value={form.prenom}
                onChange={handleChange}
                placeholder="Ex. Jean"
              />

            </div>

          </div>

          <div className="user-form-field">

            <label htmlFor="email">
              Adresse email *
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="exemple@btp.com"
            />

          </div>

        </div>

        <div className="user-form-section">

          <h2>
            Accès à la plateforme
          </h2>

          <div className="user-form-field">

            <label htmlFor="id_role">
              Rôle *
            </label>

            <select
              id="id_role"
              name="id_role"
              value={form.id_role}
              onChange={handleChange}
            >

              <option value="">
                Sélectionner un rôle
              </option>

              {ROLES.map((role) => (
                <option
                  key={role.id}
                  value={role.id}
                >
                  {role.label}
                </option>
              ))}

            </select>

            <p className="user-form-help">
              Le rôle détermine les accès de l'utilisateur
              dans la plateforme.
            </p>

          </div>

          {!isEdit && (
            <div className="user-form-field">

              <label htmlFor="password">
                Mot de passe *
              </label>

              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 caractères"
              />

              <p className="user-form-help">
                Le mot de passe sera sécurisé par le backend
                avant son enregistrement.
              </p>

            </div>
          )}

          <div className="user-form-checkbox">

            <input
              id="actif"
              name="actif"
              type="checkbox"
              checked={form.actif}
              onChange={handleChange}
            />

            <label htmlFor="actif">
              Compte actif
            </label>

          </div>

          <p className="user-form-help">
            Un compte inactif ne pourra pas accéder à la
            plateforme.
          </p>

        </div>

        {/* ACTIONS */}
        <div className="user-form-actions">

          <button
            type="button"
            className="user-form-btn-secondary"
            onClick={() =>
              navigate("/admin/utilisateurs")
            }
          >
            Annuler
          </button>

          <button
            type="submit"
            className="user-form-btn-primary"
            disabled={saving}
          >
            {saving
              ? "Enregistrement..."
              : isEdit
              ? "Enregistrer les modifications"
              : "Créer l'utilisateur"}
          </button>

        </div>

      </form>

    </div>
  );
}

export default UserForm;