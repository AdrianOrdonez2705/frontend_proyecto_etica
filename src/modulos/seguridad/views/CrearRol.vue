<template>
  <div>
    <h2>Crear rol</h2>
    <p class="subtitle">
      Define el nombre y adjunta permisos del catálogo existente
    </p>

    <div class="form-card">
      <form @submit.prevent="guardar">
        <div class="grid">
          <div>
            <label>Nombre del rol</label>
            <input type="text" v-model="form.rol" placeholder="ej. coordinador" />
          </div>
          <div>
            <label>Descripción</label>
            <input type="text" v-model="form.descripcion" />
          </div>
        </div>

        <h3>Permisos (mínimo 1)</h3>
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
              v-model="form.permisos"
            />
            <span>{{ p.codigo }} — {{ p.nombre }}</span>
          </label>
        </div>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="exito" class="exito">{{ exito }}</p>

        <div class="form-actions">
          <button type="submit" :disabled="cargando">
            {{ cargando ? "Creando..." : "Crear rol" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { listarPermisos, crearRol } from "../servicios/rolService";

const router = useRouter();
const form = ref({ rol: "", descripcion: "", permisos: [] });
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
  try {
    const respuesta = await listarPermisos();
    if (respuesta.exito) permisos.value = respuesta.data || [];
  } catch (err) {
    error.value =
      err.response?.data?.mensaje || "Error de conexión con el servidor";
  }
}

async function guardar() {
  error.value = "";
  exito.value = "";
  cargando.value = true;
  try {
    const respuesta = await crearRol(form.value);
    if (respuesta.exito) {
      exito.value = "Rol creado exitosamente";
      setTimeout(() => router.push({ name: "gestionRoles" }), 1200);
    } else {
      error.value = respuesta.mensaje || "No se pudo crear el rol";
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
.subtitle {
  color: #555;
  margin-bottom: 1.5rem;
}
.form-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}
.grid label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.grid input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-sizing: border-box;
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
}
.check input {
  margin-right: 0.5rem;
}
.form-actions {
  margin-top: 1rem;
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
  .form-card {
    padding: 1rem;
  }
  .form-actions button {
    width: 100%;
  }
}
</style>
