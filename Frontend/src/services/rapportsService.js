import api from "./api";

// ============================================================
// RAPPORTS CHANTIER
// Endpoint : /api/projects/rapports/
// ============================================================

export const getRapports = async () => {
  const response = await api.get("/projects/rapports/");
  return response.data;
};

export const getRapport = async (id) => {
  const response = await api.get(`/projects/rapports/${id}/`);
  return response.data;
};