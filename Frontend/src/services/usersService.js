import api from "./api";

export const getUsers = async () => {
  const response = await api.get("/auth/utilisateurs/");
  return response.data.results ?? response.data;
};