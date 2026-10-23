import api from "./api";

const BASE = "/finance/demandes-financement";

const asList = (data) => (Array.isArray(data) ? data : data?.results || []);

export const getDemandes = async () => asList((await api.get(`${BASE}/`)).data);
export const getDemande = async (id) => (await api.get(`${BASE}/${id}/`)).data;
export const createDemande = async (d) => (await api.post(`${BASE}/`, d)).data;
export const updateDemande = async (id, d) => (await api.patch(`${BASE}/${id}/`, d)).data;
export const deleteDemande = async (id) => (await api.delete(`${BASE}/${id}/`)).data;

// Utilisées côté finance
export const validerDemande = async (id, d) => (await api.post(`${BASE}/${id}/valider/`, d)).data;
export const refuserDemande = async (id, d) => (await api.post(`${BASE}/${id}/refuser/`, d)).data;

export const MOTIFS = {
  ACHAT_EQUIPEMENT: "Achat d'équipement",
  REPARATION: "Réparation",
  PIECES_DETACHEES: "Pièces détachées",
  MAINTENANCE_PREVENTIVE: "Maintenance préventive",
};

export const motifLabel = (m) => MOTIFS[m] || m || "-";

export const statutDemandeBadge = (s) => {
  if (s === "VALIDEE") return "ok";
  if (s === "REFUSEE") return "danger";
  return "warn";
};

export const statutDemandeLabel = (s) => {
  if (s === "VALIDEE") return "Validée";
  if (s === "REFUSEE") return "Refusée";
  return "En attente";
};

// Extrait un message lisible d'une erreur DRF
export const extractError = (err, fallback) => {
  const d = err?.response?.data;
  if (!d || typeof d === "string") return fallback;
  if (d.detail) return d.detail;
  const first = Object.values(d)[0];
  if (Array.isArray(first)) return first[0] || fallback;
  return typeof first === "string" ? first : fallback;
};