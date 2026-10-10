import api from "../../../services";

const getToken = () => localStorage.getItem("token");

export const logout = async () => {
  try {
    return api.post("/auth/logout");
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

export const listarOfertaCarrera = async () => {
  return api.get("/inscripcion/materias", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const materiaOfertaDetalle = async (id_materia) => {
  return api.get(`/inscripcion/materias/${id_materia}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const listarOfertaExtra = async () => {
  return api.get("/inscripcion/extracurriculares", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const detalleExtracurricular = async (id_materia) => {
  return api.get(`/inscripcion/extracurriculares/${id_materia}`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const listarMisMaterias = async () => {
  return api.get("/inscripcion/mis-inscripciones", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const listarInscripcionesActivas = async () => {
  return api.get("/inscripcion/activas", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const listarMateriasEnCurso = async () => {
  return api.get("/inscripcion/en-curso", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const listarMateriasCulminadas = async () => {
  return api.get("/inscripcion/culminadas", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const listarMateriasRetiradas = async () => {
  return api.get("/inscripcion/retiradas", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const listarEstadoAcademico = async () => {
  return api.get("/inscripcion/estado-academico", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};

export const actualizarEstadosAcademicos = async () => {
  try {
    const response = await api.post(
      "/inscripcion/actualizar-estados",
      {},
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error al actualizar estados académicos:",
      error.response?.data || error,
    );

    throw error.response?.data || error;
  }
};

export const inscribirMaterias = async (materias) => {
  try {
    const response = await api.post(
      "/inscripcion",
      { materias },
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error(
      "Error al inscribir materias:",
      error.response?.data || error,
    );

    throw error.response?.data || error;
  }
};

export const pagarInscripcion = async (idInscripcion, datosPago) => {
  try {
    const response = await api.post(
      `/pagos/inscripciones/${idInscripcion}/pagar`,
      datosPago,
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error al pagar inscripción:", error.response?.data || error);

    throw error.response?.data || error;
  }
};

export const retirarMateria = async (inscripcionId, materiaId) => {
  try {
    const response = await api.patch(
      `/inscripcion/${inscripcionId}/materias/${materiaId}/retirar`,
      {},
      {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Error al retirar materia:", error.response?.data || error);

    throw error.response?.data || error;
  }
};

export const miPerfil = async () => {
  return api.get("/estudiantes/mi-perfil", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });
};
