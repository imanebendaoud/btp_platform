import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./ChefDocuments.css";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { getMyProjects } from "../../services/projectService";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "txt",
];

const DOCUMENT_CATEGORIES = [
  "Documents techniques",
  "Plans",
  "Contrats",
  "Administratif",
  "Sécurité",
  "Autres",
];

function getFileName(documentItem) {
  const path = documentItem?.chemin_fichier || "";
  const storedName = path.split("/").pop().split("?")[0];

  return storedName || documentItem?.nom_document || "document";
}

function getExtension(documentItem) {
  const name = getFileName(documentItem);
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function getDocumentUrl(documentItem) {
  const path = documentItem?.chemin_fichier;

  if (!path) return "";

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const normalizedPath = path.startsWith("/")
    ? path
    : `/media/${path.replace(/^\/+/, "")}`;

  return `http://127.0.0.1:8000${
    normalizedPath.startsWith("/media/")
      ? normalizedPath
      : `/${normalizedPath.replace(/^\/+/, "")}`
  }`;
}

function getDocumentIcon(documentItem) {
  const extension = getExtension(documentItem);

  if (extension === "pdf") return "PDF";
  if (["doc", "docx"].includes(extension)) return "DOC";
  if (["xls", "xlsx"].includes(extension)) return "XLS";
  if (extension === "txt") return "TXT";

  return "FILE";
}

function formatDate(value) {
  if (!value) return "Date inconnue";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date inconnue";

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getProjectId(documentItem) {
  const project = documentItem?.id_projet;

  if (project && typeof project === "object") {
    return project.id_projet ?? project.id;
  }

  return project;
}

function getProjectName(documentItem, projects) {
  const projectId = getProjectId(documentItem);

  const project = projects.find(
    (item) => String(item.id_projet ?? item.id) === String(projectId)
  );

  return project?.nom || `Chantier ${projectId ?? ""}`.trim();
}

function ChefDocuments() {
  const { accessToken } = useAuth();

  const [projects, setProjects] = useState([]);
  const [documents, setDocuments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [downloadingTxtId, setDownloadingTxtId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(
    DOCUMENT_CATEGORIES[0]
  );
  const [documentName, setDocumentName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const [search, setSearch] = useState("");
  const [filterProject, setFilterProject] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [projectResponse, documentResponse] = await Promise.all([
        getMyProjects(accessToken),
        api.get("/projects/documents/"),
      ]);

      const projectData = projectResponse?.data ?? projectResponse;
      const documentData = documentResponse?.data;

      setProjects(
        Array.isArray(projectData)
          ? projectData
          : projectData?.results || []
      );

      setDocuments(
        Array.isArray(documentData)
          ? documentData
          : documentData?.results || []
      );
    } catch (err) {
      console.error("Erreur de chargement des documents :", err);
      setError(
        "Impossible de charger les chantiers ou les documents. Vérifiez votre connexion."
      );
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredDocuments = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return documents.filter((item) => {
      const name = (item.nom_document || "").toLowerCase();
      const category = (item.type_document || "").toLowerCase();
      const projectId = String(getProjectId(item) ?? "");

      const matchesSearch =
        !normalizedSearch ||
        name.includes(normalizedSearch) ||
        category.includes(normalizedSearch) ||
        getFileName(item).toLowerCase().includes(normalizedSearch);

      const matchesProject =
        filterProject === "all" || projectId === String(filterProject);

      const matchesCategory =
        filterCategory === "all" ||
        (item.type_document || "") === filterCategory;

      return matchesSearch && matchesProject && matchesCategory;
    });
  }, [documents, search, filterProject, filterCategory]);

  const handleFileChange = (event) => {
    const file = event.target.files?.[0] || null;

    setSelectedFile(file);
    setError("");
    setSuccess("");

    if (!file) return;

    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setSelectedFile(null);
      event.target.value = "";
      setError(
        "Format non autorisé. Choisissez un PDF, Word, Excel ou TXT."
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      event.target.value = "";
      setError("Le fichier ne doit pas dépasser 10 Mo.");
    }
  };

  const handleUpload = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!selectedProject) {
      setError("Veuillez sélectionner un chantier.");
      return;
    }

    if (!documentName.trim()) {
      setError("Veuillez saisir le nom du document.");
      return;
    }

    if (!selectedFile) {
      setError("Veuillez sélectionner un fichier.");
      return;
    }

    const formData = new FormData();
    formData.append("id_projet", selectedProject);
    formData.append("nom_document", documentName.trim());
    formData.append("type_document", selectedCategory);
    formData.append("chemin_fichier", selectedFile);

    setUploading(true);

    try {
      await api.post("/projects/documents/", formData);

      setSuccess("Le document a été ajouté avec succès.");
      setDocumentName("");
      setSelectedFile(null);
      setSelectedProject("");

      const fileInput = window.document.getElementById(
        "chef-document-file"
      );

      if (fileInput) fileInput.value = "";

      await loadData();
    } catch (err) {
      console.error("Erreur d'ajout du document :", err);

      const responseData = err.response?.data;
      const message =
        responseData?.detail ||
        responseData?.chemin_fichier?.[0] ||
        responseData?.nom_document?.[0] ||
        "Impossible d'ajouter le document.";

      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadOriginal = async (documentItem) => {
    setError("");
    setSuccess("");

    const url = getDocumentUrl(documentItem);

    if (!url) {
      setError("Le fichier de ce document est introuvable.");
      return;
    }

    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Téléchargement impossible.");
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = window.document.createElement("a");

      link.href = objectUrl;
      link.download = getFileName(documentItem);
      window.document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error("Erreur de téléchargement :", err);
      setError(
        "Le téléchargement a échoué. Vérifiez que le fichier existe sur le serveur."
      );
    }
  };

  const handleDownloadTxt = async (documentItem) => {
    const documentId = documentItem.id_document;

    if (!documentId) {
      setError("Identifiant du document introuvable.");
      return;
    }

    setError("");
    setSuccess("");
    setDownloadingTxtId(documentId);

    try {
      const response = await api.get(
        `/projects/documents/${documentId}/download-txt/`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data], {
        type: "text/plain;charset=utf-8",
      });

      const objectUrl = URL.createObjectURL(blob);
      const link = window.document.createElement("a");

      const baseName =
        (documentItem.nom_document || "document")
          .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_")
          .trim() || "document";

      link.href = objectUrl;
      link.download = `${baseName}.txt`;

      window.document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(objectUrl);
      setSuccess(`Le fichier TXT « ${baseName}.txt » a été téléchargé.`);
    } catch (err) {
      console.error("Erreur de conversion TXT :", err);

      if (err.response?.status === 404) {
        setError(
          "La conversion TXT n'est pas encore disponible côté Django. Il faut ajouter l'action download-txt dans DocumentViewSet."
        );
      } else {
        setError(
          "Impossible de convertir ce document en TXT. Vérifiez le backend et le format du fichier."
        );
      }
    } finally {
      setDownloadingTxtId(null);
    }
  };

  const handleDelete = async (documentItem) => {
    const confirmed = window.confirm(
      `Voulez-vous vraiment supprimer le document « ${
        documentItem.nom_document || "sans nom"
      } » ?`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(documentItem.id_document);

    try {
      await api.delete(
        `/projects/documents/${documentItem.id_document}/`
      );

      setDocuments((current) =>
        current.filter(
          (item) => item.id_document !== documentItem.id_document
        )
      );

      setSuccess("Le document a été supprimé.");
    } catch (err) {
      console.error("Erreur de suppression :", err);
      setError(
        err.response?.data?.detail ||
          "Impossible de supprimer ce document."
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="chef-documents-page">
      <header className="chef-documents-header">
        <div>
          <p className="chef-documents-eyebrow">GESTION DU CHANTIER</p>
          <h1>Documents</h1>
          <p className="chef-documents-subtitle">
            Centralisez les plans, fichiers techniques et documents de vos
            chantiers.
          </p>
        </div>

        <div className="chef-documents-header-icon" aria-hidden="true">
          <span>DOC</span>
        </div>
      </header>

      {error && (
        <div className="chef-documents-alert chef-documents-alert-error">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")} aria-label="Fermer">
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="chef-documents-alert chef-documents-alert-success">
          <span>{success}</span>
          <button
            type="button"
            onClick={() => setSuccess("")}
            aria-label="Fermer"
          >
            ×
          </button>
        </div>
      )}

      <section className="chef-documents-stats">
        <div className="chef-documents-stat-card">
          <span className="chef-documents-stat-icon">▤</span>
          <div>
            <p>Total des documents</p>
            <strong>{documents.length}</strong>
          </div>
        </div>

        <div className="chef-documents-stat-card">
          <span className="chef-documents-stat-icon">⌂</span>
          <div>
            <p>Chantiers disponibles</p>
            <strong>{projects.length}</strong>
          </div>
        </div>

        <div className="chef-documents-stat-card">
          <span className="chef-documents-stat-icon">TXT</span>
          <div>
            <p>Formats acceptés</p>
            <strong>{ALLOWED_EXTENSIONS.length}</strong>
          </div>
        </div>
      </section>

      <section className="chef-documents-panel">
        <div className="chef-documents-section-heading">
          <div>
            <h2>Ajouter un document</h2>
            <p>Associez le fichier au chantier concerné.</p>
          </div>
        </div>

        <form className="chef-documents-form" onSubmit={handleUpload}>
          <div className="chef-documents-form-grid">
            <label className="chef-documents-field">
              <span>Chantier *</span>
              <select
                value={selectedProject}
                onChange={(event) => setSelectedProject(event.target.value)}
                required
              >
                <option value="">Sélectionner un chantier</option>
                {projects.map((project) => (
                  <option
                    key={project.id_projet ?? project.id}
                    value={project.id_projet ?? project.id}
                  >
                    {project.nom}
                  </option>
                ))}
              </select>
            </label>

            <label className="chef-documents-field">
              <span>Catégorie *</span>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
                required
              >
                {DOCUMENT_CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>

            <label className="chef-documents-field chef-documents-field-full">
              <span>Nom du document *</span>
              <input
                type="text"
                value={documentName}
                onChange={(event) => setDocumentName(event.target.value)}
                placeholder="Ex. Plan d'exécution - bâtiment A"
                maxLength={255}
                required
              />
            </label>

            <label className="chef-documents-file-field chef-documents-field-full">
              <span className="chef-documents-file-title">Fichier *</span>
              <span className="chef-documents-file-zone">
                <span className="chef-documents-file-symbol">↑</span>
                <span className="chef-documents-file-copy">
                  <strong>
                    {selectedFile
                      ? selectedFile.name
                      : "Cliquez pour choisir un fichier"}
                  </strong>
                  <small>PDF, Word, Excel ou TXT · 10 Mo maximum</small>
                </span>
                <input
                  id="chef-document-file"
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                  onChange={handleFileChange}
                  required
                />
              </span>
            </label>
          </div>

          <div className="chef-documents-form-footer">
            <p>Les champs marqués d'un * sont obligatoires.</p>
            <button
              className="chef-documents-primary-button"
              type="submit"
              disabled={uploading}
            >
              {uploading ? "Ajout en cours..." : "+ Ajouter le document"}
            </button>
          </div>
        </form>
      </section>

      <section className="chef-documents-panel">
        <div className="chef-documents-section-heading chef-documents-list-heading">
          <div>
            <h2>Documents du chantier</h2>
            <p>
              {filteredDocuments.length} document
              {filteredDocuments.length !== 1 ? "s" : ""} affiché
              {filteredDocuments.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="chef-documents-filters">
          <label className="chef-documents-search">
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher un document..."
              aria-label="Rechercher un document"
            />
          </label>

          <select
            value={filterProject}
            onChange={(event) => setFilterProject(event.target.value)}
            aria-label="Filtrer par chantier"
          >
            <option value="all">Tous les chantiers</option>
            {projects.map((project) => (
              <option
                key={project.id_projet ?? project.id}
                value={project.id_projet ?? project.id}
              >
                {project.nom}
              </option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(event) => setFilterCategory(event.target.value)}
            aria-label="Filtrer par catégorie"
          >
            <option value="all">Toutes les catégories</option>
            {DOCUMENT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="chef-documents-state">
            <span className="chef-documents-loader" />
            <p>Chargement des documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="chef-documents-state">
            <span className="chef-documents-empty-icon">▤</span>
            <h3>Aucun document trouvé</h3>
            <p>
              Ajoutez un document ou modifiez les filtres de recherche.
            </p>
          </div>
        ) : (
          <div className="chef-documents-list">
            {filteredDocuments.map((item) => (
              <article
                className="chef-document-card"
                key={item.id_document}
              >
                <div className="chef-document-file-icon">
                  <span>{getDocumentIcon(item)}</span>
                </div>

                <div className="chef-document-main">
                  <h3>{item.nom_document || getFileName(item)}</h3>
                  <p className="chef-document-project">
                    {getProjectName(item, projects)}
                  </p>
                  <div className="chef-document-meta">
                    <span className="chef-document-category">
                      {item.type_document || "Sans catégorie"}
                    </span>
                    <span>{formatDate(item.date_ajout)}</span>
                  </div>
                  <p className="chef-document-filename">
                    Fichier : {getFileName(item)}
                  </p>
                </div>

                <div className="chef-document-actions">
                  <button
                    type="button"
                    className="chef-document-action-button"
                    onClick={() => handleDownloadOriginal(item)}
                    title="Télécharger le fichier original"
                  >
                    ↓ Original
                  </button>

                  <button
                    type="button"
                    className="chef-document-action-button chef-document-txt-button"
                    onClick={() => handleDownloadTxt(item)}
                    disabled={downloadingTxtId === item.id_document}
                    title="Télécharger une version texte"
                  >
                    {downloadingTxtId === item.id_document
                      ? "Conversion..."
                      : "TXT"}
                  </button>

                  <button
                    type="button"
                    className="chef-document-action-button chef-document-delete-button"
                    onClick={() => handleDelete(item)}
                    disabled={deletingId === item.id_document}
                    title="Supprimer le document"
                  >
                    {deletingId === item.id_document
                      ? "Suppression..."
                      : "Supprimer"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default ChefDocuments;
