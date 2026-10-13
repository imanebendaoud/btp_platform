const API_URL = "http://127.0.0.1:8000/api/hr";

async function request(endpoint) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    let message = `Erreur HTTP ${response.status}`;

    try {
      const data = await response.json();
      message =
        data.detail ||
        data.message ||
        JSON.stringify(data);
    } catch {
      // On conserve le message HTTP.
    }

    throw new Error(message);
  }

  return response.json();
}

export const getEmployes = () => request("/employes/");
export const getAffectationsEmployes = () => request("/affectations/");
export const getContrats = () => request("/contrats/");
export const getCongesAbsences = () => request("/conges-absences/");
export const getPointages = () => request("/pointages/");

export const getEmploye = (id) => request(`/employes/${id}/`);
export const getAffectationEmploye = (id) => request(`/affectations/${id}/`);
export const getContrat = (id) => request(`/contrats/${id}/`);
export const getCongeAbsence = (id) => request(`/conges-absences/${id}/`);
export const getPointage = (id) => request(`/pointages/${id}/`);