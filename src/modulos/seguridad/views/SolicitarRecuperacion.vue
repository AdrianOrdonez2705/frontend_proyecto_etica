<template>
  <div class="recuperacion-container">
    <div class="recuperacion-card">
      <h2>Recuperar contraseña</h2>
      <p class="descripcion">
        Escribe tu Login ID o correo electrónico y te enviaremos un enlace para
        definir una nueva contraseña.
      </p>

      <form @submit.prevent="enviar">
        <div class="form-group">
          <label>Login ID o correo electrónico</label>
          <input
            v-model="identificador"
            type="text"
            autocomplete="username"
            placeholder="ana.perez.gomez.est"
            :disabled="cargando || cooldown > 0"
          />
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="cargando || cooldown > 0">
            {{
              cargando
                ? "Enviando..."
                : cooldown > 0
                  ? `Espera ${cooldown}s`
                  : "Enviar enlace"
            }}
          </button>
        </div>

        <p v-if="mensaje" class="mensaje">{{ mensaje }}</p>
        <p v-if="error" class="error">{{ error }}</p>

        <p class="volver">
          <router-link to="/login">Volver al inicio de sesión</router-link>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from "vue";
import authService from "../servicios/AuthServicio";

const identificador = ref("");
const cargando = ref(false);
const cooldown = ref(0);
const mensaje = ref("");
const error = ref("");
let temporizador = null;

function iniciarCooldown(segundos) {
  cooldown.value = segundos;
  if (temporizador) clearInterval(temporizador);
  temporizador = setInterval(() => {
    cooldown.value -= 1;
    if (cooldown.value <= 0) {
      clearInterval(temporizador);
      temporizador = null;
      cooldown.value = 0;
    }
  }, 1000);
}

async function enviar() {
  error.value = "";
  mensaje.value = "";

  if (!identificador.value.trim()) {
    error.value = "El Login ID o correo es requerido";
    return;
  }

  cargando.value = true;
  try {
    const response = await authService.solicitarRecuperacion(
      identificador.value.trim(),
    );
    mensaje.value =
      response.data?.mensaje ||
      "Si el identificador existe, enviaremos un enlace de recuperación al correo registrado.";
    iniciarCooldown(60);
  } catch (err) {
    const datos = err.response?.data;
    error.value =
      datos?.mensaje ||
      "No se pudo enviar la solicitud. Inténtalo de nuevo más tarde.";
  } finally {
    cargando.value = false;
  }
}

onUnmounted(() => {
  if (temporizador) clearInterval(temporizador);
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
