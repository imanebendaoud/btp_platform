import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
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
  (error) => {
    return Promise.reject(error);
  }
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

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    // Si ce n'est pas une erreur 401, on laisse passer
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // Ne pas tenter de refresh pour login ou refresh
    if (
      originalRequest.url?.includes("/auth/login/") ||
      originalRequest.url?.includes("/auth/refresh/")
    ) {
      return Promise.reject(error);
    }

    // Éviter une boucle infinie
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

    // Si un refresh est déjà en cours
    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(api(originalRequest));
        });
      });
    }

    isRefreshing = true;

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/auth/refresh/",
        {
          refresh: refreshToken,
        }
      );

      const newAccessToken = response.data.access;

      localStorage.setItem("accessToken", newAccessToken);

      isRefreshing = false;

      onRefreshed(newAccessToken);

      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      refreshSubscribers = [];

      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");

      return Promise.reject(refreshError);
    }
  }
);

export default api;