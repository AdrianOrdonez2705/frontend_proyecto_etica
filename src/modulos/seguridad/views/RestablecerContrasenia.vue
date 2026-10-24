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
.restablecer-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #dee7ef;
  padding: 2rem;
}

.restablecer-card {
  width: 90%;
  max-width: 480px;
  background: linear-gradient(#00597b, #5ab2c6);
  color: white;
  border-radius: 30px;
  padding: 2.5rem 2rem;
  box-shadow: 0 10px 25px rgba(2, 82, 113, 0.3);
}

.restablecer-card h2 {
  margin: 0 0 1.5rem 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
}

.estado {
  text-align: center;
  line-height: 1.6;
}

.form-group {
  margin-bottom: 1.25rem;
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

input:focus {
  outline: none;
  border-bottom: 2px solid #f7ba00;
}

.politica {
  margin-top: 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.9);
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
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
  width: 80%;
}

button:hover:not(:disabled) {
  background: #d4a000;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.mensaje {
  color: #d9ffe1;
}

.error {
  margin-top: 1.5rem;
  color: #ffb3b3;
  text-align: center;
  line-height: 1.5;
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
  .restablecer-container {
    padding: 1rem;
    align-items: flex-start;
  }

  .restablecer-card {
    margin-top: 1.5rem;
    padding: 2rem 1.5rem;
    border-radius: 24px;
  }

  button {
    width: 100%;
  }
}

@media (max-width: 400px) {
  .restablecer-card {
    padding: 1.5rem 1rem;
  }
}
</style>
