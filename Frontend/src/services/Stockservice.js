import api from "./api";

// ============================================================
// MATÉRIAUX
// ============================================================

export const getMateriaux = async () => {
  const response = await api.get("/stock/materiaux/");
  return response.data;
};

export const getMateriau = async (id) => {
  const response = await api.get(`/stock/materiaux/${id}/`);
  return response.data;
};

export const createMateriau = async (data) => {
  const response = await api.post("/stock/materiaux/", data);
  return response.data;
};

export const updateMateriau = async (id, data) => {
  const response = await api.patch(`/stock/materiaux/${id}/`, data);
  return response.data;
};

export const deleteMateriau = async (id) => {
  const response = await api.delete(`/stock/materiaux/${id}/`);
  return response.data;
};


// ============================================================
// FOURNISSEURS
// ============================================================

export const getFournisseurs = async () => {
  const response = await api.get("/stock/fournisseurs/");
  return response.data;
};

export const getFournisseur = async (id) => {
  const response = await api.get(`/stock/fournisseurs/${id}/`);
  return response.data;
};

export const createFournisseur = async (data) => {
  const response = await api.post("/stock/fournisseurs/", data);
  return response.data;
};

export const updateFournisseur = async (id, data) => {
  const response = await api.patch(`/stock/fournisseurs/${id}/`, data);
  return response.data;
};

export const deleteFournisseur = async (id) => {
  const response = await api.delete(`/stock/fournisseurs/${id}/`);
  return response.data;
};


// ============================================================
// ACHATS
// ============================================================

export const getAchats = async () => {
  const response = await api.get("/stock/achats/");
  return response.data;
};

export const getAchat = async (id) => {
  const response = await api.get(`/stock/achats/${id}/`);
  return response.data;
};

export const createAchat = async (data) => {
  const response = await api.post("/stock/achats/", data);
  return response.data;
};

export const updateAchat = async (id, data) => {
  const response = await api.patch(`/stock/achats/${id}/`, data);
  return response.data;
};

export const deleteAchat = async (id) => {
  const response = await api.delete(`/stock/achats/${id}/`);
  return response.data;
};


// ============================================================
// MOUVEMENTS DE STOCK
// ============================================================

export const getMouvements = async () => {
  const response = await api.get("/stock/mouvements/");
  return response.data;
};

export const getMouvement = async (id) => {
  const response = await api.get(`/stock/mouvements/${id}/`);
  return response.data;
};

export const createMouvement = async (data) => {
  const response = await api.post("/stock/mouvements/", data);
  return response.data;
};

export const updateMouvement = async (id, data) => {
  const response = await api.patch(`/stock/mouvements/${id}/`, data);
  return response.data;
};

export const deleteMouvement = async (id) => {
  const response = await api.delete(`/stock/mouvements/${id}/`);
  return response.data;
};