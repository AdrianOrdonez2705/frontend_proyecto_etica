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
.recuperacion-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #dee7ef;
  padding: 2rem;
}

.recuperacion-card {
  width: 90%;
  max-width: 480px;
  background: linear-gradient(#00597b, #5ab2c6);
  color: white;
  border-radius: 30px;
  padding: 2.5rem 2rem;
  box-shadow: 0 10px 25px rgba(2, 82, 113, 0.3);
}

.recuperacion-card h2 {
  margin: 0 0 1rem 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
}

.descripcion {
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  line-height: 1.5;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.6rem 0;
  border: none;
  border-bottom: 3px solid white;
  background: transparent;
  color: white;
  font-size: 1rem;
}

input::placeholder {
  color: rgba(255, 255, 255, 0.7);
}

input:focus {
  outline: none;
  border-bottom: 2px solid #f7ba00;
}

.form-actions {
  display: flex;
  justify-content: center;
}

button {
  background: radial-gradient(circle, #f7ba00 0%, #d48806 100%);
  color: white;
  border: 1px solid #000;
  border-radius: 50px;
  padding: 0.8rem 3rem;
  font-size: 1.1rem;
  cursor: pointer;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  transition: background 0.3s ease;
  width: 70%;
}

button:hover:not(:disabled) {
  background: #d4a000;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mensaje {
  margin-top: 1.5rem;
  color: #d9ffe1;
  text-align: center;
  line-height: 1.5;
}

.error {
  margin-top: 1.5rem;
  color: #ffb3b3;
  text-align: center;
}

.volver {
  margin-top: 1.5rem;
  text-align: center;
}

.volver a {
  color: white;
  font-weight: 600;
  text-decoration: none;
}

.volver a:hover {
  text-decoration: underline;
}

@media (max-width: 768px) {
  .recuperacion-container {
    padding: 1rem;
    align-items: flex-start;
  }

  .recuperacion-card {
    margin-top: 1.5rem;
    padding: 2rem 1.5rem;
    border-radius: 24px;
  }

  button {
    width: 100%;
  }
}

@media (max-width: 400px) {
  .recuperacion-card {
    padding: 1.5rem 1rem;
  }
}
</style>
