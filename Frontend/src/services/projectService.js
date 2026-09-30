import api from "./api";


// ============================================================
// PROJETS
// ============================================================

export const getMyProjects = async (accessToken) => {
  const response = await api.get("/projects/projets/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};


// ============================================================
// TACHES
// ============================================================

export const getMyTasks = async (accessToken) => {
  const response = await api.get("/projects/taches/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};


// ============================================================
// AVANCEMENTS
// ============================================================

export const getMyProgress = async (accessToken) => {
  const response = await api.get("/projects/avancements/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};


// ============================================================
// RAPPORTS
// ============================================================

export const getMyReports = async (accessToken) => {
  const response = await api.get("/projects/rapports/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};


// ============================================================
// PHOTOS
// ============================================================

export const getMyPhotos = async (accessToken) => {
  const response = await api.get("/projects/photos/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};


// ============================================================
// DOCUMENTS
// ============================================================

export const getMyDocuments = async (accessToken) => {
  const response = await api.get("/projects/documents/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};


// ============================================================
// NOTIFICATIONS
// ============================================================

export const getMyNotifications = async (accessToken) => {
  const response = await api.get("/projects/notifications/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};