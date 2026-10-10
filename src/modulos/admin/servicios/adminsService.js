import api from "../../../services";

const getToken = () => localStorage.getItem("token");

export const listarCarreras = async () => {
  return api.get("/carreras", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const verCarrera = async (id) => {
  return api.get(`/carreras/${id}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const listarCursos = async () => {
  return api.get("/cursos", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const listarExtra = async () => {
  return api.get("/cursos-extracurriculares", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const registrarCarrera = async (datos) => {
  try {
    const response = await api.post("/carreras", datos, {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      return error.response.data;
    }
    return {
      exito: false,
      mensaje: "Error de conexion con el servidor",
      errores: ["No se pudo conectar con el backend"],
    };
  }
};
