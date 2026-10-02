import api from "./api";

// =========================
// MATÉRIAUX
// =========================

const MATERIAUX_BASE = "/stock/materiaux/";

export const getMateriaux = async () => {
  const response = await api.get(MATERIAUX_BASE);
  return response.data.results ?? response.data;
};

export const getMateriau = async (id) => {
  const response = await api.get(`${MATERIAUX_BASE}${id}/`);
  return response.data;
};

export const createMateriau = async (payload) => {
  const response = await api.post(MATERIAUX_BASE, payload);
  return response.data;
};

export const updateMateriau = async (id, payload) => {
  const response = await api.patch(`${MATERIAUX_BASE}${id}/`, payload);
  return response.data;
};

export const deleteMateriau = async (id) => {
  await api.delete(`${MATERIAUX_BASE}${id}/`);
};

// =========================
// MOUVEMENTS DE STOCK
// =========================

const MOUVEMENTS_BASE = "/stock/mouvements/";

export const getMouvements = async () => {
  const response = await api.get(MOUVEMENTS_BASE);
  return response.data.results ?? response.data;
};

export const createMouvement = async (payload) => {
  const response = await api.post(MOUVEMENTS_BASE, payload);
  return response.data;
};

// =========================
// ACHATS
// =========================

const ACHATS_BASE = "/stock/achats/";

export const getAchats = async () => {
  const response = await api.get(ACHATS_BASE);
  return response.data.results ?? response.data;
};

export const createAchat = async (payload) => {
  const response = await api.post(ACHATS_BASE, payload);
  return response.data;
};

// =========================
// FOURNISSEURS
// =========================

const FOURNISSEURS_BASE = "/stock/fournisseurs/";

export const getFournisseurs = async () => {
  const response = await api.get(FOURNISSEURS_BASE);
  return response.data.results ?? response.data;
};

export const createFournisseur = async (payload) => {
  const response = await api.post(FOURNISSEURS_BASE, payload);
  return response.data;
};