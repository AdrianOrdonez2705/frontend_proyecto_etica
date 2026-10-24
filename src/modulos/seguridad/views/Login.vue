<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-left">
        <img src="/src/assets/logo.png" alt="Logo" class="login-logo" />
      </div>
      <div class="login-right">
        <div class="title-container">
          <h2>SixSeven Academy</h2>
        </div>

        <form v-if="paso === 1" @submit.prevent="ingresar">
          <div class="form-container">
            <div class="form-group">
              <label>Login ID</label>

              <input
                v-model="loginId"
                type="text"
                placeholder="ana.perez.gomez.est"
              />
            </div>

            <div class="form-group password-group">
              <label>Contraseña</label>
              <div class="password-wrapper">
                <input
                  v-model="password"
                  :type="mostrarContrasenia ? 'text' : 'password'"
                />
                <span
                  class="toggle-password"
                  @click="mostrarContrasenia = !mostrarContrasenia"
                >
                  <Icon
                    :iconName="
                      mostrarContrasenia ? 'visibility_off' : 'visibility'
                    "
                    iconColor="#fff  "
                  />
                </span>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              :disabled="cargando || bloqueoRestante > 0"
            >
              {{
                cargando
                  ? "Ingresando..."
                  : bloqueoRestante > 0
                    ? `Espera ${formatearTiempo(bloqueoRestante)}`
                    : "Ingresar"
              }}
            </button>
          </div>

          <p v-if="error && bloqueoRestante === 0" class="error">{{ error }}</p>

          <p class="recuperacion">
            <router-link to="/recuperar-contrasenia"
              >¿Olvidaste tu contraseña?</router-link
            >
          </p>

          <p v-if="bloqueoRestante > 0" class="bloqueo">
            {{ error }} Podrás intentar de nuevo en
            {{ formatearTiempo(bloqueoRestante) }}.
            <template v-if="codigoBloqueo === 'CUENTA_BLOQUEADA'">
              También puedes
              <router-link to="/recuperar-contrasenia"
                >restablecer tu contraseña</router-link
              >.
            </template>
          </p>
        </form>

        <form v-else @submit.prevent="verificar">
          <div class="form-container">
            <div class="form-group">
              <label>Código de verificación</label>

              <input
                v-model="codigo"
                type="text"
                inputmode="numeric"
                maxlength="6"
                placeholder="123456"
              />
            </div>

            <p class="info">
              Enviamos un código de 6 dígitos a {{ correoDestino }}. Vence en
              10 minutos.
            </p>
          </div>

          <div class="form-actions">
            <button type="submit" :disabled="cargando">
              {{ cargando ? "Verificando..." : "Verificar" }}
            </button>
          </div>

          <div class="form-actions">
            <button
              type="button"
              :disabled="cargando || cooldown > 0"
              @click="reenviar"
            >
              {{
                cooldown > 0
                  ? `Reenviar en ${cooldown}s`
                  : "Reenviar código"
              }}
            </button>
          </div>

          <div class="form-actions">
            <button type="button" :disabled="cargando" @click="volver">
              Volver
            </button>
          </div>

          <p v-if="error" class="error">{{ error }}</p>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #dee7ef;
  padding: 2rem;
}

.login-card {
  display: flex;
  border-radius: 50px;
  overflow: hidden;
  width: 90%;
  max-width: 1000px;
  min-height: 500px;
  box-shadow: 0 10px 25px rgba(2, 82, 113, 0.3);
  background: white;
}

.login-left {
  flex: 1.2;
  background: #dee7ef;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-logo {
  max-width: 70%;
  max-height: 75%;
  object-fit: contain;
}

