import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import "./ChefReports.css";

import { useAuth } from "../../context/AuthContext";

import {
  getMyReports,
  getMyProjects,
  createReport,
  updateReport,
  deleteReport,
} from "../../services/projectService";

function ChefReports() {
  const { accessToken, loading: authLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // ============================================================
  // STATES
  // ============================================================

  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);

  const [selectedProject, setSelectedProject] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingReport, setEditingReport] = useState(null);

  const [formData, setFormData] = useState({
    id_projet: "",
    titre: "",
    type_rapport: "",
    contenu: "",
    date_rapport: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ============================================================
  // HELPERS
  // ============================================================

  const normalizeData = (data) => {
    if (Array.isArray(data)) {
      return data;
    }

    if (Array.isArray(data?.results)) {
      return data.results;
    }

    return [];
  };

  const getProjectId = (report) => {
    if (!report?.id_projet) {
      return null;
    }

    if (typeof report.id_projet === "object") {
      return (
        report.id_projet.id_projet ||
        report.id_projet.id ||
        null
      );
    }

    return Number(report.id_projet);
  };

  const getProject = (projectId) => {
    return projects.find(
      (project) => Number(project.id_projet) === Number(projectId)
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTimeForInput = () => {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const getErrorMessage = (err) => {
    const data = err?.response?.data;

    if (!data) {
      return "Une erreur est survenue.";
    }

    if (typeof data === "string") {
      return data;
    }

    if (data.detail) {
      return data.detail;
    }

    const firstKey = Object.keys(data)[0];

    if (firstKey) {
      const value = data[firstKey];

      if (Array.isArray(value)) {
        return value[0];
      }

      if (typeof value === "string") {
        return value;
      }
    }

    return "Une erreur est survenue.";
  };

  // ============================================================
  // LOAD DATA
  // ============================================================

  useEffect(() => {
    if (authLoading || !accessToken) {
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [projectsData, reportsData] = await Promise.all([
          getMyProjects(accessToken),
          getMyReports(accessToken),
        ]);

        const projectsArray = normalizeData(projectsData);
        const reportsArray = normalizeData(reportsData);

        setProjects(projectsArray);
        setReports(reportsArray);

        const projectFromUrl = searchParams.get("projet");

        if (
          projectFromUrl &&
          projectsArray.some(
            (project) =>
              Number(project.id_projet) === Number(projectFromUrl)
          )
        ) {
          setSelectedProject(String(projectFromUrl));
        } else if (projectsArray.length > 0) {
          setSelectedProject(String(projectsArray[0].id_projet));
        }
      } catch (err) {
        console.error("Erreur chargement rapports :", err);
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [accessToken, authLoading]);

  // ============================================================
  // FILTER
  // ============================================================

  const filteredReports = useMemo(() => {
    if (!selectedProject) {
      return reports;
    }

    return reports.filter(
      (report) =>
        Number(getProjectId(report)) === Number(selectedProject)
    );
  }, [reports, selectedProject]);

  // ============================================================
  // STATISTICS
  // ============================================================

  const statistics = useMemo(() => {
    const total = filteredReports.length;

    const types = new Set(
      filteredReports
        .map((report) => report.type_rapport)
        .filter(Boolean)
    );

    const latestReport = [...filteredReports].sort(
      (a, b) =>
        new Date(b.date_rapport || 0) -
        new Date(a.date_rapport || 0)
    )[0];

    return {
      total,
      types: types.size,
      latest: latestReport,
    };
  }, [filteredReports]);

  // ============================================================
  // PROJECT CHANGE
  // ============================================================

  const handleProjectChange = (event) => {
    const projectId = event.target.value;

    setSelectedProject(projectId);

    if (projectId) {
      setSearchParams({ projet: projectId });
    } else {
      setSearchParams({});
    }
  };

  // ============================================================
  // OPEN CREATE
  // ============================================================

  const handleOpenCreate = () => {
    setError("");
    setSuccess("");

    setEditingReport(null);

    setFormData({
      id_projet: selectedProject || "",
      titre: "",
      type_rapport: "",
      contenu: "",
      date_rapport: formatDateTimeForInput(),
    });

    setShowForm(true);
  };

  // ============================================================
  // OPEN EDIT
  // ============================================================

  const handleEdit = (report) => {
    setError("");
    setSuccess("");

    setEditingReport(report);

    let dateValue = "";

    if (report.date_rapport) {
      const date = new Date(report.date_rapport);

      if (!Number.isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");

        dateValue = `${year}-${month}-${day}T${hours}:${minutes}`;
      }
    }

    setFormData({
      id_projet: getProjectId(report) || "",
      titre: report.titre || "",
      type_rapport: report.type_rapport || "",
      contenu: report.contenu || "",
      date_rapport: dateValue,
    });

    setShowForm(true);
  };

  // ============================================================
  // CLOSE FORM
  // ============================================================

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingReport(null);

    setFormData({
      id_projet: selectedProject || "",
      titre: "",
      type_rapport: "",
      contenu: "",
      date_rapport: "",
    });
  };

  // ============================================================
  // FORM CHANGE
  // ============================================================

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ============================================================
  // SUBMIT
  // ============================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.id_projet) {
      setError("Veuillez sélectionner un chantier.");
      return;
    }

    if (!formData.titre.trim()) {
      setError("Le titre du rapport est obligatoire.");
      return;
    }

    if (!formData.date_rapport) {
      setError("La date du rapport est obligatoire.");
      return;
    }

    const payload = {
      id_projet: Number(formData.id_projet),
      titre: formData.titre.trim(),
      type_rapport: formData.type_rapport.trim() || null,
      contenu: formData.contenu.trim() || null,
      date_rapport: formData.date_rapport,
    };

    try {
      setSaving(true);

      if (editingReport) {
        await updateReport(
          accessToken,
          editingReport.id_rapport,
          payload
        );

        setSuccess("Rapport modifié avec succès.");
      } else {
        await createReport(accessToken, payload);

        setSuccess("Rapport créé avec succès.");
      }

      const refreshedData = await getMyReports(accessToken);

      setReports(normalizeData(refreshedData));

      handleCloseForm();
    } catch (err) {
      console.error("Erreur sauvegarde rapport :", err);
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (reportId) => {
    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer ce rapport ?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(reportId);
      setError("");
      setSuccess("");

      await deleteReport(accessToken, reportId);

      setReports((previous) =>
        previous.filter(
          (report) => report.id_rapport !== reportId
        )
      );

      setSuccess("Rapport supprimé avec succès.");
    } catch (err) {
      console.error("Erreur suppression rapport :", err);
      setError(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (authLoading || loading) {
    return (
      <div className="chef-reports-page">
        <div className="reports-loading">
          <div className="reports-spinner"></div>
          <p>Chargement des rapports...</p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="chef-reports-page">

      {/* HEADER */}
      <div className="reports-header">
        <div>
          <h1>Rapports chantier</h1>
          <p>
            Consultez et gérez les rapports de vos chantiers.
          </p>
        </div>

        <button
          className="btn-add-report"
          onClick={handleOpenCreate}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 5v14" />
            <path d="M5 12h14" />
          </svg>

          Nouveau rapport
        </button>
      </div>

      {/* ALERTS */}
      {error && (
        <div className="reports-alert reports-alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="reports-alert reports-alert-success">
          {success}
        </div>
      )}

      {/* STATISTICS */}
      <div className="reports-stats">

        <div className="reports-stat-card">
          <div className="stat-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="8" y1="13" x2="16" y2="13" />
              <line x1="8" y1="17" x2="16" y2="17" />
            </svg>
          </div>

          <span>Total rapports</span>
          <strong>{statistics.total}</strong>
        </div>

        <div className="reports-stat-card">
          <div className="stat-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M4 19V5" />
              <path d="M4 5h14l-3 4 3 4H4" />
            </svg>
          </div>

          <span>Types de rapports</span>
          <strong>{statistics.types}</strong>
        </div>

        <div className="reports-stat-card">
          <div className="stat-icon">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <circle cx="12" cy="12" r="9" />
              <polyline points="12 7 12 12 15 14" />
            </svg>
          </div>

          <span>Dernier rapport</span>
          <strong>
            {statistics.latest
              ? formatDate(statistics.latest.date_rapport)
              : "-"}
          </strong>
        </div>
      </div>

      {/* TOOLBAR */}
      <div className="reports-toolbar">
        <div className="reports-filter">
          <label htmlFor="project-filter">
            Chantier
          </label>

          <select
            id="project-filter"
            value={selectedProject}
            onChange={handleProjectChange}
          >
            {projects.length === 0 && (
              <option value="">
                Aucun chantier
              </option>
            )}

            {projects.map((project) => (
              <option
                key={project.id_projet}
                value={project.id_projet}
              >
                {project.numero_projet} - {project.nom}
              </option>
            ))}
          </select>
        </div>

        <div className="reports-count">
          {filteredReports.length} rapport
          {filteredReports.length !== 1 ? "s" : ""}
        </div>
      </div>

      {/* FORM */}
      {showForm && (
        <div className="reports-form-card">

          <div className="reports-form-header">
            <div>
              <h2>
                {editingReport
                  ? "Modifier le rapport"
                  : "Nouveau rapport"}
              </h2>

              <p>
                {editingReport
                  ? "Modifiez les informations du rapport."
                  : "Ajoutez un nouveau rapport de chantier."}
              </p>
            </div>

            <button
              className="close-form-btn"
              onClick={handleCloseForm}
              type="button"
              aria-label="Fermer"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-row">

              <div className="form-group">
                <label htmlFor="id_projet">
                  Chantier *
                </label>

                <select
                  id="id_projet"
                  name="id_projet"
                  value={formData.id_projet}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Sélectionner un chantier
                  </option>

                  {projects.map((project) => (
                    <option
                      key={project.id_projet}
                      value={project.id_projet}
                    >
                      {project.numero_projet} - {project.nom}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="type_rapport">
                  Type de rapport
                </label>

                <select
                  id="type_rapport"
                  name="type_rapport"
                  value={formData.type_rapport}
                  onChange={handleChange}
                >
                  <option value="">
                    Sélectionner un type
                  </option>
                  <option value="Journalier">
                    Journalier
                  </option>
                  <option value="Hebdomadaire">
                    Hebdomadaire
                  </option>
                  <option value="Avancement">
                    Avancement
                  </option>
                  <option value="Technique">
                    Technique
                  </option>
                  <option value="Incident">
                    Incident
                  </option>
                  <option value="Réunion">
                    Réunion
                  </option>
                  <option value="Autre">
                    Autre
                  </option>
                </select>
              </div>

            </div>

            <div className="form-row">

              <div className="form-group">
                <label htmlFor="titre">
                  Titre *
                </label>

                <input
                  id="titre"
                  name="titre"
                  type="text"
                  value={formData.titre}
                  onChange={handleChange}
                  placeholder="Ex : Rapport journalier du chantier"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="date_rapport">
                  Date du rapport *
                </label>

                <input
                  id="date_rapport"
                  name="date_rapport"
                  type="datetime-local"
                  value={formData.date_rapport}
                  onChange={handleChange}
                  required
                />
              </div>

            </div>

            <div className="form-group">
              <label htmlFor="contenu">
                Contenu
              </label>

              <textarea
                id="contenu"
                name="contenu"
                value={formData.contenu}
                onChange={handleChange}
                placeholder="Décrivez les travaux réalisés, les observations, les problèmes rencontrés..."
                rows="7"
              />
            </div>

            <div className="reports-form-actions">

              <button
                type="button"
                className="btn-cancel-report"
                onClick={handleCloseForm}
                disabled={saving}
              >
                Annuler
              </button>

              <button
                type="submit"
                className="btn-save-report"
                disabled={saving}
              >
                {saving
                  ? "Enregistrement..."
                  : editingReport
                    ? "Enregistrer les modifications"
                    : "Créer le rapport"}
              </button>

            </div>

          </form>
        </div>
      )}

      {/* REPORTS LIST */}
      <section className="reports-list-section">

        <div className="section-title">
          <div>
            <h2>Rapports</h2>
            <p>
              Historique des rapports du chantier sélectionné.
            </p>
          </div>
        </div>

        {filteredReports.length === 0 ? (

          <div className="reports-empty">

            <div className="empty-icon">
              <svg
                width="42"
                height="42"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="8" y1="13" x2="16" y2="13" />
                <line x1="8" y1="17" x2="14" y2="17" />
              </svg>
            </div>

            <h3>Aucun rapport</h3>

            <p>
              Aucun rapport n'a encore été enregistré pour ce chantier.
            </p>

            <button
              className="btn-empty-add"
              onClick={handleOpenCreate}
            >
              Ajouter un rapport
            </button>

          </div>

        ) : (

          <div className="reports-cards">

            {filteredReports.map((report) => {
              const project = getProject(getProjectId(report));

              return (
                <article
                  className="report-card"
                  key={report.id_rapport}
                >

                  <div className="report-card-header">

                    <div className="report-card-title">

                      <span className="project-label">
                        {project?.numero_projet || "Chantier"}
                      </span>

                      <h3>{report.titre}</h3>

                      <small>
                        {project?.nom || "Projet non identifié"}
                      </small>

                    </div>

                    <div className="report-card-actions">

                      <button
                        className="btn-edit-report"
                        onClick={() => handleEdit(report)}
                        title="Modifier"
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <path d="M12 20h9" />
                          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                        </svg>
                      </button>

                      <button
                        className="btn-delete-report"
                        onClick={() =>
                          handleDelete(report.id_rapport)
                        }
                        disabled={
                          deletingId === report.id_rapport
                        }
                        title="Supprimer"
                      >
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v6" />
                          <path d="M14 11v6" />
                          <path d="M9 6V4h6v2" />
                        </svg>
                      </button>

                    </div>
                  </div>

                  <div className="report-card-meta">

                    {report.type_rapport && (
                      <span className="report-type">
                        {report.type_rapport}
                      </span>
                    )}

                    <span className="report-date">
                      {formatDate(report.date_rapport)}
                    </span>

                  </div>

                  {report.contenu && (
                    <div className="report-content">
                      {report.contenu}
                    </div>
                  )}

                  <div className="report-card-footer">
                    <span>
                      Rapport #{report.id_rapport}
                    </span>

                    <span>
                      {project?.numero_projet || ""}
                    </span>
                  </div>

                </article>
              );
            })}

          </div>
        )}
      </section>
    </div>
  );
}

export default ChefReports;