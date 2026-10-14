import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

import {
  createTask,
  getMyProjects,
} from "../../services/projectService";

import "./ChefCreateTask.css";


function ChefCreateTask() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const {
    accessToken,
    loading: authLoading,
  } = useAuth();

  // ============================================================
  // PROJET DEPUIS L'URL
  // ============================================================

  const projectIdFromUrl = searchParams.get("projet");


  // ============================================================
  // STATES
  // ============================================================

  const [projects, setProjects] = useState([]);

  const [formData, setFormData] = useState({
    id_projet: projectIdFromUrl || "",
    titre: "",
    description: "",
    date_debut: "",
    date_fin_prevue: "",
    date_fin_reelle: "",
    statut: "PLANIFIE",
    priorite: "MOYENNE",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // ============================================================
  // NORMALISATION
  // ============================================================

  const normalizeData = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.results)) {
      return data.results;
    }

    return [];
  };


  // ============================================================
  // CHARGER LES PROJETS
  // ============================================================

  useEffect(() => {
    if (authLoading || !accessToken) {
      return;
    }

    const loadProjects = async () => {
      try {
        setLoading(true);
        setError("");

        const projectsData = await getMyProjects(accessToken);

        const projectList = normalizeData(projectsData);

        setProjects(projectList);

        // --------------------------------------------------------
        // Si aucun projet n'est fourni dans l'URL,
        // sélectionner automatiquement le premier projet.
        // --------------------------------------------------------

        if (!projectIdFromUrl && projectList.length > 0) {
          setFormData((previous) => ({
            ...previous,
            id_projet: String(projectList[0].id_projet),
          }));
        }

      } catch (err) {
        console.error(
          "Erreur lors du chargement des projets :",
          err
        );

        setError(
          "Impossible de charger les projets."
        );

      } finally {
        setLoading(false);
      }
    };

    loadProjects();

  }, [accessToken, authLoading, projectIdFromUrl]);


  // ============================================================
  // MODIFICATION DU FORMULAIRE
  // ============================================================

  const handleChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    // Effacer les messages lorsqu'on recommence à saisir
    if (error) {
      setError("");
    }

    if (success) {
      setSuccess("");
    }
  };


  // ============================================================
  // NOM DU PROJET
  // ============================================================

  const getSelectedProject = () => {
    return projects.find(
      (project) =>
        Number(project.id_projet) ===
        Number(formData.id_projet)
    );
  };


  // ============================================================
  // VALIDATION
  // ============================================================

  const validateForm = () => {

    if (!formData.id_projet) {
      return "Veuillez sélectionner un projet.";
    }

    if (!formData.titre.trim()) {
      return "Le titre de la tâche est obligatoire.";
    }

    if (!formData.statut) {
      return "Veuillez sélectionner un statut.";
    }

    if (!formData.priorite) {
      return "Veuillez sélectionner une priorité.";
    }

    // ----------------------------------------------------------
    // Vérification des dates
    // ----------------------------------------------------------

    if (
      formData.date_debut &&
      formData.date_fin_prevue &&
      formData.date_fin_prevue < formData.date_debut
    ) {
      return (
        "La date de fin prévue doit être postérieure " +
        "ou égale à la date de début."
      );
    }

    if (
      formData.date_debut &&
      formData.date_fin_reelle &&
      formData.date_fin_reelle < formData.date_debut
    ) {
      return (
        "La date de fin réelle doit être postérieure " +
        "ou égale à la date de début."
      );
    }

    return null;
  };


  // ============================================================
  // CRÉATION DE LA TÂCHE
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);

      const taskData = {
        id_projet: Number(formData.id_projet),

        titre: formData.titre.trim(),

        description:
          formData.description.trim() || null,

        date_debut:
          formData.date_debut || null,

        date_fin_prevue:
          formData.date_fin_prevue || null,

        date_fin_reelle:
          formData.date_fin_reelle || null,

        statut: formData.statut,

        priorite: formData.priorite,
      };

      await createTask(
        accessToken,
        taskData
      );

      setSuccess(
        "La tâche a été créée avec succès."
      );

      // --------------------------------------------------------
      // Retour à la liste après un court délai
      // --------------------------------------------------------

      setTimeout(() => {
        navigate(
          `/chef/taches?projet=${formData.id_projet}`
        );
      }, 1000);

    } catch (err) {
      console.error(
        "Erreur lors de la création de la tâche :",
        err
      );

      let message =
        "Impossible de créer la tâche.";

      if (err?.response?.data) {

        const data = err.response.data;

        if (typeof data === "string") {
          message = data;
        } else if (data.detail) {
          message = data.detail;
        } else if (data.titre) {
          message = Array.isArray(data.titre)
            ? data.titre[0]
            : data.titre;
        } else if (data.non_field_errors) {
          message = Array.isArray(
            data.non_field_errors
          )
            ? data.non_field_errors[0]
            : data.non_field_errors;
        }
      }

      setError(message);

    } finally {
      setSaving(false);
    }
  };


  // ============================================================
  // ANNULER
  // ============================================================

  const handleCancel = () => {

    if (formData.id_projet) {
      navigate(
        `/chef/taches?projet=${formData.id_projet}`
      );

      return;
    }

    navigate("/chef/taches");
  };


  // ============================================================
  // CHARGEMENT
  // ============================================================

  if (authLoading || loading) {
    return (
      <div className="chef-create-task-page">
        <div className="create-task-loading">
          <div className="create-task-loader"></div>

          <span>
            Chargement des projets...
          </span>
        </div>
      </div>
    );
  }


  // ============================================================
  // ERREUR DE CHARGEMENT
  // ============================================================

  if (error && projects.length === 0) {
    return (
      <div className="chef-create-task-page">

        <div className="create-task-error">

          <div className="create-task-error-icon">

            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle
                cx="12"
                cy="12"
                r="9"
              />

              <line
                x1="12"
                y1="8"
                x2="12"
                y2="12"
              />

              <line
                x1="12"
                y1="16"
                x2="12.01"
                y2="16"
              />
            </svg>

          </div>

          <h2>
            Impossible de charger les projets
          </h2>

          <p>
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
          >
            Réessayer
          </button>

        </div>

      </div>
    );
  }


  // ============================================================
  // PROJET SÉLECTIONNÉ
  // ============================================================

  const selectedProject =
    getSelectedProject();


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="chef-create-task-page">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="create-task-header">

        <div className="create-task-header-left">

          <button
            type="button"
            className="create-task-back"
            onClick={handleCancel}
            title="Retour aux tâches"
          >

            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M19 12H5" />
              <path d="M12 19l-7-7 7-7" />
            </svg>

            Retour

          </button>


          <div className="create-task-title-block">

            <span className="create-task-eyebrow">
              GESTION DES TÂCHES
            </span>

            <h1>
              Nouvelle tâche
            </h1>

            <p>
              Créez une nouvelle tâche pour l'un
              de vos projets.
            </p>

          </div>

        </div>

      </div>


      {/* ========================================================
          CARTE PRINCIPALE
      ======================================================== */}

      <div className="create-task-card">

        {/* HEADER DE LA CARTE */}

        <div className="create-task-card-header">

          <div className="create-task-card-heading">

            <div className="create-task-card-icon">

              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="3"
                />

                <line
                  x1="12"
                  y1="8"
                  x2="12"
                  y2="16"
                />

                <line
                  x1="8"
                  y1="12"
                  x2="16"
                  y2="12"
                />
              </svg>

            </div>

            <div>

              <h2>
                Informations de la tâche
              </h2>

              <p>
                Renseignez les informations
                principales de la tâche.
              </p>

            </div>

          </div>

          <span className="create-task-required">
            * Champs obligatoires
          </span>

        </div>


        {/* FORMULAIRE */}

        <form
          className="create-task-form"
          onSubmit={handleSubmit}
        >

          {/* ----------------------------------------------------
              MESSAGE ERREUR
          ---------------------------------------------------- */}

          {error && (
            <div className="create-task-message create-task-message-error">

              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                />

                <line
                  x1="12"
                  y1="8"
                  x2="12"
                  y2="12"
                />

                <line
                  x1="12"
                  y1="16"
                  x2="12.01"
                  y2="16"
                />
              </svg>

              <span>
                {error}
              </span>

            </div>
          )}


          {/* ----------------------------------------------------
              MESSAGE SUCCÈS
          ---------------------------------------------------- */}

          {success && (
            <div className="create-task-message create-task-message-success">

              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="9"
                />

                <path d="m8 12 2.5 2.5L16 9" />
              </svg>

              <span>
                {success}
              </span>

            </div>
          )}


          {/* ----------------------------------------------------
              PROJET
          ---------------------------------------------------- */}

          <div className="create-form-group">

            <label htmlFor="id_projet">
              Projet
              <span>*</span>
            </label>

            <select
              id="id_projet"
              name="id_projet"
              value={formData.id_projet}
              onChange={handleChange}
              required
            >

              <option value="">
                Sélectionner un projet
              </option>

              {projects.map((project) => (
                <option
                  key={project.id_projet}
                  value={project.id_projet}
                >
                  {project.numero_projet
                    ? `${project.numero_projet} — `
                    : ""}
                  {project.nom}
                </option>
              ))}

            </select>

            {selectedProject && (
              <small className="create-project-hint">

                <span className="create-project-dot"></span>

                Projet sélectionné :
                <strong>
                  {selectedProject.nom}
                </strong>

              </small>
            )}

          </div>


          {/* ----------------------------------------------------
              TITRE
          ---------------------------------------------------- */}

          <div className="create-form-group">

            <label htmlFor="titre">
              Titre de la tâche
              <span>*</span>
            </label>

            <input
              id="titre"
              name="titre"
              type="text"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Ex. Préparation du terrain"
              maxLength={255}
              required
            />

            <small>
              Donnez un titre clair et précis à la tâche.
            </small>

          </div>


          {/* ----------------------------------------------------
              DESCRIPTION
          ---------------------------------------------------- */}

          <div className="create-form-group create-form-group-full">

            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez les travaux à réaliser..."
              rows="5"
            />

          </div>


          {/* ----------------------------------------------------
              DATES
          ---------------------------------------------------- */}

          <div className="create-form-section">

            <div className="create-form-section-title">

              <span className="section-number">
                01
              </span>

              <div>
                <h3>
                  Planification
                </h3>

                <p>
                  Définissez les dates de la tâche.
                </p>
              </div>

            </div>


            <div className="create-form-section-grid">

              <div className="create-form-group">

                <label htmlFor="date_debut">
                  Date de début
                </label>

                <input
                  id="date_debut"
                  name="date_debut"
                  type="date"
                  value={formData.date_debut}
                  onChange={handleChange}
                />

              </div>


              <div className="create-form-group">

                <label htmlFor="date_fin_prevue">
                  Date de fin prévue
                </label>

                <input
                  id="date_fin_prevue"
                  name="date_fin_prevue"
                  type="date"
                  value={formData.date_fin_prevue}
                  onChange={handleChange}
                />

              </div>


              <div className="create-form-group">

                <label htmlFor="date_fin_reelle">
                  Date de fin réelle
                </label>

                <input
                  id="date_fin_reelle"
                  name="date_fin_reelle"
                  type="date"
                  value={formData.date_fin_reelle}
                  onChange={handleChange}
                />

                <small>
                  À renseigner lorsque la tâche est terminée.
                </small>

              </div>

            </div>

          </div>


          {/* ----------------------------------------------------
              STATUT + PRIORITÉ
          ---------------------------------------------------- */}

          <div className="create-form-section">

            <div className="create-form-section-title">

              <span className="section-number">
                02
              </span>

              <div>
                <h3>
                  État de la tâche
                </h3>

                <p>
                  Définissez le statut et la priorité.
                </p>
              </div>

            </div>


            <div className="create-form-section-grid">

              <div className="create-form-group">

                <label htmlFor="statut">
                  Statut
                  <span>*</span>
                </label>

                <select
                  id="statut"
                  name="statut"
                  value={formData.statut}
                  onChange={handleChange}
                  required
                >

                  <option value="PLANIFIE">
                    Planifié
                  </option>

                  <option value="EN_COURS">
                    En cours
                  </option>

                  <option value="TERMINE">
                    Terminé
                  </option>

                  <option value="SUSPENDU">
                    Suspendu
                  </option>

                  <option value="ANNULE">
                    Annulé
                  </option>

                </select>

              </div>


              <div className="create-form-group">

                <label htmlFor="priorite">
                  Priorité
                  <span>*</span>
                </label>

                <select
                  id="priorite"
                  name="priorite"
                  value={formData.priorite}
                  onChange={handleChange}
                  required
                >

                  <option value="BASSE">
                    Basse
                  </option>

                  <option value="MOYENNE">
                    Moyenne
                  </option>

                  <option value="HAUTE">
                    Haute
                  </option>

                </select>

              </div>

            </div>

          </div>


          {/* ----------------------------------------------------
              ACTIONS
          ---------------------------------------------------- */}

          <div className="create-task-actions">

            <button
              type="button"
              className="create-task-cancel"
              onClick={handleCancel}
              disabled={saving}
            >
              Annuler
            </button>


            <button
              type="submit"
              className="create-task-save"
              disabled={saving}
            >

              {saving ? (
                <>
                  <span className="create-task-button-loader"></span>
                  Création...
                </>
              ) : (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M5 12.5 9.5 17 19 7.5" />
                  </svg>

                  Créer la tâche
                </>
              )}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default ChefCreateTask;