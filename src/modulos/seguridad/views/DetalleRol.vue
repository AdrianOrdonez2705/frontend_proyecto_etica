<template>
  <div>
    <router-link :to="{ name: 'gestionRoles' }" class="volver">
      Volver a roles
    </router-link>
    <h2>Detalle de rol</h2>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="exito" class="exito">{{ exito }}</p>

    <div v-if="rol" class="form-card">
      <div class="grid">
        <div><strong>Rol:</strong> {{ rol.rol }}</div>
        <div><strong>Base:</strong> {{ rol.base ? "Sí" : "No" }}</div>
        <div><strong>Usuarios:</strong> {{ rol.total_usuarios }}</div>
      </div>

      <form @submit.prevent="guardarDescripcion">
        <div>
          <label>Descripción</label>
          <input type="text" v-model="descripcion" />
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="cargando">Guardar descripción</button>
        </div>
      </form>

      <h3>Permisos adjuntos ({{ seleccionados.length }})</h3>
      <form @submit.prevent="guardarPermisos">
        <div v-for="grupo in grupos" :key="grupo.modulo" class="grupo">
          <h4>{{ grupo.modulo }}</h4>
          <label
            v-for="p in grupo.items"
            :key="p.codigo"
            class="check"
          >
            <input
              type="checkbox"
              :value="p.codigo"
              v-model="seleccionados"
            />
            <span>{{ p.codigo }} — {{ p.nombre }}</span>
          </label>
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="cargando">
            Guardar permisos
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  verRol,
  editarRol,
  asignarPermisos,
  listarPermisos,
} from "../servicios/rolService";

const route = useRoute();
const rol = ref(null);
const descripcion = ref("");
const seleccionados = ref([]);
const permisos = ref([]);
const error = ref("");
const exito = ref("");
const cargando = ref(false);

const grupos = computed(() => {
  const mapa = {};
  permisos.value.forEach((p) => {
    if (!mapa[p.modulo]) mapa[p.modulo] = [];
    mapa[p.modulo].push(p);
  });
  return Object.keys(mapa)
    .sort()
    .map((modulo) => ({ modulo, items: mapa[modulo] }));
});

async function cargar() {
  error.value = "";
  try {
    const [resRol, resPermisos] = await Promise.all([
      verRol(route.params.id),
      listarPermisos(),
    ]);
    if (!resRol.exito) {
      error.value = resRol.mensaje || "Rol no encontrado";
      return;
    }
    rol.value = resRol.data;
    descripcion.value = resRol.data.descripcion || "";
    seleccionados.value = [...(resRol.data.permisos || [])];
    if (resPermisos.exito) permisos.value = resPermisos.data || [];
  } catch (err) {
    error.value =
      err.response?.data?.mensaje || "Error de conexión con el servidor";
  }
}

async function guardarDescripcion() {
  error.value = "";
  exito.value = "";
  cargando.value = true;
  try {
    const respuesta = await editarRol(route.params.id, {
      descripcion: descripcion.value,
    });
    if (respuesta.exito) {
      exito.value = "Descripción actualizada";
      rol.value.descripcion = respuesta.data.descripcion;
    } else {
      error.value = respuesta.mensaje || "No se pudo actualizar";
    }
  } catch (err) {
    error.value =
      err.response?.data?.mensaje || "Error de conexión con el servidor";
  } finally {
    cargando.value = false;
  }
}

async function guardarPermisos() {
  error.value = "";
  exito.value = "";
  cargando.value = true;
  try {
    const respuesta = await asignarPermisos(
      route.params.id,
      seleccionados.value,
    );
    if (respuesta.exito) {
      exito.value = "Permisos actualizados";
    } else {
      error.value = respuesta.mensaje || "No se pudo actualizar";
    }
  } catch (err) {
    error.value =
      err.response?.data?.mensaje || "Error de conexión con el servidor";
  } finally {
    cargando.value = false;
  }
}

onMounted(cargar);
</script>

<style scoped>
.volver {
  color: #004d66;
  text-decoration: none;
  font-weight: 600;
}
.form-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-top: 1rem;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}
.grid input,
.form-card input[type="text"] {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-sizing: border-box;
}
.form-card label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.grupo {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}
.grupo h4 {
  margin: 0 0 0.5rem 0;
  color: #004d66;
}
.check {
  display: block;
  margin-bottom: 0.35rem;
  cursor: pointer;
  font-weight: 400;
}
.check input {
  margin-right: 0.5rem;
  width: auto;
}
.form-actions {
  margin-top: 1rem;
  margin-bottom: 1rem;
}
.form-actions button {
  background: #004d66;
  color: white;
  padding: 0.7rem 1.4rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}
.error {
  color: #b23b3b;
}
.exito {
  color: green;
}
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
