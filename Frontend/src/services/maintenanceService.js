const API_URL = "http://127.0.0.1:8000/api/maintenance";

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
    let message = "Une erreur est survenue.";

    try {
      const data = await response.json();

      message =
        data.detail ||
        data.message ||
        JSON.stringify(data);
    } catch {
      message = `Erreur HTTP ${response.status}`;
    }

    throw new Error(message);
  }

  return response.json();
}


// ========================================
// ÉQUIPEMENTS
// ========================================

export async function getEquipements() {
  return request("/equipements/");
}

export async function getEquipement(id) {
  return request(`/equipements/${id}/`);
}


// ========================================
// AFFECTATIONS
// ========================================

export async function getAffectations() {
  return request("/affectations/");
}

export async function getAffectation(id) {
  return request(`/affectations/${id}/`);
}


// ========================================
// MAINTENANCES
// ========================================

export async function getMaintenances() {
  return request("/maintenances/");
}

export async function getMaintenance(id) {
  return request(`/maintenances/${id}/`);
}