.login-right {
  flex: 0.8;
  background: linear-gradient(#00597b, #5ab2c6);
  padding: 5rem 2rem 3rem 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  color: white;
  position: relative;
}

.title-container {
  background-color: #5ab2c6;
  padding: 1rem 2rem;
  border-radius: 0 50px 50px 0;
  margin-bottom: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  position: absolute;
  top: 30px;
  left: 0;
  right: 20px;
  z-index: 10;
}

.title-container h2 {
  margin: 0;
  color: white;
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  text-align: left;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-container {
  padding: 30px 10%;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}

input {
  width: 80%;
  padding: 0.5rem 0;
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
  margin-top: 2rem;
}

button {
  background: radial-gradient(circle, #f7ba00 0%, #d48806 100%);
  color: white;
  border: 1px solid#000;
  border-radius: 50px;
  padding: 0.8rem 3rem;
  font-size: 1.2rem;
  cursor: pointer;
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  transition: background 0.3s ease;
  width: 60%;
}

button:hover {
  background: #d4a000;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  margin-top: 1rem;
  color: #ff8080;
  text-align: center;
}

.recuperacion {
  margin-top: 1rem;
  text-align: center;
  color: white;
}

.recuperacion a {
  color: white;
  font-weight: 600;
  text-decoration: none;
}

.recuperacion a:hover {
  text-decoration: underline;
}

.bloqueo {
  margin-top: 1rem;
  background: rgba(0, 0, 0, 0.25);
  border-radius: 10px;
  padding: 0.75rem 1rem;
  color: #fff;
  text-align: center;
  font-size: 0.95rem;
}

.bloqueo a {
  color: #ffd966;
  font-weight: 600;
}

.bloqueo a:hover {
  text-decoration: underline;
}

.info {
  margin-top: 1rem;
  color: white;
  text-align: center;
  font-size: 0.95rem;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 80%;
}

.toggle-password {
  position: absolute;
  right: 0;
  cursor: pointer;
  font-size: 1.2rem;
  user-select: none;
  color: white;
}
@media (max-width: 768px) {
  .login-container {
    padding: 1rem;
    height: auto;
    min-height: 100vh;
  }

  .login-card {
    flex-direction: column;
    height: auto;
    border-radius: 30px;
  }

  .login-left {
    padding: 2rem;
    flex: none;
  }

  .login-logo {
    max-width: 150px;
  }

  .login-right {
    padding: 6rem 1.5rem 3rem 1.5rem;
    flex: none;
  }

  .title-container {
    top: 15px;
    padding: 0.8rem 1.5rem;
  }

  .form-container {
    padding-left: 5%;
    padding-right: 5%;
  }

  input,
  .password-wrapper {
    width: 100%;
  }

  button {
    width: 100%;
  }
}

@media (max-width: 1024px) {
  .login-right {
    padding: 5rem 1.5rem 2.5rem 1.5rem;
  }

  .form-container {
    padding-left: 2%;
    padding-right: 2%;
  }
}

@media (max-width: 400px) {
  .title-container {
    padding: 0.6rem 1rem;
  }

  .title-container h2 {
    font-size: 1.3rem;
  }

  .login-left {
    padding: 1.25rem;
  }

  .login-logo {
    max-width: 110px;
  }

  .login-right {
    padding: 5rem 1rem 2rem 1rem;
  }
}
</style>

<script setup>
import { ref, onUnmounted } from "vue";
import authService, {
  guardarSesion,
  tienePermiso,
} from "../servicios/AuthServicio";
import { useRouter } from "vue-router";
import Icon from "../components/Icon.vue";

const router = useRouter();

const loginId = ref("");
const password = ref("");
const codigo = ref("");
const desafioId = ref("");
const correoDestino = ref("");
const paso = ref(1);
const error = ref("");
const cargando = ref(false);
const cooldown = ref(0);
const bloqueoRestante = ref(0);
const codigoBloqueo = ref("");
let temporizador = null;
let temporizadorBloqueo = null;

const mostrarContrasenia = ref(false);

function iniciarCooldown(segundos) {
  cooldown.value = segundos;
  if (temporizador) clearInterval(temporizador);
  temporizador = setInterval(() => {
    cooldown.value -= 1;
    if (cooldown.value <= 0) {
      clearInterval(temporizador);
      temporizador = null;
    }
  }, 1000);
}

function formatearTiempo(segundos) {
  const total = Math.max(0, Math.floor(segundos));
  const minutos = Math.floor(total / 60);
  const resto = total % 60;
  return `${minutos}:${String(resto).padStart(2, "0")}`;
}

function iniciarBloqueo(segundos) {
  if (temporizadorBloqueo) clearInterval(temporizadorBloqueo);
  bloqueoRestante.value = Math.max(0, Math.floor(segundos));
  temporizadorBloqueo = setInterval(() => {
    bloqueoRestante.value -= 1;
    if (bloqueoRestante.value <= 0) {
      clearInterval(temporizadorBloqueo);
      temporizadorBloqueo = null;
      bloqueoRestante.value = 0;
      codigoBloqueo.value = "";
      error.value = "";
    }
  }, 1000);
}

function detenerBloqueo() {
  if (temporizadorBloqueo) clearInterval(temporizadorBloqueo);
  temporizadorBloqueo = null;
  bloqueoRestante.value = 0;
  codigoBloqueo.value = "";
}

onUnmounted(() => {
  if (temporizador) clearInterval(temporizador);
  if (temporizadorBloqueo) clearInterval(temporizadorBloqueo);
});

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

const ingresar = async () => {
  error.value = "";
  localStorage.removeItem("token_cambio_contrasenia");
  cargando.value = true;

  try {
    const response = await authService.login(loginId.value, password.value);

    const { exito, data, mensaje } = response.data;

    if (exito && data && data.mfa_requerido) {
      desafioId.value = data.desafio_id;
      correoDestino.value = data.correo_destino || "tu correo";
      codigo.value = "";
      paso.value = 2;
      detenerBloqueo();
      iniciarCooldown(60);
    } else {
      error.value = mensaje;
    }
  } catch (err) {
    const datos = err.response?.data;
    const estadoHttp = err.response?.status;
    const codigo = datos?.codigo;
    const retry = datos?.data?.retry_after_segundos;

    if (
      estadoHttp === 429 ||
      codigo === "CUENTA_BLOQUEADA" ||
      codigo === "IP_BLOQUEADA"
    ) {
      codigoBloqueo.value = codigo || "CUENTA_BLOQUEADA";
      iniciarBloqueo(retry || 900);
      error.value = datos?.mensaje || "Demasiados intentos fallidos";
    } else {
      codigoBloqueo.value = "";
      const restantes = datos?.data?.intentos_restantes;
      const base =
        datos?.errores?.join(". ") ||
        datos?.mensaje ||
        "Error al iniciar sesión";
      error.value =
        typeof restantes === "number" && restantes > 0
          ? `${base} Te quedan ${restantes} intento(s).`
          : base;
    }
  } finally {
    cargando.value = false;
  }
};

const verificar = async () => {
  error.value = "";
  cargando.value = true;

  try {
    const response = await authService.verificarCodigo(
      desafioId.value,
      codigo.value,
    );

    const { exito, data, mensaje } = response.data;

    if (exito) {
      if (data?.requiere_cambio_contrasenia) {
        localStorage.removeItem("token");
        localStorage.removeItem("permisos");
        localStorage.removeItem("rol");
        localStorage.removeItem("ci");
        localStorage.removeItem("login_id");
        localStorage.removeItem("nombre");
        localStorage.setItem("token_cambio_contrasenia", data.token);
        router.push({ name: "cambiarContraseniaVencida" });
        return;
      }

      guardarSesion(data);
      redirigirPorRol(data.usuario.rol.nombre);
    } else {
      error.value = mensaje;
    }
  } catch (err) {
    error.value = err.response?.data?.mensaje || "Error al verificar el código";
  } finally {
    cargando.value = false;
  }
};

const reenviar = async () => {
  error.value = "";
  cargando.value = true;

  try {
    const response = await authService.reenviarCodigo(desafioId.value);

    const { exito, data, mensaje } = response.data;

    if (exito) {
      desafioId.value = data.desafio_id;
      codigo.value = "";
      iniciarCooldown(60);
    } else {
      error.value = mensaje;
    }
  } catch (err) {
    error.value = err.response?.data?.mensaje || "Error al reenviar el código";
  } finally {
    cargando.value = false;
  }
};

const volver = () => {
  paso.value = 1;
  codigo.value = "";
  desafioId.value = "";
  error.value = "";
  if (temporizador) clearInterval(temporizador);
  cooldown.value = 0;
};
</script>
