import api from "./api";

// ============================================================
// EMPLOYES
// ============================================================

export const getEmployes = async () => {
  const response = await api.get("/hr/employes/");
  return response.data;
};

export const getEmploye = async (id) => {
  const response = await api.get(`/hr/employes/${id}/`);
  return response.data;
};

export const createEmploye = async (data) => {
  const response = await api.post("/hr/employes/", data);
  return response.data;
};

export const updateEmploye = async (id, data) => {
  const response = await api.put(`/hr/employes/${id}/`, data);
  return response.data;
};

export const deleteEmploye = async (id) => {
  const response = await api.delete(`/hr/employes/${id}/`);
  return response.data;
};

// ============================================================
// AFFECTATIONS
// ============================================================

export const getAffectations = async () => {
  const response = await api.get("/hr/affectations/");
  return response.data;
};

export const getAffectation = async (id) => {
  const response = await api.get(`/hr/affectations/${id}/`);
  return response.data;
};

export const createAffectation = async (data) => {
  const response = await api.post("/hr/affectations/", data);
  return response.data;
};

export const updateAffectation = async (id, data) => {
  const response = await api.put(`/hr/affectations/${id}/`, data);
  return response.data;
};

export const deleteAffectation = async (id) => {
  const response = await api.delete(`/hr/affectations/${id}/`);
  return response.data;
};

// ============================================================
// CONTRATS
// ============================================================

export const getContrats = async () => {
  const response = await api.get("/hr/contrats/");
  return response.data;
};

export const getContrat = async (id) => {
  const response = await api.get(`/hr/contrats/${id}/`);
  return response.data;
};

export const createContrat = async (data) => {
  const response = await api.post("/hr/contrats/", data);
  return response.data;
};

export const updateContrat = async (id, data) => {
  const response = await api.put(`/hr/contrats/${id}/`, data);
  return response.data;
};

export const deleteContrat = async (id) => {
  const response = await api.delete(`/hr/contrats/${id}/`);
  return response.data;
};

// ============================================================
// CONGES / ABSENCES
// ============================================================

export const getConges = async () => {
  const response = await api.get("/hr/conges-absences/");
  return response.data;
};

export const getConge = async (id) => {
  const response = await api.get(`/hr/conges-absences/${id}/`);
  return response.data;
};

export const createConge = async (data) => {
  const response = await api.post("/hr/conges-absences/", data);
  return response.data;
};
export const patchConge = async (id, data) => {
  const response = await api.patch(`/hr/conges-absences/${id}/`, data);
  return response.data;
};
export const updateConge = async (id, data) => {
  const response = await api.put(`/hr/conges-absences/${id}/`, data);
  return response.data;
};

export const deleteConge = async (id) => {
  const response = await api.delete(`/hr/conges-absences/${id}/`);
  return response.data;
};

// ============================================================
// POINTAGES
// ============================================================

export const getPointages = async () => {
  const response = await api.get("/hr/pointages/");
  return response.data;
};

export const getPointage = async (id) => {
  const response = await api.get(`/hr/pointages/${id}/`);
  return response.data;
};

export const createPointage = async (data) => {
  const response = await api.post("/hr/pointages/", data);
  return response.data;
};

export const updatePointage = async (id, data) => {
  const response = await api.put(`/hr/pointages/${id}/`, data);
  return response.data;
};

export const deletePointage = async (id) => {
  const response = await api.delete(`/hr/pointages/${id}/`);
  return response.data;
};