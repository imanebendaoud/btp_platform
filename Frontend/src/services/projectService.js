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
// TÂCHES
// ============================================================

export const getMyTasks = async (accessToken) => {
  const response = await api.get("/projects/taches/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};


export const createTask = async (accessToken, taskData) => {
  const response = await api.post(
    "/projects/taches/",
    taskData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};


export const updateTask = async (
  accessToken,
  taskId,
  taskData
) => {
  const response = await api.patch(
    `/projects/taches/${taskId}/`,
    taskData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

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


export const createProgress = async (
  accessToken,
  progressData
) => {
  const response = await api.post(
    "/projects/avancements/",
    progressData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};


export const updateProgress = async (
  accessToken,
  progressId,
  progressData
) => {
  const response = await api.patch(
    `/projects/avancements/${progressId}/`,
    progressData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};


export const deleteProgress = async (
  accessToken,
  progressId
) => {
  const response = await api.delete(
    `/projects/avancements/${progressId}/`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  return response.data;
};

// ============================================================
// RAPPORTS
// ============================================================

export const getMyReports = async (accessToken) => {
  const response = await api.get("/projects/rapports/", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const createReport = async (accessToken, reportData) => {
  const response = await api.post("/projects/rapports/", reportData, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  return response.data;
};

export const updateReport = async (accessToken, reportId, reportData) => {
  const response = await api.patch(
    `/projects/rapports/${reportId}/`,
    reportData,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  return response.data;
};

export const deleteReport = async (accessToken, reportId) => {
  const response = await api.delete(
    `/projects/rapports/${reportId}/`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
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


