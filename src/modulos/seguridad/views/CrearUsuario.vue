<template>
  <div>
    <h2>Crear usuario</h2>
    <p class="subtitle">
      El sistema genera automáticamente el Login ID y la contraseña inicial
    </p>

    <div class="form-card">
      <form @submit.prevent="guardar" autocomplete="off">
        <div class="grid">
          <div>
            <label>Carnet de Identidad</label>
            <input type="text" v-model="form.ci" />
          </div>
          <div>
            <label>Nombre</label>
            <input type="text" v-model="form.nombre" />
          </div>
          <div>
            <label>Apellido paterno</label>
            <input type="text" v-model="form.apellido_paterno" />
          </div>
          <div>
            <label>Apellido materno</label>
            <input type="text" v-model="form.apellido_materno" />
          </div>
          <div>
            <label>Correo electrónico</label>
            <input type="email" v-model="form.correo" />
          </div>
          <div>
            <label>Teléfono</label>
            <input type="text" v-model="form.telefono" inputmode="numeric" />
          </div>
          <div>
            <label>Fecha de nacimiento</label>
            <input type="date" v-model="form.fecha_nac" />
          </div>
          <div>
            <label>Dirección</label>
            <input type="text" v-model="form.direccion" />
          </div>
          <div>
            <label>Rol</label>
            <select v-model="form.rol_id_rol">
              <option value="">Seleccionar rol</option>
              <option
                v-for="rol in rolesDisponibles"
                :key="rol.id_rol"
                :value="rol.id_rol"
              >
                {{ rol.rol }}
              </option>
            </select>
          </div>
          <div v-if="esDocente">
            <label>Experiencia</label>
            <input type="text" v-model="form.experiencia" />
          </div>
        </div>

        <p class="preview" v-if="vistaPrevia">
          Login ID previsto: <strong>{{ vistaPrevia }}</strong>
        </p>

        <p v-if="error" class="error">{{ error }}</p>

        <div class="form-actions">
          <button type="submit" :disabled="cargando">
            {{ cargando ? "Creando..." : "Crear usuario" }}
          </button>
        </div>
      </form>

      <div v-if="creado" class="resultado">
        <h3>Usuario creado</h3>
        <p>
          Comparte estos datos con el usuario por un canal seguro. La
          contraseña no volverá a mostrarse.
        </p>
        <div class="grid">
          <div>
            <label>Login ID</label>
            <input type="text" :value="creado.login_id" readonly />
          </div>
          <div>
            <label>Contraseña inicial</label>
            <input type="text" :value="creado.contrasenia_inicial" readonly />
          </div>
        </div>
        <div class="form-actions">
          <router-link :to="{ name: 'gestionUsuarios' }" class="btn">
            Volver a usuarios
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { listarRoles, crearUsuario } from "../servicios/rolService";

const form = ref({
  ci: "",
  nombre: "",
  apellido_paterno: "",
  apellido_materno: "",
  correo: "",
  telefono: "",
  fecha_nac: "",
  direccion: "",
  experiencia: "",
  rol_id_rol: "",
});

const rolesDisponibles = ref([]);
const error = ref("");
const cargando = ref(false);
const creado = ref(null);

function normalizar(texto) {
  return String(texto || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .join(".");
}

const esDocente = computed(() => {
  const rol = rolesDisponibles.value.find(
    (r) => String(r.id_rol) === String(form.value.rol_id_rol),
  );
  return rol && rol.rol === "docente";
});

const vistaPrevia = computed(() => {
  if (
    !form.value.nombre ||
    !form.value.apellido_paterno ||
    !form.value.apellido_materno ||
    !form.value.rol_id_rol
  ) {
    return "";
  }
  const rol = rolesDisponibles.value.find(
    (r) => String(r.id_rol) === String(form.value.rol_id_rol),
  );
  const sufijos = { estudiante: "est", docente: "doc", administrador: "adm" };
  const sufijo = rol ? sufijos[rol.rol] || "" : "";
  if (!sufijo) return "";
  return (
    [form.value.nombre, form.value.apellido_paterno, form.value.apellido_materno]
      .map(normalizar)
      .filter(Boolean)
      .join(".") + "." + sufijo
  );
});

async function cargarRoles() {
  try {
    const respuesta = await listarRoles();
    if (respuesta.exito) {
      rolesDisponibles.value = (respuesta.data || []).filter(
        (r) => r.rol !== "seguridad",
      );
    }
  } catch (err) {
    error.value =
      err.response?.data?.mensaje || "Error de conexión con el servidor";
  }
}

async function guardar() {
  error.value = "";
  creado.value = null;
  cargando.value = true;
  try {
    const datos = { ...form.value };
    if (!esDocente.value) delete datos.experiencia;
    const respuesta = await crearUsuario(datos);
    if (respuesta.exito) {
      creado.value = {
        login_id: respuesta.data.login_id,
        contrasenia_inicial: respuesta.data.contrasenia_inicial,
      };
    } else {
      error.value = respuesta.mensaje || "No se pudo crear el usuario";
    }
  } catch (err) {
    error.value =
      err.response?.data?.mensaje || "Error de conexión con el servidor";
  } finally {
    cargando.value = false;
  }
}

onMounted(cargarRoles);
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
}
.grid label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.grid input,
.grid select {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-sizing: border-box;
}
.preview {
  margin-top: 1rem;
  color: #004d66;
}
.error {
  color: #b23b3b;
}
.form-actions {
  margin-top: 1.2rem;
  display: flex;
  gap: 0.75rem;
}
.form-actions button,
.btn {
  background: #004d66;
  color: white;
  padding: 0.7rem 1.4rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  font-size: 1rem;
}
.resultado {
  margin-top: 1.5rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
}
.resultado h3 {
  color: green;
}
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
