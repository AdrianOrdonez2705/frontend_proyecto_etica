import axios from "axios";
import { API_URL } from "@/config/api.js";

const getApiUrl = () => `${API_URL}/auth`;

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
});

export function tienePermiso(codigo) {
  try {
    const permisos = JSON.parse(localStorage.getItem("permisos") || "[]");
    return Array.isArray(permisos) && permisos.includes(codigo);
  } catch (error) {
    return false;
  }
}

export function guardarSesion(data) {
  localStorage.setItem("token", data.token);
  localStorage.setItem("login_id", data.usuario.login_id || "");
  localStorage.setItem("nombre", data.usuario.nombre_completo || data.usuario.nombre);
  localStorage.setItem("ci", data.usuario.ci);
  localStorage.setItem("rol", data.usuario.rol.nombre);
  localStorage.setItem("permisos", JSON.stringify(data.usuario.permisos || []));
}

export default {
  login(login_id, password) {
    return axios.post(`${getApiUrl()}/login`, {
      login_id,
      password,
    });
  },

  verificarCodigo(desafio_id, codigo) {
    return axios.post(`${getApiUrl()}/verificar-codigo`, {
      desafio_id,
      codigo,
    });
  },

  reenviarCodigo(desafio_id) {
    return axios.post(`${getApiUrl()}/reenviar-codigo`, {
      desafio_id,
    });
  },

  cambiarContrasenia(actual, nueva) {
    return axios.post(
      `${getApiUrl()}/cambiar-contrasenia`,
      { actual, nueva },
      { headers: authHeaders() },
    );
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

  solicitarRecuperacion(identificador) {
    return axios.post(`${getApiUrl()}/recuperar-contrasenia`, {
      identificador,
    });
  },

  verificarTokenRecuperacion(token) {
    return axios.get(`${getApiUrl()}/recuperar-contrasenia/verificar`, {
      params: { token },
    });
  },

  restablecerContrasenia(token, nueva) {
    return axios.post(`${getApiUrl()}/restablecer-contrasenia`, {
      token,
      nueva,
    });
  },

  logout() {
    return axios.post(`${getApiUrl()}/logout`);
  },
};
