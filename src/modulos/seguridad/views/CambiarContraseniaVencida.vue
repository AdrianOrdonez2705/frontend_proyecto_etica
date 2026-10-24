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
.cambio-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #dee7ef;
  padding: 2rem;
}

.cambio-card {
  width: 90%;
  max-width: 480px;
  background: linear-gradient(#00597b, #5ab2c6);
  color: white;
  border-radius: 30px;
  padding: 2.5rem 2rem;
  box-shadow: 0 10px 25px rgba(2, 82, 113, 0.3);
}

.cambio-card h2 {
  margin: 0 0 1.5rem 0;
  font-size: clamp(1.5rem, 4vw, 2rem);
}

.estado {
  text-align: center;
  line-height: 1.6;
}

.aviso {
  margin: 0 0 1.25rem 0;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.92);
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
  .cambio-container {
    padding: 1rem;
    align-items: flex-start;
  }

  .cambio-card {
    margin-top: 1.5rem;
    padding: 2rem 1.5rem;
    border-radius: 24px;
  }

  button {
    width: 100%;
  }
}

@media (max-width: 400px) {
  .cambio-card {
    padding: 1.5rem 1rem;
  }
}
</style>
