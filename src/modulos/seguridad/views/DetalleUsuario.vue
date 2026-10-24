<template>
  <div>
    <router-link :to="{ name: 'gestionUsuarios' }" class="volver">
      Volver a usuarios
    </router-link>
    <h2>Detalle de usuario</h2>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="exito" class="exito">{{ exito }}</p>

    <div v-if="usuario" class="form-card">
      <div class="grid">
        <div><strong>CI:</strong> {{ usuario.ci }}</div>
        <div><strong>Login ID:</strong> {{ usuario.login_id }}</div>
        <div><strong>Nombre:</strong> {{ nombreCompleto }}</div>
        <div><strong>Rol:</strong> {{ usuario.rol ? usuario.rol.rol : "" }}</div>
        <div><strong>Fecha de nacimiento:</strong> {{ usuario.fecha_nac }}</div>
        <div><strong>Estado:</strong> {{ usuario.estado ? "Activo" : "Inactivo" }}</div>
      </div>

      <section class="estado-acceso">
        <h3>Estado de acceso</h3>
        <p>
          <span
            class="badge"
            :class="usuario.bloqueado ? 'bloqueado' : 'activo'"
          >
            {{ usuario.bloqueado ? "Bloqueado" : "Sin bloqueo" }}
          </span>
        </p>

        <p v-if="usuario.bloqueado && usuario.bloqueado_hasta" class="nota">
          Bloqueado hasta: {{ formatearFecha(usuario.bloqueado_hasta) }}
        </p>

        <button
          v-if="usuario.bloqueado && puedeDesbloquear"
          type="button"
          class="btn-desbloquear"
          :disabled="desbloqueando"
          @click="desbloquear"
        >
          {{ desbloqueando ? "Desbloqueando..." : "Desbloquear cuenta" }}
        </button>

        <p v-if="usuario.bloqueado && !puedeDesbloquear" class="nota">
          La cuenta puede desbloquearse sola al vencer el bloqueo o cuando el
          usuario restablezca su contraseña desde el login.
        </p>
      </section>

      <h3>Datos editables</h3>
      <form @submit.prevent="guardar">
        <div class="grid">
          <div>
            <label>Correo electrónico</label>
            <input type="email" v-model="form.correo" />
          </div>
          <div>
            <label>Teléfono</label>
            <input type="text" v-model="form.telefono" />
          </div>
          <div>
            <label>Dirección</label>
            <input type="text" v-model="form.direccion" />
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="cargando">
            {{ cargando ? "Guardando..." : "Guardar cambios" }}
          </button>
        </div>
      </form>

      <div v-if="academico">
        <h3>Información académica</h3>
        <div v-if="academico.inscripciones">
          <div
            v-for="ins in academico.inscripciones"
            :key="ins.id_inscripcion"
            class="bloque"
          >
            <strong>Inscripción #{{ ins.id_inscripcion }}</strong>
            ({{ ins.fecha_inscripcion }})
            <ul>
              <li v-for="m in ins.materias" :key="m.materia.id_materia">
                {{ m.materia.nombre }} ({{ m.materia.tipo }}) — {{ m.estado }}
              </li>
            </ul>
          </div>
          <p v-if="academico.inscripciones.length === 0">
            Sin inscripciones registradas.
          </p>
        </div>
        <div v-if="academico.materias_dictadas">
          <ul>
            <li v-for="m in academico.materias_dictadas" :key="m.id_materia">
              {{ m.nombre }} ({{ m.tipo }}) — {{ m.dia }}
              {{ m.hora_inicio }}-{{ m.hora_fin }}
            </li>
          </ul>
          <p v-if="academico.materias_dictadas.length === 0">
            Sin materias asignadas.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  verUsuario,
  verAcademico,
  editarUsuario,
  desbloquearUsuario,
} from "../servicios/rolService";
import { tienePermiso } from "../servicios/AuthServicio";

const route = useRoute();
const usuario = ref(null);
const academico = ref(null);
const form = ref({ correo: "", telefono: "", direccion: "" });
const error = ref("");
const exito = ref("");
const cargando = ref(false);
const desbloqueando = ref(false);
const puedeDesbloquear = tienePermiso("usuarios.desbloquear");

function formatearFecha(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString();
}

const nombreCompleto = computed(() => {
  if (!usuario.value) return "";
  return [
    usuario.value.nombre,
    usuario.value.apellido_paterno,
    usuario.value.apellido_materno,
  ]
    .filter(Boolean)
    .join(" ");
});

async function cargar() {
  error.value = "";
  try {
    const respuesta = await verUsuario(route.params.ci);
    if (!respuesta.exito) {
      error.value = respuesta.mensaje || "Usuario no encontrado";
      return;
    }
    usuario.value = respuesta.data;
    form.value = {
      correo: respuesta.data.correo || "",
      telefono: respuesta.data.telefono || "",
      direccion: respuesta.data.direccion || "",
    };
    try {
      const resAcad = await verAcademico(route.params.ci);
      if (resAcad.exito) academico.value = resAcad.data;
    } catch (errAcad) {
      academico.value = null;
    }
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
    const respuesta = await editarUsuario(route.params.ci, form.value);
    if (respuesta.exito) {
      exito.value = "Usuario actualizado exitosamente";
      usuario.value = respuesta.data;
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

async function desbloquear() {
  if (
    !confirm(
      "¿Desbloquear esta cuenta? El usuario podrá iniciar sesión de inmediato.",
    )
  ) {
    return;
  }

  error.value = "";
  exito.value = "";
  desbloqueando.value = true;
  try {
    const respuesta = await desbloquearUsuario(route.params.ci);
    if (respuesta.exito) {
      exito.value = respuesta.mensaje || "Usuario desbloqueado exitosamente";
      await cargar();
    } else {
      error.value = respuesta.mensaje || "No se pudo desbloquear la cuenta";
    }
  } catch (err) {
    error.value =
      err.response?.data?.mensaje || "Error de conexión con el servidor";
  } finally {
    desbloqueando.value = false;
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
.bloque {
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
}
.error {
  color: #b23b3b;
}
.exito {
  color: green;
}
.estado-acceso {
  border: 1px solid #eee;
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
}
.badge {
  display: inline-block;
  padding: 0.25rem 0.7rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
  color: white;
}
.badge.bloqueado {
  background: #b23b3b;
}
.badge.activo {
  background: #2e7d32;
}
.btn-desbloquear {
  background: #b23b3b;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1.2rem;
  cursor: pointer;
  font-weight: 600;
}
.btn-desbloquear:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.nota {
  color: #555;
  font-size: 0.9rem;
  line-height: 1.5;
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
