import api from "./api";

const BASE = "/maintenance";

const asList = (data) => (Array.isArray(data) ? data : data?.results || []);

const list = async (path) => asList((await api.get(`${BASE}/${path}/`)).data);
const one = async (path, id) => (await api.get(`${BASE}/${path}/${id}/`)).data;
const create = async (path, d) => (await api.post(`${BASE}/${path}/`, d)).data;
const update = async (path, id, d) => (await api.put(`${BASE}/${path}/${id}/`, d)).data;
const patch = async (path, id, d) => (await api.patch(`${BASE}/${path}/${id}/`, d)).data;
const remove = async (path, id) => (await api.delete(`${BASE}/${path}/${id}/`)).data;

export const getEquipements = () => list("equipements");
export const getEquipement = (id) => one("equipements", id);
export const createEquipement = (d) => create("equipements", d);
export const updateEquipement = (id, d) => update("equipements", id, d);
export const patchEquipement = (id, d) => patch("equipements", id, d);
export const deleteEquipement = (id) => remove("equipements", id);

export const getAffectations = () => list("affectations");
export const getAffectation = (id) => one("affectations", id);
export const createAffectation = (d) => create("affectations", d);
export const updateAffectation = (id, d) => update("affectations", id, d);
export const deleteAffectation = (id) => remove("affectations", id);

export const getMaintenances = () => list("maintenances");
export const getMaintenance = (id) => one("maintenances", id);
export const createMaintenance = (d) => create("maintenances", d);
export const updateMaintenance = (id, d) => update("maintenances", id, d);
export const deleteMaintenance = (id) => remove("maintenances", id);

export const getProjets = async () => {
  try {
    return asList((await api.get("/projects/projets/")).data);
  } catch (err) {
    console.warn("Projets non accessibles pour ce rôle", err?.response?.status);
    return [];
  }
};

// ---------- helpers partagés ----------

export const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString("fr-FR");
};

export const formatMoney = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return new Intl.NumberFormat("fr-MA").format(value) + " DH";
};

export const isPanne = (etat) => String(etat || "").toUpperCase().includes("PANNE");

export const isOpen = (statut) =>
  !["TERMINEE", "TERMINE", "TERMINÉE", "ANNULEE", "ANNULÉE"].includes(
    String(statut || "").toUpperCase()
  );

export const etatBadge = (etat) => {
  const v = String(etat || "").toUpperCase();
  if (v.includes("PANNE")) return "danger";
  if (v.includes("MAINTENANCE")) return "warn";
  if (v === "BON" || v === "OK") return "ok";
  return "muted";
};

export const statutBadge = (statut) => {
  const v = String(statut || "").toUpperCase();
  if (v.startsWith("TERMIN")) return "ok";
  if (v === "EN_COURS") return "warn";
  if (v.startsWith("ANNUL")) return "muted";
  return "info";
};

export const nullIfEmpty = (v) => (v === "" || v === undefined ? null : v);