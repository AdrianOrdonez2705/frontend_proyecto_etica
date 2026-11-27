<template>
  <div class="cambio-container">
    <div class="cambio-card">
      <h2>Cambiar contraseña</h2>

      <div v-if="estado === 'cargando'" class="estado">
        <p>Verificando sesión...</p>
      </div>

      <div v-else-if="estado === 'sinToken'" class="estado">
        <p class="error">
          No hay una sesión de cambio de contraseña válida.
        </p>
        <p class="volver">
          <router-link to="/login">Volver al inicio de sesión</router-link>
        </p>
      </div>

      <div v-else-if="estado === 'expirado'" class="estado">
        <p class="error">
          Tu sesión de cambio expiró. Inicia sesión nuevamente.
        </p>
        <p class="volver">
          <router-link to="/login">Volver al inicio de sesión</router-link>
        </p>
      </div>

      <div v-else-if="estado === 'conflicto'" class="estado">
        <p class="error">{{ error }}</p>
        <p class="volver">
          <router-link to="/login">Volver al inicio de sesión</router-link>
        </p>
      </div>

      <form v-else @submit.prevent="guardar">
        <p class="aviso">
          Tu contraseña venció. Debes cambiarla para continuar.
        </p>

        <div class="form-group">
          <label>Contraseña nueva</label>
          <input
            v-model="nueva"
            type="password"
            autocomplete="new-password"
            :disabled="cargando"
          />
        </div>

        <div class="form-group">
          <label>Confirmar contraseña nueva</label>
          <input
            v-model="confirmar"
            type="password"
            autocomplete="new-password"
            :disabled="cargando"
          />
        </div>

        <p class="politica">
          Mínimo 14 caracteres, al menos una mayúscula, una minúscula, un
          número y un carácter especial (!@#$%^&*). No puedes reutilizar tu
          contraseña actual ni las últimas contraseñas registradas.
        </p>

        <div class="form-actions">
          <button type="submit" :disabled="cargando">
            {{ cargando ? "Guardando..." : "Cambiar contraseña" }}
          </button>
        </div>

        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import authService, {
  guardarSesion,
  tienePermiso,
} from "../servicios/AuthServicio";

const router = useRouter();
const estado = ref("cargando"); // "cargando" | "formulario" | "sinToken" | "expirado" | "conflicto"
const nueva = ref("");
const confirmar = ref("");
const error = ref("");
const cargando = ref(false);

function redirigirPorRol(nombreRol) {
  if (nombreRol === "seguridad") router.push("/seguridad");
  else if (nombreRol === "administrador") router.push("/administrador");
  else if (nombreRol === "docente") router.push("/docente");
  else if (nombreRol === "estudiante") router.push("/estudiante");
  else if (tienePermiso("usuarios.listar") || tienePermiso("roles.listar"))
    router.push("/seguridad");
  else if (
    tienePermiso("carreras.ver") ||
    tienePermiso("materias.ver") ||
    tienePermiso("extras.ver") ||
    tienePermiso("aulas.ver")
  )
    router.push("/administrador");
  else if (
    tienePermiso("notas.ver_materia") ||
    tienePermiso("asistencias.ver_materia")
  )
    router.push("/docente");
  else if (
    tienePermiso("oferta.ver") ||
    tienePermiso("inscripcion.ver_propias")
  )
    router.push("/estudiante");
  else router.push({ name: "sinAcceso" });
}

function validarPolitica(valor) {
  const errores = [];
  if (valor.length < 14) {
    errores.push("La contraseña debe tener al menos 14 caracteres");
  }
  if (!/[A-Z]/.test(valor)) {
    errores.push("La contraseña debe contener al menos una letra mayúscula");
  }
  if (!/[a-z]/.test(valor)) {
    errores.push("La contraseña debe contener al menos una letra minúscula");
  }
  if (!/[0-9]/.test(valor)) {
    errores.push("La contraseña debe contener al menos un número");
  }
  if (!/[!@#$%^&*]/.test(valor)) {
    errores.push(
      "La contraseña debe contener al menos un carácter especial (!@#$%^&*)",
    );
  }
  return errores;
}

function marcarExpirado() {
  localStorage.removeItem("token_cambio_contrasenia");
  error.value = "Tu sesión de cambio expiró. Inicia sesión nuevamente.";
  estado.value = "expirado";
}

async function guardar() {
  error.value = "";

  if (nueva.value !== confirmar.value) {
    error.value = "La confirmación no coincide";
    return;
  }

  const erroresPolitica = validarPolitica(nueva.value);
  if (erroresPolitica.length > 0) {
    error.value = erroresPolitica.join(". ");
    return;
  }

  cargando.value = true;
  try {
    const response = await authService.cambiarContraseniaVencida(nueva.value);

    if (response.data?.exito) {
      localStorage.removeItem("token_cambio_contrasenia");
      const sesion = response.data.data;
      guardarSesion(sesion);
      redirigirPorRol(sesion.usuario.rol.nombre);
    } else {
      error.value = response.data?.mensaje || "No se pudo cambiar la contraseña";
    }
  } catch (err) {
    const datos = err.response?.data;
    const estadoHttp = err.response?.status;

    if (estadoHttp === 401 || estadoHttp === 403) {
      marcarExpirado();
    } else if (estadoHttp === 409) {
      error.value =
        (datos?.errores && datos.errores.join(". ")) ||
        datos?.mensaje ||
        "Tu contraseña ya fue actualizada. Inicia sesión nuevamente.";
      estado.value = "conflicto";
    } else if (estadoHttp === 400) {
      error.value =
        (datos?.errores && datos.errores.join(". ")) ||
        datos?.mensaje ||
        "No se pudo cambiar la contraseña";
    } else {
      error.value =
        (datos?.errores && datos.errores.join(". ")) ||
        datos?.mensaje ||
        "Error de conexión con el servidor";
    }
  } finally {
    cargando.value = false;
  }
}

onMounted(() => {
  const token = localStorage.getItem("token_cambio_contrasenia");

  if (!token) {
    estado.value = "sinToken";
    return;
  }

  estado.value = "formulario";
});
</script>

<style scoped>
.recuperacion-container,
.restablecer-container,
.cambio-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-bg);
  padding: var(--space-8) var(--space-4);
}

