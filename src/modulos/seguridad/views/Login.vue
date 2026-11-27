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
                    iconColor="var(--color-text-muted)"
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
  min-height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--color-bg);
  padding: var(--space-8) var(--space-4);
}

.login-card {
  display: flex;
  width: 100%;
  max-width: 920px;
  min-height: 520px;
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.login-left {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-10);
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
}

.login-logo {
  max-width: 70%;
  max-height: 320px;
  object-fit: contain;
}

.login-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: var(--space-12) var(--space-10);
  color: var(--color-text);
}

.title-container {
  margin-bottom: var(--space-8);
}

.title-container h2 {
  margin: 0;
  font-size: var(--text-display);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.2;
  color: var(--color-text);
  text-align: left;
}

.form-container {
  padding: 0;
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
  height: 44px;
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

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.password-wrapper input {
  padding-right: 48px;
}

.toggle-password {
  position: absolute;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  user-select: none;
  transition: background-color var(--transition);
}

.toggle-password:hover {
  background: var(--color-surface-hover);
}

.toggle-password :deep(svg) {
  width: 20px;
  height: 20px;
  display: block;
}

.form-actions {
  display: flex;
  margin-top: var(--space-6);
}

.form-actions + .form-actions {
  margin-top: var(--space-3);
}

button {
  width: 100%;
  min-height: 44px;
  padding: 0 var(--space-4);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition), opacity var(--transition);
}

button:hover:not(:disabled) {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.form-actions + .form-actions button {
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border-color: var(--color-border-strong);
}

.form-actions + .form-actions button:hover:not(:disabled) {
  background: var(--color-surface-hover);
  border-color: var(--color-border-strong);
}

button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--color-danger-soft);
  border: 1px solid var(--color-danger-border);
  border-radius: var(--radius-md);
  color: var(--color-danger);
  font-size: var(--text-sm);
}

.recuperacion {
  margin-top: var(--space-5);
  text-align: center;
  font-size: var(--text-sm);
}

.recuperacion a {
  color: var(--color-primary);
  font-weight: 600;
  text-decoration: none;
}

.recuperacion a:hover {
  text-decoration: underline;
}

.bloqueo {
  margin-top: var(--space-4);
  padding: var(--space-3) var(--space-4);
  background: var(--color-warning-soft);
  border: 1px solid var(--color-warning-border);
  border-radius: var(--radius-md);
  color: var(--color-warning);
  font-size: var(--text-sm);
  line-height: 1.5;
}

.bloqueo a {
  color: var(--color-warning);
  font-weight: 600;
}

.bloqueo a:hover {
  text-decoration: underline;
}

.info {
  margin-top: var(--space-2);
  color: var(--color-text-muted);
  font-size: var(--text-sm);
  line-height: 1.5;
}

@media (max-width: 1024px) {
  .login-right {
    padding: var(--space-10) var(--space-8);
  }
}

@media (max-width: 768px) {
  .login-container {
    align-items: flex-start;
    min-height: 100vh;
    padding: var(--space-6) var(--space-4);
  }

  .login-card {
    flex-direction: column;
    min-height: 0;
  }

  .login-left {
    flex: none;
    padding: var(--space-6);
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  .login-logo {
    max-width: 120px;
  }

  .login-right {
    flex: none;
    padding: var(--space-8) var(--space-5);
  }

  .title-container {
    margin-bottom: var(--space-6);
  }

  .title-container h2 {
    font-size: var(--text-h1);
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
