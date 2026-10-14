import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";
import {
  getMyTasks,
  getMyProjects,
  updateTask,
} from "../../services/projectService";

import "./ChefEditTask.css";


function ChefEditTask() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    accessToken,
    loading: authLoading,
  } = useAuth();

  // ============================================================
  // STATES
  // ============================================================

  const [task, setTask] = useState(null);
  const [projects, setProjects] = useState([]);

  const [formData, setFormData] = useState({
    id_projet: "",
    titre: "",
    description: "",
    date_debut: "",
    date_fin_prevue: "",
    date_fin_reelle: "",
    statut: "",
    priorite: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // ============================================================
  // NORMALISATION DES DONNÉES
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
  // RÉCUPÉRER L'ID DU PROJET
  // ============================================================

  const getProjectId = (project) => {
    if (!project) {
      return "";
    }

    if (
      typeof project.id_projet === "object" &&
      project.id_projet !== null
    ) {
      return project.id_projet.id_projet;
    }

    return project.id_projet;
  };


  // ============================================================
  // CHARGEMENT DE LA TÂCHE
  // ============================================================

  useEffect(() => {
    if (authLoading || !accessToken || !id) {
      return;
    }

    const loadTask = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          tasksData,
          projectsData,
        ] = await Promise.all([
          getMyTasks(accessToken),
          getMyProjects(accessToken),
        ]);

        const tasks = normalizeData(tasksData);
        const projectsList = normalizeData(projectsData);

        const taskId = Number(id);

        const currentTask = tasks.find(
          (item) => Number(item.id_tache) === taskId
        );

        if (!currentTask) {
          setError(
            "Tâche introuvable ou accès non autorisé."
          );
          return;
        }

        setTask(currentTask);
        setProjects(projectsList);

        // --------------------------------------------------------
        // Récupération de l'ID du projet
        // --------------------------------------------------------

        let projectId = "";

        if (
          typeof currentTask.id_projet === "object" &&
          currentTask.id_projet !== null
        ) {
          projectId = getProjectId(currentTask);
        } else {
          projectId = currentTask.id_projet;
        }

        // --------------------------------------------------------
        // Préparation du formulaire
        // --------------------------------------------------------

        setFormData({
          id_projet: projectId || "",
          titre: currentTask.titre || "",
          description: currentTask.description || "",
          date_debut: currentTask.date_debut || "",
          date_fin_prevue: currentTask.date_fin_prevue || "",
          date_fin_reelle: currentTask.date_fin_reelle || "",
          statut: currentTask.statut || "",
          priorite: currentTask.priorite || "",
        });

      } catch (err) {
        console.error(
          "Erreur lors du chargement de la tâche :",
          err
        );

        setError(
          "Impossible de charger les informations de la tâche."
        );
      } finally {
        setLoading(false);
      }
    };

    loadTask();
  }, [accessToken, authLoading, id]);


  // ============================================================
  // MODIFICATION DES CHAMPS
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // ============================================================
  // ENREGISTREMENT
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    // ----------------------------------------------------------
    // Validation minimale
    // ----------------------------------------------------------

    if (!formData.titre.trim()) {
      setError("Le titre de la tâche est obligatoire.");
      return;
    }

    if (!formData.id_projet) {
      setError("Le projet est obligatoire.");
      return;
    }

    if (!formData.statut) {
      setError("Le statut est obligatoire.");
      return;
    }

    if (!formData.priorite) {
      setError("La priorité est obligatoire.");
      return;
    }

    try {
      setSaving(true);

      const taskData = {
        id_projet: Number(formData.id_projet),
        titre: formData.titre.trim(),
        description: formData.description.trim() || null,
        date_debut: formData.date_debut || null,
        date_fin_prevue: formData.date_fin_prevue || null,
        date_fin_reelle: formData.date_fin_reelle || null,
        statut: formData.statut,
        priorite: formData.priorite,
      };

      await updateTask(
        accessToken,
        id,
        taskData
      );

      setSuccess(
        "Les modifications ont été enregistrées avec succès."
      );

      // --------------------------------------------------------
      // Retour à la liste après sauvegarde
      // --------------------------------------------------------

      setTimeout(() => {
        navigate(
          `/chef/taches?projet=${formData.id_projet}`
        );
      }, 800);

    } catch (err) {
      console.error(
        "Erreur lors de la modification de la tâche :",
        err
      );

      if (err.response?.data) {
        console.error(
          "Détails API :",
          err.response.data
        );
      }

      setError(
        "Impossible d'enregistrer les modifications."
      );
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
  // NOM DU PROJET
  // ============================================================

  const getProjectName = () => {
    const project = projects.find(
      (item) =>
        Number(item.id_projet) ===
        Number(formData.id_projet)
    );

    if (!project) {
      return "Projet";
    }

    return `${project.numero_projet} — ${project.nom}`;
  };


  // ============================================================
  // CHARGEMENT
  // ============================================================

  if (authLoading || loading) {
    return (
      <div className="chef-edit-task-page">
        <div className="edit-task-loading">
          Chargement de la tâche...
        </div>
      </div>
    );
  }


  // ============================================================
  // ERREUR
  // ============================================================

  if (error && !task) {
    return (
      <div className="chef-edit-task-page">
        <div className="edit-task-error">
          <h2>Tâche indisponible</h2>

          <p>{error}</p>

          <button
            type="button"
            onClick={() => navigate("/chef/taches")}
          >
            Retour aux tâches
          </button>
        </div>
      </div>
    );
  }


  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="chef-edit-task-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <div className="edit-task-header">

        <div className="edit-task-header-left">

          <button
            type="button"
            className="edit-task-back"
            onClick={handleCancel}
          >
            <svg
              width="18"
              height="18"
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

          <div className="edit-task-title-block">

            <span className="edit-task-eyebrow">
              GESTION DES TÂCHES
            </span>

            <h1>
              Modifier la tâche
            </h1>

            <p>
              Modifiez les informations de la tâche
              sélectionnée.
            </p>

          </div>

        </div>

      </div>


      {/* ======================================================
          FORMULAIRE
      ====================================================== */}

      <div className="edit-task-card">

        <div className="edit-task-card-header">

          <div>
            <h2>
              Informations de la tâche
            </h2>

            <p>
              {getProjectName()}
            </p>
          </div>

        </div>


        <form
          className="edit-task-form"
          onSubmit={handleSubmit}
        >

          {/* ==================================================
              PROJET
          ================================================== */}

          <div className="form-group">

            <label htmlFor="id_projet">
              Projet
            </label>

            <input
              id="id_projet"
              name="id_projet"
              type="text"
              value={getProjectName()}
              disabled
            />

            <small>
              Le projet associé à cette tâche ne peut pas
              être modifié ici.
            </small>

          </div>


          {/* ==================================================
              TITRE
          ================================================== */}

          <div className="form-group">

            <label htmlFor="titre">
              Titre
              <span>*</span>
            </label>

            <input
              id="titre"
              name="titre"
              type="text"
              value={formData.titre}
              onChange={handleChange}
              placeholder="Ex. Préparation du chantier"
              required
            />

          </div>


          {/* ==================================================
              DESCRIPTION
          ================================================== */}

          <div className="form-group form-group-full">

            <label htmlFor="description">
              Description
            </label>

            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Décrivez la tâche..."
              rows="5"
            />

          </div>


          {/* ==================================================
              DATE DÉBUT
          ================================================== */}

          <div className="form-group">

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


          {/* ==================================================
              DATE FIN PRÉVUE
          ================================================== */}

          <div className="form-group">

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


          {/* ==================================================
              DATE FIN RÉELLE
          ================================================== */}

          <div className="form-group">

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

          </div>


          {/* ==================================================
              STATUT
          ================================================== */}

          <div className="form-group">

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
              <option value="">
                Sélectionner un statut
              </option>

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


          {/* ==================================================
              PRIORITÉ
          ================================================== */}

          <div className="form-group">

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
              <option value="">
                Sélectionner une priorité
              </option>

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


          {/* ==================================================
              MESSAGES
          ================================================== */}

          {error && (
            <div className="edit-task-message edit-task-message-error">
              {error}
            </div>
          )}

          {success && (
            <div className="edit-task-message edit-task-message-success">
              {success}
            </div>
          )}


          {/* ==================================================
              ACTIONS
          ================================================== */}

          <div className="edit-task-actions">

            <button
              type="button"
              className="edit-task-cancel"
              onClick={handleCancel}
              disabled={saving}
            >
              Annuler
            </button>

            <button
              type="submit"
              className="edit-task-save"
              disabled={saving}
            >
              {saving
                ? "Enregistrement..."
                : "Enregistrer les modifications"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}

export default ChefEditTask;