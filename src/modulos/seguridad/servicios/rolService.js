import api from "../../../services";

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  Authorization: `Bearer ${getToken()}`,
});

export const listarPermisos = async () => {
  const response = await api.get("/permisos", { headers: headers() });
  return response.data;
};

export const listarRoles = async () => {
  const response = await api.get("/roles", { headers: headers() });
  return response.data;
};

export const verRol = async (id) => {
  const response = await api.get(`/roles/${id}`, { headers: headers() });
  return response.data;
};

export const crearRol = async (datos) => {
  const response = await api.post("/roles", datos, { headers: headers() });
  return response.data;
};

export const editarRol = async (id, datos) => {
  const response = await api.put(`/roles/${id}`, datos, {
    headers: headers(),
  });
  return response.data;
};

export const asignarPermisos = async (id, permisos) => {
  const response = await api.post(
    `/roles/${id}/permisos`,
    { permisos },
    { headers: headers() },
  );
  return response.data;
};

export const eliminarRol = async (id) => {
  const response = await api.delete(`/roles/${id}`, { headers: headers() });
  return response.data;
};

export const listarUsuarios = async () => {
  const response = await api.get("/usuarios", { headers: headers() });
  return response.data;
};

export const verUsuario = async (ci) => {
  const response = await api.get(`/usuarios/${ci}`, { headers: headers() });
  return response.data;
};

export const verAcademico = async (ci) => {
  const response = await api.get(`/usuarios/${ci}/academico`, {
    headers: headers(),
  });
  return response.data;
};

export const crearUsuario = async (datos) => {
  const response = await api.post("/usuarios", datos, { headers: headers() });
  return response.data;
};

export const editarUsuario = async (ci, datos) => {
  const response = await api.put(`/usuarios/${ci}`, datos, {
    headers: headers(),
  });
  return response.data;
};

export const eliminarUsuario = async (ci) => {
  const response = await api.delete(`/usuarios/${ci}`, {
    headers: headers(),
  });
  return response.data;
};
