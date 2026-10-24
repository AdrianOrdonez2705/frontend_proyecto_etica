<template>
  <div>
    <h2>Usuarios</h2>
    <p class="subtitle">Gestión de usuarios del sistema</p>

    <div class="barra">
      <input
        type="text"
        v-model="busqueda"
        placeholder="Buscar por CI, Login ID, nombre o correo"
      />
      <select v-model="filtroRol">
        <option value="">Todos los roles</option>
        <option
          v-for="rol in roles"
          :key="rol.id_rol"
          :value="rol.rol"
        >
          {{ rol.rol }}
        </option>
      </select>
      <router-link :to="{ name: 'crearUsuario' }" class="btn">
        Crear usuario
      </router-link>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="exito" class="exito">{{ exito }}</p>

    <div class="form-card">
      <div class="table-scroll">
        <table class="tabla">
          <thead>
            <tr>
              <th>CI</th>
              <th>Login ID</th>
              <th>Nombre completo</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in filtrados" :key="u.ci">
              <td>{{ u.ci }}</td>
              <td>{{ u.login_id }}</td>
              <td>{{ nombreCompleto(u) }}</td>
              <td>{{ u.correo }}</td>
              <td>{{ u.rol ? u.rol.rol : "" }}</td>
              <td>
                <span
                  class="badge"
                  :class="u.bloqueado ? 'bloqueado' : 'activo'"
                >
                  {{ u.bloqueado ? "Bloqueado" : "Activo" }}
                </span>
              </td>
              <td class="acciones">
                <router-link
                  :to="{ name: 'detalleUsuario', params: { ci: u.ci } }"
                  class="btn-pequeno"
                >
                  Ver
                </router-link>
                <button
                  v-if="u.bloqueado && puedeDesbloquear"
                  class="btn-pequeno"
                  @click="desbloquear(u)"
                >
                  Desbloquear
                </button>
                <button
                  class="btn-pequeno peligro"
                  @click="eliminar(u)"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
      </table>
      </div>
      <p v-if="filtrados.length === 0">No hay usuarios para mostrar.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  listarUsuarios,
  eliminarUsuario,
  desbloquearUsuario,
} from "../servicios/rolService";
import { tienePermiso } from "../servicios/AuthServicio";

const usuarios = ref([]);
const roles = ref([]);
const busqueda = ref("");
const filtroRol = ref("");
const error = ref("");
const exito = ref("");
const puedeDesbloquear = tienePermiso("usuarios.desbloquear");

function nombreCompleto(u) {
  return [u.nombre, u.apellido_paterno, u.apellido_materno]
    .filter(Boolean)
    .join(" ");
}

const filtrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase();
  return usuarios.value.filter((u) => {
    if (filtroRol.value && (!u.rol || u.rol.rol !== filtroRol.value)) {
      return false;
    }
    if (!texto) return true;
    const juntado = [
      u.ci,
      u.login_id,
      u.correo,
      nombreCompleto(u),
    ]
      .join(" ")
      .toLowerCase();
    return juntado.includes(texto);
  });
});

async function cargar() {
  error.value = "";
  try {
    const respuesta = await listarUsuarios();
    if (respuesta.exito) {
      usuarios.value = respuesta.data || [];
      const mapa = {};
      usuarios.value.forEach((u) => {
        if (u.rol) mapa[u.rol.rol] = u.rol;
      });
      roles.value = Object.values(mapa);
    } else {
      error.value = respuesta.mensaje || "No se pudo listar usuarios";
    }
  } catch (err) {
    error.value =
      err.response?.data?.mensaje || "Error de conexión con el servidor";
  }
}

async function eliminar(u) {
  if (
    !confirm(
      `¿Eliminar al usuario ${nombreCompleto(u)} (${u.ci})? Esta acción lo desactiva.`,
    )
  ) {
    return;
  }
  error.value = "";
  exito.value = "";
  try {
    const respuesta = await eliminarUsuario(u.ci);
    if (respuesta.exito) {
      exito.value = "Usuario eliminado exitosamente";
      await cargar();
    } else {
      error.value = respuesta.mensaje || "No se pudo eliminar";
    }
  } catch (err) {
    error.value =
      err.response?.data?.mensaje || "Error de conexión con el servidor";
  }
}

async function desbloquear(u) {
  if (
    !confirm(
      "¿Desbloquear esta cuenta? El usuario podrá iniciar sesión de inmediato.",
    )
  ) {
    return;
  }
  error.value = "";
  exito.value = "";
  try {
    const respuesta = await desbloquearUsuario(u.ci);
    if (respuesta.exito) {
      exito.value = "Usuario desbloqueado exitosamente";
      await cargar();
    } else {
      error.value = respuesta.mensaje || "No se pudo desbloquear";
    }
  } catch (err) {
    error.value =
      err.response?.data?.mensaje || "Error de conexión con el servidor";
  }
}

onMounted(cargar);
</script>

<style scoped>
.subtitle {
  color: #555;
  margin-bottom: 1.5rem;
}
.barra {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}
.barra input,
.barra select {
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}
.barra input {
  flex: 1;
  min-width: 220px;
}
.btn {
  background: #004d66;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
}
.form-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.tabla {
  width: 100%;
  border-collapse: collapse;
}
.tabla th,
.tabla td {
  padding: 0.6rem;
  border-bottom: 1px solid #eee;
  text-align: left;
}
.acciones {
  display: flex;
  gap: 0.5rem;
}
.btn-pequeno {
  background: #5ab2c6;
  color: white;
  border: none;
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  cursor: pointer;
  text-decoration: none;
  font-size: 0.85rem;
}
.btn-pequeno.peligro {
  background: #b23b3b;
}
.badge {
  display: inline-block;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  color: white;
}
.badge.bloqueado {
  background: #b23b3b;
}
.badge.activo {
  background: #2e7d32;
}
.error {
  color: #b23b3b;
}
.exito {
  color: green;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 768px) {
  .barra {
    flex-direction: column;
    align-items: stretch;
  }

  .barra input {
    min-width: 0;
    width: 100%;
  }

  .barra select,
  .btn {
    width: 100%;
    text-align: center;
  }

  .form-card {
    padding: 1rem;
  }

  .tabla {
    min-width: 760px;
  }

  .tabla th,
  .tabla td {
    white-space: nowrap;
  }

  .acciones {
    flex-wrap: wrap;
  }
}
</style>
