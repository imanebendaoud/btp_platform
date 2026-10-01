import api from "./api";

export const login = async (email, password) => {
  const response = await api.post("/auth/login/", {
    email: email,
    password: password,
  });

  return response.data;
};

export const getMe = async (accessToken) => {
  const response = await api.get("/auth/me/", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return response.data;
};