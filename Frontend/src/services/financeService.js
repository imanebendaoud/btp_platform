const API_URL = "http://127.0.0.1:8000/api/finance";

async function request(endpoint, options = {}) {
  const token = localStorage.getItem("accessToken");

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let errorMessage = "Une erreur est survenue.";

    try {
      const errorData = await response.json();

      errorMessage =
        errorData.detail ||
        errorData.message ||
        JSON.stringify(errorData);
    } catch {
      errorMessage = `Erreur HTTP ${response.status}`;
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}


// ===============================
// BUDGETS
// ===============================

export async function getBudgets() {
  return request("/budgets/");
}

export async function getBudget(id) {
  return request(`/budgets/${id}/`);
}


// ===============================
// DEPENSES
// ===============================

export async function getDepenses() {
  return request("/depenses/");
}

export async function getDepense(id) {
  return request(`/depenses/${id}/`);
}