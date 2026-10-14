import React, { useEffect, useState } from "react";
import "./ChefPhotos.css";
import { useAuth } from "../../context/AuthContext";
import api from "../../services/api";
import { getMyProjects } from "../../services/projectService";

const MAX_FILE_SIZE = 10 * 1024 * 1024;

function ChefPhotos() {
  const { accessToken, loading: authLoading } = useAuth();

  const [projects, setProjects] = useState([]);
  const [photos, setPhotos] = useState([]);

  const [selectedProject, setSelectedProject] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deletingPhotoId, setDeletingPhotoId] = useState(null);

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ==========================================================
  // CHARGEMENT DES PROJETS ET DES PHOTOS
  // ==========================================================

  useEffect(() => {
    if (authLoading) return;

    if (!accessToken) {
      setError("Vous devez vous connecter pour accéder aux photos.");
      setLoading(false);
      return;
    }

    loadData();
  }, [accessToken, authLoading]);

  // Fermer la fenêtre de visualisation avec Échap
  useEffect(() => {
    if (!selectedPhoto) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setSelectedPhoto(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPhoto]);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [projectsResponse, photosResponse] = await Promise.all([
        getMyProjects(accessToken),
        api.get("/projects/photos/"),
      ]);

      const projectsData = Array.isArray(projectsResponse)
        ? projectsResponse
        : projectsResponse?.results || [];

      const photosData = Array.isArray(photosResponse.data)
        ? photosResponse.data
        : photosResponse.data?.results || [];

      setProjects(projectsData);
      setPhotos(photosData);

      if (projectsData.length > 0) {
        setSelectedProject((current) => {
          const exists = projectsData.some(
            (project) => String(project.id_projet) === String(current)
          );

          return exists
            ? current
            : String(projectsData[0].id_projet);
        });
      } else {
        setSelectedProject("");
      }
    } catch (err) {
      console.error("Erreur de chargement :", err);

      setError(
        err.response?.data?.detail ||
          "Impossible de charger les projets et les photos."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // SELECTION D'UNE PHOTO
  // ==========================================================

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    setError("");
    setSuccess("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setSelectedFile(null);
      setError("Veuillez sélectionner un fichier image valide.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setError("La taille maximale autorisée est de 10 Mo.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  // ==========================================================
  // AJOUT D'UNE PHOTO
  // ==========================================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!accessToken) {
      setError("Votre session a expiré. Veuillez vous reconnecter.");
      return;
    }

    if (!selectedProject) {
      setError("Veuillez sélectionner un chantier.");
      return;
    }

    if (!selectedFile) {
      setError("Veuillez choisir ou prendre une photo.");
      return;
    }

    const projectExists = projects.some(
      (project) => String(project.id_projet) === String(selectedProject)
    );

    if (!projectExists) {
      setError("Le chantier sélectionné est invalide.");
      return;
    }

    const formData = new FormData();

    formData.append("id_projet", selectedProject);
    formData.append("chemin_photo", selectedFile);
    formData.append("description", description.trim());

    setUploading(true);

    try {
      const response = await api.post("/projects/photos/", formData);

      setPhotos((currentPhotos) => [
        response.data,
        ...currentPhotos,
      ]);

      setSelectedFile(null);
      setDescription("");

      const fileInput = document.getElementById("chef-photo-file");

      if (fileInput) {
        fileInput.value = "";
      }

      setSuccess("La photo a été ajoutée avec succès.");
    } catch (err) {
      console.error("Erreur lors de l'ajout :", err);

      const responseData = err.response?.data;

      if (responseData && typeof responseData === "object") {
        const messages = Object.entries(responseData)
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(" ")
              : typeof value === "string"
                ? value
                : JSON.stringify(value);

            return `${field}: ${message}`;
          })
          .join(" | ");

        setError(messages || "Impossible d'ajouter la photo.");
      } else {
        setError(
          "Impossible d'ajouter la photo. Vérifiez la connexion au serveur."
        );
      }
    } finally {
      setUploading(false);
    }
  };

  // ==========================================================
  // CONSTRUCTION DE L'URL DE LA PHOTO
  // ==========================================================

  const getPhotoUrl = (photo) => {
    const path = photo?.chemin_photo;

    if (!path || typeof path !== "string") {
      return "";
    }

    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    const apiBaseUrl = api.defaults.baseURL || window.location.origin;
    const baseUrl = new URL(apiBaseUrl, window.location.origin);

    if (path.startsWith("/media/")) {
      return new URL(path, baseUrl.origin).href;
    }

    const cleanPath = path
      .replace(/^\/+/, "")
      .replace(/^media\//, "");

    return new URL(`/media/${cleanPath}`, baseUrl.origin).href;
  };

  // ==========================================================
  // SUPPRESSION D'UNE PHOTO
  // ==========================================================

  const handleDeletePhoto = async (photo) => {
    if (!photo?.id_photo || deletingPhotoId !== null) {
      return;
    }

    const confirmed = window.confirm(
      "Voulez-vous vraiment supprimer cette photo ? Cette action est définitive."
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setSuccess("");
    setDeletingPhotoId(photo.id_photo);

    try {
      await api.delete(`/projects/photos/${photo.id_photo}/`);

      setPhotos((currentPhotos) =>
        currentPhotos.filter(
          (item) => item.id_photo !== photo.id_photo
        )
      );

      setSelectedPhoto((current) =>
        current?.id_photo === photo.id_photo ? null : current
      );

      setSuccess("La photo a été supprimée avec succès.");
    } catch (err) {
      console.error("Erreur lors de la suppression :", err);

      setError(
        err.response?.data?.detail ||
          "Impossible de supprimer cette photo. Vérifiez vos permissions."
      );
    } finally {
      setDeletingPhotoId(null);
    }
  };

  // ==========================================================
  // ETAT DE CHARGEMENT
  // ==========================================================

  if (authLoading || loading) {
    return (
      <main className="chef-photos-page">
        <div className="chef-photos-loading">
          Chargement des photos...
        </div>
      </main>
    );
  }

  // ==========================================================
  // INTERFACE
  // ==========================================================

  return (
    <main className="chef-photos-page">
      <header className="chef-photos-header">
        <div>
          <h1>Photos des chantiers</h1>
          <p>
            Ajoutez des photos pour documenter l'avancement de vos chantiers.
          </p>
        </div>
      </header>

      {error && (
        <div className="chef-photos-alert chef-photos-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="chef-photos-alert chef-photos-success" role="status">
          {success}
        </div>
      )}

      {/* FORMULAIRE D'AJOUT */}

      <section className="chef-photos-form-section">
        <h2>Ajouter une photo</h2>

        {projects.length === 0 ? (
          <p>Aucun chantier disponible pour votre compte.</p>
        ) : (
          <form onSubmit={handleSubmit} className="chef-photos-form">
            <div className="chef-photos-field">
              <label htmlFor="chef-photo-project">Chantier</label>

              <select
                id="chef-photo-project"
                value={selectedProject}
                onChange={(event) => setSelectedProject(event.target.value)}
                required
              >
                <option value="">Sélectionner un chantier</option>

                {projects.map((project) => (
                  <option
                    key={project.id_projet}
                    value={project.id_projet}
                  >
                    {project.numero_projet
                      ? `${project.numero_projet} - ${project.nom}`
                      : project.nom}
                  </option>
                ))}
              </select>
            </div>

            <div className="chef-photos-field">
              <label htmlFor="chef-photo-file">
                Choisir ou prendre une photo
              </label>

              <input
                id="chef-photo-file"
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                required
              />

              <small>Formats image acceptés. Taille maximale : 10 Mo.</small>
            </div>

            {selectedFile && (
              <div className="chef-photos-preview">
                <p>
                  Image sélectionnée : <strong>{selectedFile.name}</strong>
                </p>

                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Aperçu de la photo sélectionnée"
                />
              </div>
            )}

            <div className="chef-photos-field">
              <label htmlFor="chef-photo-description">
                Description (facultative)
              </label>

              <textarea
                id="chef-photo-description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Décrivez les travaux visibles..."
                rows={3}
              />
            </div>

            <button
              type="submit"
              className="chef-photos-submit"
              disabled={uploading || !selectedFile || !selectedProject}
            >
              {uploading ? "Envoi en cours..." : "Ajouter la photo"}
            </button>
          </form>
        )}
      </section>

      {/* GALERIE */}

      <section className="chef-photos-gallery-section">
        <div className="chef-photos-gallery-header">
          <h2>Galerie des photos</h2>
          <span>{photos.length} photo(s)</span>
        </div>

        {photos.length === 0 ? (
          <p className="chef-photos-empty">
            Aucune photo n'a encore été ajoutée.
          </p>
        ) : (
          <div className="chef-photos-gallery">
            {photos.map((photo) => {
              const projectId =
                typeof photo.id_projet === "object"
                  ? photo.id_projet?.id_projet
                  : photo.id_projet;

              const project = projects.find(
                (item) => String(item.id_projet) === String(projectId)
              );

              const photoUrl = getPhotoUrl(photo);

              return (
                <article className="chef-photos-card" key={photo.id_photo}>
                  <div className="chef-photos-image-container">
                    {photoUrl ? (
                      <button
                        type="button"
                        className="chef-photos-image-button"
                        onClick={() => setSelectedPhoto(photo)}
                        aria-label="Afficher la photo en grand"
                        title="Afficher en grand"
                      >
                        <img
                          className="chef-photos-card-image"
                          src={photoUrl}
                          alt={photo.description || "Photo du chantier"}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";

                            const placeholder =
                              event.currentTarget.parentElement?.querySelector(
                                ".chef-photos-image-placeholder"
                              );

                            if (placeholder) {
                              placeholder.style.display = "flex";
                            }
                          }}
                        />
                        <span className="chef-photos-zoom-hint">
                          Agrandir <span aria-hidden="true">⤢</span>
                        </span>
                      </button>
                    ) : null}

                    <div
                      className="chef-photos-image-placeholder"
                      style={{ display: photoUrl ? "none" : "flex" }}
                    >
                      Image indisponible
                    </div>

                    <button
                      type="button"
                      className="chef-photos-delete-button"
                      onClick={() => handleDeletePhoto(photo)}
                      disabled={deletingPhotoId !== null}
                      aria-label="Supprimer cette photo"
                      title="Supprimer la photo"
                    >
                      {deletingPhotoId === photo.id_photo
                        ? "Suppression..."
                        : "🗑"}
                    </button>
                  </div>

                  <div className="chef-photos-card-content">
                    <h3>
                      {project?.nom ||
                        (typeof photo.id_projet === "object"
                          ? photo.id_projet?.nom
                          : "Chantier")}
                    </h3>

                    <p>{photo.description || "Aucune description"}</p>

                    {photo.date_ajout && (
                      <small>
                        Ajoutée le{" "}
                        {new Date(photo.date_ajout).toLocaleString("fr-FR")}
                      </small>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* FENETRE DE VISUALISATION EN GRAND */}

      {selectedPhoto && (
        <div
          className="chef-photos-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Visualisation de la photo"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            type="button"
            className="chef-photos-modal-close"
            onClick={() => setSelectedPhoto(null)}
            aria-label="Fermer la photo"
            title="Fermer"
          >
            ×
          </button>

          <div
            className="chef-photos-modal-content"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={getPhotoUrl(selectedPhoto)}
              alt={selectedPhoto.description || "Photo du chantier en grand"}
            />

            {selectedPhoto.description && (
              <p>{selectedPhoto.description}</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

export default ChefPhotos;