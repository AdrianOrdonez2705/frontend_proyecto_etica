<template>
  <div class="restablecer-container">
    <div class="restablecer-card">
      <h2>Nueva contraseña</h2>

      <div v-if="estado === 'verificando'" class="estado">
        <p>Verificando el enlace...</p>
      </div>

      <div v-else-if="estado === 'invalido'" class="estado">
        <p class="error">El enlace es inválido o expiró.</p>
        <p class="volver">
          <router-link to="/recuperar-contrasenia"
            >Solicitar un nuevo enlace</router-link
          >
        </p>
      </div>

      <div v-else-if="estado === 'listo'" class="estado">
        <p class="mensaje">Contraseña restablecida exitosamente.</p>
        <p class="volver">
          <router-link to="/login">Volver al inicio de sesión</router-link>
        </p>
      </div>

      <form v-else @submit.prevent="guardar">
        <div class="form-group">
          <label>Nueva contraseña</label>
          <input
            v-model="nueva"
            type="password"
            autocomplete="new-password"
            :disabled="cargando"
          />
        </div>

        <div class="form-group">
          <label>Confirmar contraseña</label>
          <input
            v-model="confirmar"
            type="password"
            autocomplete="new-password"
            :disabled="cargando"
          />
        </div>

        <p class="politica">
          Mínimo 14 caracteres, al menos una mayúscula, una minúscula, un
          número y un carácter especial (!@#$%^&*).
        </p>

        <div class="form-actions">
          <button type="submit" :disabled="cargando">
            {{ cargando ? "Guardando..." : "Restablecer contraseña" }}
          </button>
        </div>

        <p v-if="error" class="error">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import authService from "../servicios/AuthServicio";

const route = useRoute();
const router = useRouter();
const estado = ref("verificando"); // "verificando" | "invalido" | "formulario" | "listo"
const token = ref("");
const nueva = ref("");
const confirmar = ref("");
const error = ref("");
const cargando = ref(false);

async function verificarEnlace() {
  token.value = String(route.query.token || "");

  if (!token.value) {
    estado.value = "invalido";
    return;
  }

  try {
    const response = await authService.verificarTokenRecuperacion(
      token.value,
    );
    estado.value = response.data?.data?.valido ? "formulario" : "invalido";
  } catch (err) {
    estado.value = "invalido";
  }
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
    const response = await authService.restablecerContrasenia(
      token.value,
      nueva.value,
    );

    if (response.data?.exito) {
      estado.value = "listo";
      nueva.value = "";
      confirmar.value = "";
      router.replace({ path: "/restablecer-contrasenia" });
    } else {
      error.value = response.data?.mensaje || "No se pudo restablecer";
    }
  } catch (err) {
    const datos = err.response?.data;
    error.value =
      (datos?.errores && datos.errores.join(". ")) ||
      datos?.mensaje ||
      "Error de conexión con el servidor";
  } finally {
    cargando.value = false;
  }
}

onMounted(verificarEnlace);
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
