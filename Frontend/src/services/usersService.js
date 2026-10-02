import api from "./api";

// Récupérer tous les utilisateurs
export const getUsers = async () => {
  const response = await api.get("/users/utilisateurs/");
  return response.data;
};

// Récupérer un utilisateur par son ID
export const getUser = async (id) => {
  const response = await api.get(`/users/utilisateurs/${id}/`);
  return response.data;
};

// Créer un nouvel utilisateur
export const createUser = async (data) => {
  const response = await api.post("/users/utilisateurs/", data);
  return response.data;
};

// Modifier un utilisateur
export const updateUser = async (id, data) => {
  const response = await api.patch(
    `/users/utilisateurs/${id}/`,
    data
  );
  return response.data;
};

// Supprimer un utilisateur
export const deleteUser = async (id) => {
  const response = await api.delete(
    `/users/utilisateurs/${id}/`
  );
  return response.data;
};