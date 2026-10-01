import api from "./api";

const BASE = "/projects/projets/";

export const getProjects = async () => {
  const response = await api.get(BASE);
  // Gère à la fois une réponse paginée DRF ({results: [...]}) et un tableau simple
  return response.data.results ?? response.data;
};

export const getProject = async (id) => {
  const response = await api.get(`${BASE}${id}/`);
  return response.data;
};

export const createProject = async (payload) => {
  const response = await api.post(BASE, payload);
  return response.data;
};

export const updateProject = async (id, payload) => {
  const response = await api.patch(`${BASE}${id}/`, payload);
  return response.data;
};

export const deleteProject = async (id) => {
  await api.delete(`${BASE}${id}/`);
};

// =========================
// TÂCHES
// =========================

const TACHES_BASE = "/projects/taches/";

export const getTaches = async () => {
  const response = await api.get(TACHES_BASE);
  return response.data.results ?? response.data;
};

export const createTache = async (payload) => {
  const response = await api.post(TACHES_BASE, payload);
  return response.data;
};

export const updateTache = async (id, payload) => {
  const response = await api.patch(`${TACHES_BASE}${id}/`, payload);
  return response.data;
};

export const deleteTache = async (id) => {
  await api.delete(`${TACHES_BASE}${id}/`);
};

// =========================
// AVANCEMENT
// =========================

const AVANCEMENTS_BASE = "/projects/avancements/";

export const getAvancements = async () => {
  const response = await api.get(AVANCEMENTS_BASE);
  return response.data.results ?? response.data;
};

export const createAvancement = async (payload) => {
  const response = await api.post(AVANCEMENTS_BASE, payload);
  return response.data;
};

// =========================
// DOCUMENTS
// =========================

const DOCUMENTS_BASE = "/projects/documents/";

export const getDocuments = async () => {
  const response = await api.get(DOCUMENTS_BASE);
  return response.data.results ?? response.data;
};

export const createDocument = async (payload) => {
  const response = await api.post(DOCUMENTS_BASE, payload);
  return response.data;
};

export const deleteDocument = async (id) => {
  await api.delete(`${DOCUMENTS_BASE}${id}/`);
};

// =========================
// PHOTOS
// =========================

const PHOTOS_BASE = "/projects/photos/";

export const getPhotos = async () => {
  const response = await api.get(PHOTOS_BASE);
  return response.data.results ?? response.data;
};

export const createPhoto = async (payload) => {
  const response = await api.post(PHOTOS_BASE, payload);
  return response.data;
};

export const deletePhoto = async (id) => {
  await api.delete(`${PHOTOS_BASE}${id}/`);
};

// =========================
// RAPPORTS DE CHANTIER
// =========================

const RAPPORTS_BASE = "/projects/rapports/";

export const getRapports = async () => {
  const response = await api.get(RAPPORTS_BASE);
  return response.data.results ?? response.data;
};

export const createRapport = async (payload) => {
  const response = await api.post(RAPPORTS_BASE, payload);
  return response.data;
};

export const deleteRapport = async (id) => {
  await api.delete(`${RAPPORTS_BASE}${id}/`);
};