import React, { useEffect, useMemo, useState } from "react";
import "./ChefProgress.css";

import {
  BarChart3,
  TrendingUp,
  CircleCheck,
  Building2,
  Plus,
  Pencil,
  Trash2,
  AlertCircle,
  X,
  Filter,
  CalendarDays,
  MessageSquare,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";

import {
  getMyProjects,
  getMyProgress,
  createProgress,
  updateProgress,
  deleteProgress,
} from "../../services/projectService";

function ChefProgress() {
  const { accessToken, loading: authLoading } = useAuth();

  // ============================================================
  // STATES
  // ============================================================

  const [projects, setProjects] = useState([]);
  const [progressList, setProgressList] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProgress, setEditingProgress] = useState(null);

  const [selectedProject, setSelectedProject] = useState("all");

  const [formData, setFormData] = useState({
    id_projet: "",
    pourcentage: "",
    date_avancement: "",
    commentaire: "",
  });

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    if (!authLoading && accessToken) {
      loadData();
    }
  }, [authLoading, accessToken]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectsData, progressData] = await Promise.all([
        getMyProjects(accessToken),
        getMyProgress(accessToken),
      ]);

      const projectsArray = Array.isArray(projectsData)
        ? projectsData
        : projectsData?.results || [];

      const progressArray = Array.isArray(progressData)
        ? progressData
        : progressData?.results || [];

      setProjects(projectsArray);
      setProgressList(progressArray);
    } catch (err) {
      console.error("Erreur chargement avancements :", err);

      setError(
        err?.response?.data?.detail ||
          "Impossible de charger les avancements."
      );
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const getProjectId = (progress) => {
    if (!progress) return null;

    if (typeof progress.id_projet === "object") {
      return progress.id_projet?.id_projet ?? null;
    }

    return progress.id_projet ?? null;
  };

  const getProgressId = (progress) => {
    return progress?.id_avancement ?? null;
  };

  const getProject = (projectId) => {
    return projects.find(
      (project) =>
        String(project.id_projet) === String(projectId)
    );
  };

  const getProjectName = (projectId) => {
    const project = getProject(projectId);

    if (!project) {
      return `Projet #${projectId}`;
    }

    return (
      project.nom ||
      project.numero_projet ||
      `Projet #${project.id_projet}`
    );
  };

  // ============================================================
  // FILTER
  // ============================================================

  const filteredProgress = useMemo(() => {
    if (selectedProject === "all") {
      return progressList;
    }

    return progressList.filter(
      (item) =>
        String(getProjectId(item)) ===
        String(selectedProject)
    );
  }, [progressList, selectedProject]);

  // ============================================================
  // FORM
  // ============================================================

  const resetForm = () => {
    setFormData({
      id_projet: "",
      pourcentage: "",
      date_avancement: "",
      commentaire: "",
    });

    setEditingProgress(null);
    setShowForm(false);
  };

  const openCreateForm = () => {
    setError("");
    setSuccess("");

    setEditingProgress(null);

    setFormData({
      id_projet:
        selectedProject !== "all"
          ? selectedProject
          : "",
      pourcentage: "",
      date_avancement:
        new Date().toISOString().split("T")[0],
      commentaire: "",
    });

    setShowForm(true);
  };

  const openEditForm = (progress) => {
    setError("");
    setSuccess("");

    setEditingProgress(progress);

    setFormData({
      id_projet: getProjectId(progress) || "",
      pourcentage: progress?.pourcentage ?? "",
      date_avancement:
        progress?.date_avancement ?? "",
      commentaire:
        progress?.commentaire ?? "",
    });

    setShowForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ============================================================
  // CREATE / UPDATE
  // ============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // ----------------------------------------------------------
    // VALIDATION
    // ----------------------------------------------------------

    if (!formData.id_projet) {
      setError("Veuillez sélectionner un chantier.");
      return;
    }

    if (
      formData.pourcentage === "" ||
      formData.pourcentage === null
    ) {
      setError(
        "Veuillez saisir le pourcentage d'avancement."
      );
      return;
    }

    const percentage = Number(formData.pourcentage);

    if (Number.isNaN(percentage)) {
      setError(
        "Le pourcentage doit être un nombre."
      );
      return;
    }

    if (percentage < 0 || percentage > 100) {
      setError(
        "Le pourcentage doit être compris entre 0 et 100."
      );
      return;
    }

    if (!formData.date_avancement) {
      setError(
        "Veuillez sélectionner une date d'avancement."
      );
      return;
    }

    try {
      setSaving(true);

      const data = {
        id_projet: Number(formData.id_projet),
        pourcentage: percentage,
        date_avancement: formData.date_avancement,
        commentaire:
          formData.commentaire.trim() || null,
      };

      // --------------------------------------------------------
      // MODIFICATION
      // --------------------------------------------------------

      if (editingProgress) {
        await updateProgress(
          accessToken,
          editingProgress.id_avancement,
          data
        );

        setSuccess(
          "Avancement modifié avec succès."
        );
      }

      // --------------------------------------------------------
      // CREATION
      // --------------------------------------------------------

      else {
        await createProgress(
          accessToken,
          data
        );

        setSuccess(
          "Avancement ajouté avec succès."
        );
      }

      resetForm();

      await loadData();
    } catch (err) {
      console.error(
        "Erreur sauvegarde avancement :",
        err
      );

      const backendError =
        err?.response?.data;

      if (typeof backendError === "string") {
        setError(backendError);
      } else if (backendError?.detail) {
        setError(backendError.detail);
      } else if (
        backendError &&
        typeof backendError === "object"
      ) {
        const messages = Object.values(
          backendError
        )
          .flat()
          .join(" ");

        setError(
          messages ||
            "Une erreur est survenue."
        );
      } else {
        setError(
          editingProgress
            ? "Impossible de modifier l'avancement."
            : "Impossible d'ajouter l'avancement."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (progress) => {
    const progressId =
      progress?.id_avancement;

    if (!progressId) {
      setError(
        "Identifiant de l'avancement introuvable."
      );
      return;
    }

    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cet avancement ?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      await deleteProgress(
        accessToken,
        progressId
      );

      setSuccess(
        "Avancement supprimé avec succès."
      );

      await loadData();
    } catch (err) {
      console.error(
        "Erreur suppression avancement :",
        err
      );

      setError(
        err?.response?.data?.detail ||
          "Impossible de supprimer cet avancement."
      );
    }
  };

  // ============================================================
  // STATISTICS
  // ============================================================

  const totalProgress =
    progressList.length;

  const averageProgress =
    progressList.length > 0
      ? Math.round(
          progressList.reduce(
            (sum, item) =>
              sum +
              Number(
                item.pourcentage || 0
              ),
            0
          ) / progressList.length
        )
      : 0;

  const completedProgress =
    progressList.filter(
      (item) =>
        Number(item.pourcentage || 0) >=
        100
    ).length;

  const totalProjects =
    projects.length;

  // ============================================================
  // LOADING
  // ============================================================

  if (authLoading || loading) {
    return (
      <div className="chef-progress-page">
        <div className="progress-loading">
          <div className="progress-spinner"></div>

          <p>
            Chargement des avancements...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="chef-progress-page">

      {/* ========================================================
          HEADER
      ======================================================== */}

      <div className="progress-header">

        <div>
          <h1>
            Avancement des chantiers
          </h1>

          <p>
            Suivez et mettez à jour
            l'état d'avancement de vos
            projets.
          </p>
        </div>

        <button
          className="btn-add-progress"
          onClick={openCreateForm}
        >
          <Plus size={17} strokeWidth={2} />

          Ajouter un avancement
        </button>

      </div>

      {/* ========================================================
          ALERT ERROR
      ======================================================== */}

      {error && (
        <div className="progress-alert progress-alert-error">

          <AlertCircle size={18} />

          <p>{error}</p>

          <button
            onClick={() => setError("")}
            type="button"
            title="Fermer"
          >
            <X size={17} />
          </button>

        </div>
      )}

      {/* ========================================================
          ALERT SUCCESS
      ======================================================== */}

      {success && (
        <div className="progress-alert progress-alert-success">

          <CircleCheck size={18} />

          <p>{success}</p>

          <button
            onClick={() => setSuccess("")}
            type="button"
            title="Fermer"
          >
            <X size={17} />
          </button>

        </div>
      )}

      {/* ========================================================
          STATISTICS
      ======================================================== */}

      <div className="progress-stats">

        <div className="progress-stat-card">

          <div className="stat-icon stat-icon-blue">
            <BarChart3 size={21} strokeWidth={2} />
          </div>

          <div>
            <span>
              Total avancements
            </span>

            <strong>
              {totalProgress}
            </strong>
          </div>

        </div>

        <div className="progress-stat-card">

          <div className="stat-icon stat-icon-purple">
            <TrendingUp size={21} strokeWidth={2} />
          </div>

          <div>
            <span>
              Avancement moyen
            </span>

            <strong>
              {averageProgress}%
            </strong>
          </div>

        </div>

        <div className="progress-stat-card">

          <div className="stat-icon stat-icon-green">
            <CircleCheck size={21} strokeWidth={2} />
          </div>

          <div>
            <span>
              Avancements terminés
            </span>

            <strong>
              {completedProgress}
            </strong>
          </div>

        </div>

        <div className="progress-stat-card">

          <div className="stat-icon stat-icon-yellow">
            <Building2 size={21} strokeWidth={2} />
          </div>

          <div>
            <span>
              Mes chantiers
            </span>

            <strong>
              {totalProjects}
            </strong>
          </div>

        </div>

      </div>

      {/* ========================================================
          FILTER
      ======================================================== */}

      <div className="progress-toolbar">

        <div className="progress-filter">

          <label htmlFor="project-filter">
            <Filter size={15} strokeWidth={2} />
            Filtrer par chantier
          </label>

          <select
            id="project-filter"
            value={selectedProject}
            onChange={(e) =>
              setSelectedProject(
                e.target.value
              )
            }
          >
            <option value="all">
              Tous les chantiers
            </option>

            {projects.map((project) => (
              <option
                key={project.id_projet}
                value={project.id_projet}
              >
                {project.numero_projet} -{" "}
                {project.nom}
              </option>
            ))}

          </select>

        </div>

        <div className="progress-count">

          {filteredProgress.length} avancement
          {filteredProgress.length > 1
            ? "s"
            : ""}

        </div>

      </div>

      {/* ========================================================
          FORM
      ======================================================== */}

      {showForm && (
        <div className="progress-form-card">

          <div className="progress-form-header">

            <div>

              <h2>
                {editingProgress
                  ? "Modifier l'avancement"
                  : "Ajouter un avancement"}
              </h2>

              <p>
                Renseignez les informations
                du suivi du chantier.
              </p>

            </div>

            <button
              className="close-form-btn"
              onClick={resetForm}
              type="button"
              title="Fermer"
            >
              <X size={18} strokeWidth={2} />
            </button>

          </div>

          <form onSubmit={handleSubmit}>

            {/* --------------------------------------------------
                CHANTIER
            -------------------------------------------------- */}

            <div className="form-group">

              <label htmlFor="id_projet">
                Chantier <span>*</span>
              </label>

              <select
                id="id_projet"
                name="id_projet"
                value={formData.id_projet}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="">
                  Sélectionner un chantier
                </option>

                {projects.map((project) => (
                  <option
                    key={project.id_projet}
                    value={project.id_projet}
                  >
                    {project.numero_projet} -{" "}
                    {project.nom}
                  </option>
                ))}

              </select>

            </div>

            {/* --------------------------------------------------
                POURCENTAGE
            -------------------------------------------------- */}

            <div className="form-group">

              <label htmlFor="pourcentage">
                Pourcentage d'avancement{" "}
                <span>*</span>
              </label>

              <div className="percentage-input-wrapper">

                <input
                  id="pourcentage"
                  name="pourcentage"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={
                    formData.pourcentage
                  }
                  onChange={handleChange}
                  placeholder="Ex : 65"
                  disabled={saving}
                />

                <span>%</span>

              </div>

            </div>

            {/* --------------------------------------------------
                DATE
            -------------------------------------------------- */}

            <div className="form-group">

              <label htmlFor="date_avancement">
                <CalendarDays
                  size={15}
                  strokeWidth={2}
                />
                Date d'avancement{" "}
                <span>*</span>
              </label>

              <input
                id="date_avancement"
                name="date_avancement"
                type="date"
                value={
                  formData.date_avancement
                }
                onChange={handleChange}
                disabled={saving}
              />

            </div>

            {/* --------------------------------------------------
                PREVIEW
            -------------------------------------------------- */}

            {formData.pourcentage !== "" && (
              <div className="progress-preview">

                <div className="preview-header">

                  <span>
                    Avancement
                  </span>

                  <strong>
                    {formData.pourcentage}%
                  </strong>

                </div>

                <div className="preview-bar">

                  <div
                    className="preview-bar-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          0,
                          Number(
                            formData.pourcentage
                          ) || 0
                        )
                      )}%`,
                    }}
                  ></div>

                </div>

              </div>
            )}

            {/* --------------------------------------------------
                COMMENTAIRE
            -------------------------------------------------- */}

            <div className="form-group">

              <label htmlFor="commentaire">
                <MessageSquare
                  size={15}
                  strokeWidth={2}
                />
                Commentaire
              </label>

              <textarea
                id="commentaire"
                name="commentaire"
                value={
                  formData.commentaire
                }
                onChange={handleChange}
                placeholder="Ajoutez une remarque sur l'avancement..."
                rows="4"
                disabled={saving}
              />

            </div>

            {/* --------------------------------------------------
                ACTIONS
            -------------------------------------------------- */}

            <div className="progress-form-actions">

              <button
                type="button"
                className="btn-cancel-progress"
                onClick={resetForm}
                disabled={saving}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="btn-save-progress"
                disabled={saving}
              >
                {saving
                  ? "Enregistrement..."
                  : editingProgress
                  ? "Modifier"
                  : "Ajouter"}
              </button>

            </div>

          </form>

        </div>
      )}

      {/* ========================================================
          LISTE
      ======================================================== */}

      <div className="progress-list-section">

        <div className="section-title">

          <div>

            <h2>
              Historique des avancements
            </h2>

            <p>
              Consultez les mises à jour
              de vos chantiers.
            </p>

          </div>

        </div>

        {filteredProgress.length === 0 ? (

          <div className="progress-empty">

            <div className="empty-icon">
              <BarChart3
                size={30}
                strokeWidth={1.8}
              />
            </div>

            <h3>
              Aucun avancement trouvé
            </h3>

            <p>
              Aucun avancement n'est
              disponible pour le filtre
              sélectionné.
            </p>

            <button
              onClick={openCreateForm}
              className="btn-empty-add"
            >
              <Plus size={15} strokeWidth={2} />
              Ajouter un avancement
            </button>

          </div>

        ) : (

          <div className="progress-cards">

            {filteredProgress.map(
              (progress) => {

                const projectId =
                  getProjectId(progress);

                const percentage =
                  Math.min(
                    100,
                    Math.max(
                      0,
                      Number(
                        progress.pourcentage ||
                          0
                      )
                    )
                  );

                const progressId =
                  getProgressId(progress);

                return (
                  <div
                    className="progress-card"
                    key={progressId}
                  >

                    {/* ==================================================
                        CARD HEADER
                    ================================================== */}

                    <div className="progress-card-header">

                      <div>

                        <span className="project-label">
                          Chantier
                        </span>

                        <h3>
                          {getProjectName(
                            projectId
                          )}
                        </h3>

                        {getProject(
                          projectId
                        )?.numero_projet && (
                          <small>
                            {
                              getProject(
                                projectId
                              ).numero_projet
                            }
                          </small>
                        )}

                      </div>

                      <div className="progress-card-actions">

                        {/* MODIFIER */}

                        <button
                          className="btn-edit-progress"
                          onClick={() =>
                            openEditForm(
                              progress
                            )
                          }
                          title="Modifier"
                          type="button"
                        >
                          <Pencil
                            size={16}
                            strokeWidth={2}
                          />
                        </button>

                        {/* SUPPRIMER */}

                        <button
                          className="btn-delete-progress"
                          onClick={() =>
                            handleDelete(
                              progress
                            )
                          }
                          title="Supprimer"
                          type="button"
                        >
                          <Trash2
                            size={16}
                            strokeWidth={2}
                          />
                        </button>

                      </div>

                    </div>

                    {/* ==================================================
                        PROGRESS
                    ================================================== */}

                    <div className="progress-card-progress">

                      <div className="progress-percentage-row">

                        <span>
                          Avancement
                        </span>

                        <strong>
                          {percentage}%
                        </strong>

                      </div>

                      <div className="main-progress-bar">

                        <div
                          className="main-progress-fill"
                          style={{
                            width: `${percentage}%`,
                          }}
                        ></div>

                      </div>

                    </div>

                    {/* ==================================================
                        COMMENTAIRE
                    ================================================== */}

                    {progress.commentaire && (
                      <div className="progress-comment">

                        <span>
                          Commentaire
                        </span>

                        <p>
                          {
                            progress.commentaire
                          }
                        </p>

                      </div>
                    )}

                    {/* ==================================================
                        DATE
                    ================================================== */}

                    <div className="progress-card-footer">

                      <span>
                        Date d'avancement
                      </span>

                      <strong>
                        {new Date(
                          progress.date_avancement
                        ).toLocaleDateString(
                          "fr-FR"
                        )}
                      </strong>

                    </div>

                  </div>
                );
              }
            )}

          </div>

        )}

      </div>

    </div>
  );
}

export default ChefProgress;