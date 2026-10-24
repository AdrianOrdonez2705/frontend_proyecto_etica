<template>
  <div>
    <h2>Roles</h2>
    <p class="subtitle">Roles del sistema y sus permisos adjuntos</p>

    <div class="barra">
      <router-link :to="{ name: 'crearRol' }" class="btn">
        Crear rol
      </router-link>
      <router-link :to="{ name: 'permisos' }" class="btn-secundario">
        Ver catálogo de permisos
      </router-link>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="exito" class="exito">{{ exito }}</p>

    <div class="form-card">
      <div class="table-scroll">
        <table class="tabla">
          <thead>
            <tr>
              <th>Rol</th>
              <th>Descripción</th>
              <th>Base</th>
              <th>Usuarios</th>
              <th>Permisos</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in roles" :key="r.id_rol">
              <td>{{ r.rol }}</td>
              <td>{{ r.descripcion }}</td>
              <td>{{ r.base ? "Sí" : "No" }}</td>
              <td>{{ r.total_usuarios }}</td>
              <td>{{ (r.permisos || []).length }}</td>
              <td class="acciones">
                <router-link
                  :to="{ name: 'detalleRol', params: { id: r.id_rol } }"
                  class="btn-pequeno"
                >
                  Ver
                </router-link>
                <button
                  v-if="!r.base"
                  class="btn-pequeno peligro"
                  @click="eliminar(r)"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
      </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { listarRoles, eliminarRol } from "../servicios/rolService";

const roles = ref([]);
const error = ref("");
const exito = ref("");

async function cargar() {
  error.value = "";
  try {
    const respuesta = await listarRoles();
    if (respuesta.exito) {
      roles.value = respuesta.data || [];
    } else {
      error.value = respuesta.mensaje || "No se pudo listar roles";
    }
  } catch (err) {
    error.value =
      err.response?.data?.mensaje || "Error de conexión con el servidor";
  }
}

async function eliminar(r) {
  if (!confirm(`¿Eliminar el rol ${r.rol}?`)) return;
  error.value = "";
  exito.value = "";
  try {
    const respuesta = await eliminarRol(r.id_rol);
    if (respuesta.exito) {
      exito.value = "Rol eliminado exitosamente";
      await cargar();
    } else {
      error.value = respuesta.mensaje || "No se pudo eliminar";
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
}
.btn {
  background: #004d66;
  color: white;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
}
.btn-secundario {
  background: #5ab2c6;
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

  .btn,
  .btn-secundario {
    width: 100%;
    text-align: center;
  }

  .form-card {
    padding: 1rem;
  }

  .tabla {
    min-width: 680px;
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
