<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="helper-container">
        <div class="user-data">
          <h2>Editar información del {{ rol }}</h2>
          <p class="subtitle">Modifica y guarda los cambios</p>
        </div>

        <div class="icon-data" @click="$emit('close')">
          <Icon iconName="cancel" iconColor="var(--color-text-muted)" />
        </div>
      </div>

      <form @submit.prevent="guardarCambios">
        <div class="grid">
          <div>
            <label> Nombre Completo </label>
            <input type="text" v-model="user.nombre" disabled="" />
          </div>
          <div>
            <label>Direccion</label>
            <input type="text" v-model="form.direccion" />
            <p v-if="errorDireccion" class="error">{{ errorDireccion }}</p>
          </div>
          <div>
            <label>Teléfono</label>
            <input type="text" v-model="form.telefono" />
            <p v-if="errorTelefono" class="error">{{ errorTelefono }}</p>
          </div>
          <div>
            <label>Correo</label>
            <input type="text" v-model="user.correo" disabled="" />
          </div>
          <div>
            <label>Fecha de Nacimiento</label>
            <input type="date" v-model="user.fecha_nac" disabled="" />
          </div>
          <div>
            <label>Contraseña de acceso</label>
            <div class="password-wrapper">
              <input
                :type="mostrarContrasenia ? 'text' : 'password'"
                v-model="form.contrasenia"
              />
              <button
                type="button"
                class="toggle-btn"
                @click="mostrarContrasenia = !mostrarContrasenia"
              >
                <Icon
                  :iconName="
                    mostrarContrasenia ? 'visibility_off' : 'visibility'
                  "
                  iconColor="var(--color-text-muted)"
                />
              </button>
            </div>
            <p v-if="errorContrasenia" class="error">{{ errorContrasenia }}</p>
          </div>
          <div>
            <label>Carnet de identidad</label>
            <input type="text" v-model="user.ci" disabled="" />
          </div>

          <div>
            <label>Confirmar contraseña</label>
            <div class="password-wrapper">
              <input
                :type="mostrarConfirmacion ? 'text' : 'password'"
                v-model="form.confirmarContrasenia"
              />
              <button
                type="button"
                class="toggle-btn"
                @click="mostrarConfirmacion = !mostrarConfirmacion"
              >
                <SimpleIcon
                  :iconName="
                    mostrarConfirmacion ? 'visibility_off' : 'visibility'
                  "
                  iconColor="var(--color-text-muted)"
                />
              </button>
            </div>
          </div>
          <div v-if="rol === 'Estudiante'">
            <label>Carrera</label>
            <input
              type="text"
              disabled=""
              :value="user.carrera?.nombre ?? 'ninguna'"
            />
          </div>
          <div v-if="esDocente">
            <label>Experiencia</label>
            <input type="text" v-model="user.experiencia" disabled="" />
          </div>
        </div>

        <div class="buttons">
          <button type="reset" class="btn-clear">Limpiar</button>
          <button
            type="submit"
            class="btn-submit"
            :disabled="!formularioValido"
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, watch, ref } from "vue";
import Icon from "./Icon.vue";
import SimpleIcon from "./SimpleIcon.vue";

const props = defineProps({ user: { type: Object, required: true } });
const emit = defineEmits(["close", "save"]);

const mostrarContrasenia = ref(false);
const mostrarConfirmacion = ref(false);

const form = reactive({
  direccion: "",
  telefono: "",
  contrasenia: "",
  confirmarContrasenia: "",
});

watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      form.direccion = newUser.direccion || "";
      form.telefono = newUser.telefono || "";
      form.contrasenia = "";
      form.confirmarContrasenia = "";
    }
  },
  { immediate: true },
);
const esDocente = computed(() => props.user?.rol?.rol === "docente");

const rol = computed(() => {
  if (props.user?.rol?.rol) return "Docente";
  if (props.user?.rol_id_rol === 1) return "Administrador";
  if (props.user?.rol_id_rol === 3) return "Estudiante";
  return "desconocido";
});

