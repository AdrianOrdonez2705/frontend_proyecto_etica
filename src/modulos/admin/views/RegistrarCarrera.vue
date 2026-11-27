<template>
  <div>
    <div class="icon-wrapper">
      <Icon
        to="listarCarreras"
        iconName="arrow_back"
        iconColor="var(--color-text-secondary)"
        message="Volver"
      />
    </div>

    <h2>Registros de nuevas Carreras</h2>
    <p>Completa el formulario para agregar una nueva Carrera</p>

    <div class="form-card">
      <form @submit="manejarEnvio" autocomplete="off">
        <div class="grid">
          <div>
            <label>Codigo</label>
            <input
              type="text"
              v-model="form.codigo"
              @input="validarCodigo"
              maxlength="4"
            />
            <p v-if="errorCodigo" class="error">
              {{ errorCodigo }}
            </p>
          </div>

          <div>
            <label>Nombre</label>
            <input type="text" v-model="form.nombre" @input="validarNombre" />
            <p v-if="errorNombre" class="error">
              {{ errorNombre }}
            </p>
          </div>

          <div>
            <label>Descripción</label>
            <input
              type="text"
              v-model="form.descripcion"
              @blur="validarDescripcion"
            />
            <p v-if="errorDescripcion" class="error">
              {{ errorDescripcion }}
            </p>
          </div>

          <div>
            <label>Duración</label>
            <input
              type="text"
              v-model="form.duracion"
              @input="validarDuracion"
            />
            <p v-if="errorDuracion" class="error">
              {{ errorDuracion }}
            </p>
          </div>
        </div>

        <div class="buttons">
          <button type="reset" class="btn-clear">Limpiar</button>
          <button
            type="submit"
            class="btn-register"
            :disabled="!formularioValido"
          >
            Registrar
          </button>
        </div>
      </form>
    </div>
  </div>
  <ModalExito
    :message="successMessage"
    :visible="showModal"
    @close="showModal = false"
  />

  <ModalError
    :message="errorMessage"
    :visible="showErrorModal"
    @close="showErrorModal = false"
  />
</template>

<style scoped>
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  margin-bottom: var(--space-4);
  padding: var(--space-1) var(--space-2);
  margin-left: calc(var(--space-2) * -1);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition);
}

.icon-wrapper:hover {
  background-color: var(--color-surface-hover);
}

.icon-wrapper :deep(.icon-group) {
  align-items: center;
}

.icon-wrapper :deep(svg) {
  width: 18px;
  height: 18px;
  display: block;
}

