import axios from "axios";

const getApiUrl = () =>
  `${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}/auth`;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

export default {
  login(correo, password) {
    return axios.post(`${getApiUrl()}/login`, {
      correo,
      password,
    });
  },

  verificarToken(token) {
    return axios.get(`${getApiUrl()}/verificar`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  },

  obtenerPermisos() {
    return axios.get(`${getApiUrl()}/permisos`, { headers: authHeaders() });
  },

  logout() {
    return axios.post(`${getApiUrl()}/logout`);
  },
};
