import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Instance séparée pour renouveler le token sans déclencher
// les intercepteurs de réponse de l'instance principale.
const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================================
// AJOUTER LE ACCESS TOKEN À CHAQUE REQUÊTE
// ============================================================

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// RENOUVELER AUTOMATIQUEMENT LE ACCESS TOKEN
// ============================================================

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const onRefreshFailed = (error) => {
  refreshSubscribers.forEach((callback) => callback(null, error));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Ne pas renouveler le token pour login ou refresh.
    if (
      originalRequest.url?.includes("/auth/login/") ||
      originalRequest.url?.includes("/auth/refresh/")
    ) {
      return Promise.reject(error);
    }

    // Éviter une boucle infinie.
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      return Promise.reject(error);
    }

    // Si un renouvellement est déjà en cours,
    // attendre son résultat avant de relancer la requête.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken, refreshError) => {
          if (refreshError || !newToken) {
            reject(refreshError || error);
            return;
          }

          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;

          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await refreshApi.post("/auth/refresh/", {
        refresh: refreshToken,
      });

      const newAccessToken = response.data.access;

      if (!newAccessToken) {
        throw new Error("Le serveur n'a pas retourné de nouveau access token.");
      }

      localStorage.setItem("accessToken", newAccessToken);

      isRefreshing = false;
      onRefreshed(newAccessToken);

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      onRefreshFailed(refreshError);

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      return Promise.reject(refreshError);
    }
  }
);

export default api;