h2 {
  font-size: var(--text-h1);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

h2 + p {
  font-size: var(--text-body);
  color: var(--color-text-muted);
  margin-bottom: var(--space-6);
}

h2 + .form-card {
  margin-top: var(--space-5);
}

.form-card {
  max-width: 960px;
  background: var(--color-surface);
  padding: var(--space-8);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-5);
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.right-column {
  display: flex;
  flex-direction: column;
}

.full-width {
  grid-column: span 1;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

input,
textarea,
.custom-select {
  width: 100%;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text);
  box-shadow: var(--shadow-xs);
  transition: border-color var(--transition), box-shadow var(--transition);
}

input,
.custom-select {
  height: 40px;
  padding: 0 var(--space-3);
}

textarea {
  flex: 1;
  min-height: 112px;
  padding: 10px var(--space-3);
  line-height: 1.5;
  resize: vertical;
}

.custom-select {
  padding-right: 36px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23667085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}

input:focus,
textarea:focus,
.custom-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

input:disabled,
textarea:disabled,
.custom-select:disabled {
  background-color: var(--color-surface-muted);
  color: var(--color-text-muted);
  box-shadow: none;
  cursor: default;
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
.btn-register {
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
  background: var(--color-surface-hover);
}

.btn-register {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
}

.btn-register:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-register:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  margin-top: var(--space-1);
  margin-bottom: 0;
  font-size: var(--text-xs);
  color: var(--color-danger);
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

.container {
  display: flex;
  flex-direction: column;
  margin-top: var(--space-8);
}

.search-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.registrar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  margin-left: auto;
  padding: 0 var(--space-4);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color var(--transition);
}

.registrar:hover {
  background-color: var(--color-primary-hover);
}

@media (max-width: 1024px) {
  .form-card {
    padding: var(--space-6);
  }
}

@media (max-width: 768px) {
  .form-card {
    padding: var(--space-5) var(--space-4);
  }

  .grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .buttons {
    flex-direction: column-reverse;
    margin-top: var(--space-6);
  }

  .buttons button {
    width: 100%;
  }

  .search-container {
    flex-direction: column;
    align-items: stretch;
  }

  .search-container > * {
    flex: none;
    max-width: none;
  }

  .registrar {
    margin-left: 0;
  }
}
</style>

<script setup>
import Icon from "../../seguridad/components/Icon.vue";
import { ref, computed } from "vue";
import { registrarCarrera } from "../servicios/adminsService";
import ModalExito from "../../seguridad/components/ModalExito.vue";
import ModalError from "../../seguridad/components/ModalError.vue";

const showModal = ref(false);
const successMessage = ref("");

const showErrorModal = ref(false);
const errorMessage = ref("");

const form = ref({
  codigo: "",
  nombre: "",
  descripcion: "",
  duracion: "",
});

const mostrarContrasenia = ref(false);
const mostrarConfirmacion = ref(false);

const errorCodigo = ref("");
const errorNombre = ref("");
const errorDescripcion = ref("");
const errorDuracion = ref("");

const validarCodigo = () => {
  const regex = /^[a-z]{2,4}$/;
  if (!regex.test(form.value.codigo)) {
    errorCodigo.value = "El codigo debe tener entre 3 y 4 caracteres";
  } else {
    errorCodigo.value = "";
  }
};

const validarNombre = () => {
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{7,}$/;

  if (!regex.test(form.value.nombre)) {
    errorNombre.value =
      "El nombre solo debe contener letras y mínimo 7 caracteres";
  } else {
    errorNombre.value = "";
  }
};

const validarDescripcion = () => {
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s#.,-]{30,}$/;
  if (form.value.descripcion.trim() === "") {
    errorDescripcion.value = "La descripción es obligatoria";
    return;
  }

  if (!regex.test(form.value.descripcion)) {
    errorDescripcion.value = "Descripción inválida (mínimo 30 caracteres)";
  } else {
    errorDescripcion.value = "";
  }
};

const validarDuracion = () => {
  const regex = /^[0-9]+ (año|años)$/i;

  if (form.value.duracion.trim() === "") {
    errorDuracion.value = "La duración es obligatoria";
    return;
  }

  if (!regex.test(form.value.duracion.trim())) {
    errorDuracion.value = "Debe tener el formato: 5 años o 1 año";
  } else {
    errorDuracion.value = "";
  }
};

const formularioValido = computed(() => {
  return (
    form.value.codigo &&
    form.value.nombre &&
    form.value.descripcion &&
    form.value.duracion &&
    !errorCodigo.value &&
    !errorNombre.value &&
    !errorDuracion.value &&
    !errorDescripcion.value
  );
});
const manejarEnvio = async (e) => {
  e.preventDefault();
  validarCodigo();
  validarNombre();
  validarDescripcion();
  validarDuracion();

  if (!formularioValido.value) {
    alert("Porfavor corrige los errores antes de enviar");
    return;
  }
  const datosEnviar = {
    codigo: form.value.codigo,
    nombre: form.value.nombre,
    descripcion: form.value.descripcion,
    duracion: form.value.duracion,
  };

  const resultado = await registrarCarrera(datosEnviar);
  if (resultado.success) {
    successMessage.value = "Carrera registrada correctamente";

    showModal.value = true;
  } else {
    errorMessage.value = resultado.errores || "Error desconocido";
    showErrorModal.value = true;
    if (resultado.errores) {
      console.log("Errores backend: ", resultado.errores);
    }
  }
  Object.keys(form.value).forEach((campo) => {
    form.value[campo] = "";
  });
};
</script>