const telefonoValido = computed(() => {
  if (!form.telefono) return false;
  const regex = /^(?:\+591)?[67]\d{7}$/;
  return regex.test(form.telefono);
});

const contraseniaValida = computed(() => {
  if (!form.contrasenia) return true;
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;

  return (
    regex.test(form.contrasenia) &&
    form.contrasenia === form.confirmarContrasenia
  );
});

const errorDireccion = computed(() => {
  if (!form.direccion.trim()) return "La dirección no puede estar vacía";
  return "";
});

const errorTelefono = computed(() => {
  if (!form.telefono.trim()) return "El teléfono no puede estar vacío";
  const regex = /^(?:\+591)?[67]\d{7}$/;
  if (!regex.test(form.telefono))
    return "Ingrese un teléfono válido de Bolivia (+591 opcional, 8 dígitos, empieza en 6 o 7)";
  return "";
});

const errorContrasenia = computed(() => {
  if (!form.contrasenia) return "";
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/;
  if (!regex.test(form.contrasenia))
    return "La contraseña debe tener mínimo 8 caracteres, mayúscula, minúscula, número y carácter especial";
  if (form.contrasenia !== form.confirmarContrasenia)
    return "Las contraseñas no coinciden";
  return "";
});

const formularioValido = computed(() => {
  if (!form.direccion.trim()) return false;

  if (!telefonoValido.value) return false;

  if (!contraseniaValida.value) return false;
  const cambioTelefonoDireccion =
    form.telefono !== props.user.telefono ||
    form.direccion !== props.user.direccion;

  const cambioContraseniaValida =
    form.contrasenia && form.contrasenia === form.confirmarContrasenia;

  return cambioTelefonoDireccion || cambioContraseniaValida;
});

const guardarCambios = () => {
  const cambios = {
    ci: props.user.ci,
  };

  if (form.telefono !== props.user.telefono) cambios.telefono = form.telefono;
  if (form.direccion !== props.user.direccion)
    cambios.direccion = form.direccion;
  if (form.contrasenia && form.contrasenia === form.confirmarContrasenia) {
    cambios.contrasenia = form.contrasenia;
  }

  console.log("Datos a guardar:", cambios);
  emit("save", cambios);
  emit("close");
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: var(--color-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-4);
  z-index: 1000;
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 720px;
  max-height: 90vh;
  max-height: 90dvh;
  overflow-y: auto;
  background-color: var(--color-surface);
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.helper-container {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: var(--space-4);
  padding-bottom: var(--space-5);
  margin-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.user-data {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.user-data h2 {
  font-size: var(--text-h2);
  font-weight: 600;
  color: var(--color-text);
}

.icon-data {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition);
}

.icon-data:hover {
  background-color: var(--color-surface-hover);
}

.icon-data :deep(svg) {
  width: 20px;
  height: 20px;
  display: block;
}

.subtitle {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4) var(--space-5);
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
  font-size: var(--text-sm);
  color: var(--color-text);
  box-shadow: var(--shadow-xs);
  transition: border-color var(--transition), box-shadow var(--transition);
}

input:focus {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
  outline: none;
}

input:disabled {
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
  box-shadow: none;
}

.buttons {
  margin-top: var(--space-8);
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.btn-clear,
.btn-submit {
  min-height: 40px;
  padding: 0 var(--space-5);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition), opacity var(--transition);
}

.btn-clear {
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-strong);
}

.btn-clear:hover {
  background-color: var(--color-surface-hover);
}

.btn-submit {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
}

.btn-submit:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  color: var(--color-danger);
  font-size: var(--text-xs);
  margin-top: var(--space-1);
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  width: 100%;
  padding-right: 44px;
}

.toggle-btn {
  position: absolute;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.toggle-btn:hover {
  background: var(--color-surface-hover);
}

.toggle-btn :deep(svg) {
  width: 18px;
  height: 18px;
  display: block;
}

@media (max-width: 768px) {
  .modal-content {
    padding: var(--space-5);
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .buttons {
    flex-direction: column-reverse;
    margin-top: var(--space-6);
  }

  .buttons button {
    width: 100%;
  }
}
</style>
