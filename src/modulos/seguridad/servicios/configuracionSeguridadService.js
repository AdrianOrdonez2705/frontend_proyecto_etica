import api from "../../../services";

const getToken = () => localStorage.getItem("token");

const headers = () => ({
  Authorization: `Bearer ${getToken()}`,
});

export const obtenerConfiguracionSeguridad = async () => {
  const response = await api.get("/configuracion-seguridad", {
    headers: headers(),
  });
  return response.data;
};

export const actualizarConfiguracionSeguridad = async (datos) => {
  const response = await api.put("/configuracion-seguridad", datos, {
    headers: headers(),
  });
  return response.data;
};