.recuperacion-card,
.restablecer-card,
.cambio-card {
  width: 100%;
  max-width: 440px;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-sm);
}

.recuperacion-card h2,
.restablecer-card h2,
.cambio-card h2 {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--text-h1);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.descripcion,
.aviso {
  margin-bottom: var(--space-6);
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--color-text-muted);
}

.estado {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.form-group {
  margin-bottom: var(--space-4);
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

input {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--text-body);
  color: var(--color-text);
  box-shadow: var(--shadow-xs);
  transition: border-color var(--transition), box-shadow var(--transition);
}

input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

input:disabled {
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
}

.politica {
  margin: var(--space-2) 0 var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  line-height: 1.6;
  color: var(--color-text-muted);
}

.form-actions {
  display: flex;
  margin-top: var(--space-6);
}

button {
  width: 100%;
  min-height: 40px;
  padding: 0 var(--space-4);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition), opacity var(--transition);
}

button:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mensaje,
.error {
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border: 1px solid;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  line-height: 1.5;
}

.mensaje {
  background: var(--color-success-soft);
  border-color: var(--color-success-border);
  color: var(--color-success);
}

.error {
  background: var(--color-danger-soft);
  border-color: var(--color-danger-border);
  color: var(--color-danger);
}

.estado .mensaje,
.estado .error {
  margin-top: 0;
}

.volver {
  margin-top: var(--space-6);
  text-align: center;
  font-size: var(--text-sm);
}

.estado .volver {
  margin-top: var(--space-2);
}

.volver a {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}

.volver a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .recuperacion-container,
  .restablecer-container,
  .cambio-container {
    align-items: flex-start;
    padding: var(--space-6) var(--space-4);
  }

  .recuperacion-card,
  .restablecer-card,
  .cambio-card {
    padding: var(--space-6) var(--space-5);
  }
}
</style>
