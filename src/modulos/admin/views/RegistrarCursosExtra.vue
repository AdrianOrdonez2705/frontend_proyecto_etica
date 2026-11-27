<template>
  <div>
    <div class="icon-wrapper">
      <Icon
        to="listarExtra"
        iconName="arrow_back"
        iconColor="var(--color-text-secondary)"
        message="Volver"
      />
    </div>

    <h2>Registros de cursos extracurriculares</h2>
    <p>Completa el formulario para agregar una nueva carrera</p>

    <div class="form-card">
      <form @submit="manejarEnvio" autocomplete="off">
        <div class="grid">
          <div>
            <label>Código</label>
            <input
              type="text"
              v-model="form.codigo"
              @input="validarCodigo"
              placeholder="Ej: EXT-201"
              maxlength="20"
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
            <label>Tipo</label>
            <select
              v-model="form.tipo"
              @change="validarTipo"
              class="custom-select"
            >
              <option value="">Seleccione un tipo</option>
              <option value="Extracurricular">Extracurricular</option>
            </select>
            <p v-if="errorTipo" class="error">
              {{ errorTipo }}
            </p>
          </div>

          <div>
            <label>Cupo</label>
            <input
              type="number"
              v-model="form.cupo"
              @input="validarCupo"
              min="1"
              max="50"
            />
            <p v-if="errorCupo" class="error">
              {{ errorCupo }}
            </p>
          </div>

          <div>
            <label>Día</label>
            <select
              v-model="form.dia"
              @change="validarDia"
              class="custom-select"
            >
              <option value="">Seleccione un día</option>
              <option value="Lunes">Lunes</option>
              <option value="Martes">Martes</option>
              <option value="Miércoles">Miércoles</option>
              <option value="Jueves">Jueves</option>
              <option value="Viernes">Viernes</option>
              <option value="Sábado">Sábado</option>
            </select>
            <p v-if="errorDia" class="error">
              {{ errorDia }}
            </p>
          </div>

          <div>
            <label>Hora de inicio</label>
            <input
              type="time"
              v-model="form.horaInicio"
              @change="validarHoraInicio"
            />
            <p v-if="errorHoraInicio" class="error">
              {{ errorHoraInicio }}
            </p>
          </div>

          <div>
            <label>Hora fin</label>
            <input
              type="time"
              v-model="form.horaFin"
              @change="validarHoraFin"
            />
            <p v-if="errorHoraFin" class="error">
              {{ errorHoraFin }}
            </p>
          </div>

          <div>
            <label>Fecha inicio</label>
            <input
              type="date"
              v-model="form.fechaInicio"
              @change="validarFechaInicio"
            />
            <p v-if="errorFechaInicio" class="error">
              {{ errorFechaInicio }}
            </p>
          </div>

          <div>
            <label>Fecha fin</label>
            <input
              type="date"
              v-model="form.fechaFin"
              @change="validarFechaFin"
            />
            <p v-if="errorFechaFin" class="error">
              {{ errorFechaFin }}
            </p>
          </div>

          <div>
            <label>Docente</label>
            <select
              v-model="form.docente"
              @change="validarDocente"
              class="custom-select"
            >
              <option value="">Seleccione un docente</option>
              <option
                v-for="docente in docentes"
                :key="docente.ci"
                :value="docente.ci"
              >
                {{ docente.nombre }} ({{ docente.ci }})
              </option>
            </select>
            <p v-if="errorDocente" class="error">
              {{ errorDocente }}
            </p>
          </div>

          <div>
            <label>Aula</label>
            <select
              v-model="form.aula"
              @change="validarAula"
              class="custom-select"
            >
              <option value="">Seleccione un aula</option>
              <option
                v-for="aula in aulas"
                :key="aula.id_aula"
                :value="aula.id_aula"
              >
                {{ aula.nombre }}
              </option>
            </select>
            <p v-if="errorAula" class="error">
              {{ errorAula }}
            </p>
          </div>

          <div>
            <label>Monto</label>
            <input
              type="number"
              v-model="form.monto"
              @input="validarMonto"
              min="0"
              step="0.01"
            />
            <p v-if="errorMonto" class="error">
              {{ errorMonto }}
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

<script setup>
import Icon from "../../seguridad/components/Icon.vue";
import { ref, computed, onMounted } from "vue";
import ModalExito from "../../seguridad/components/ModalExito.vue";
import ModalError from "../../seguridad/components/ModalError.vue";
import {
  registrarCursoExtracurricular,
  listarDocentes,
  listarAulas,
} from "../servicios/cursosService.js";

const showModal = ref(false);
const successMessage = ref("");

const showErrorModal = ref(false);
const errorMessage = ref("");

const docentes = ref([]);

const aulas = ref([]);

const form = ref({
  codigo: "",
  nombre: "",
  tipo: "Extracurricular",
  cupo: "",
  dia: "",
  horaInicio: "",
  horaFin: "",
  fechaInicio: "",
  fechaFin: "",
  docente: "",
  aula: "",
  monto: "",
});

const errorCodigo = ref("");
const errorNombre = ref("");
const errorTipo = ref("");
const errorCupo = ref("");
const errorDia = ref("");
const errorHoraInicio = ref("");
const errorHoraFin = ref("");
const errorFechaInicio = ref("");
const errorFechaFin = ref("");
const errorDocente = ref("");
const errorAula = ref("");
const errorMonto = ref("");

const validarCodigo = () => {
  const regex = /^[A-Za-z0-9-_]{1,20}$/;

  if (!form.value.codigo || form.value.codigo.trim() === "") {
    errorCodigo.value = "El código es obligatorio";
  } else if (!regex.test(form.value.codigo)) {
    errorCodigo.value =
      "El código solo puede contener letras, números, guiones y guiones bajos (máx. 20 caracteres)";
  } else {
    errorCodigo.value = "";
  }
};

const validarNombre = () => {
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,50}$/;

  if (!regex.test(form.value.nombre)) {
    errorNombre.value =
      "El nombre debe contener solo letras y tener entre 3 y 50 caracteres";
  } else {
    errorNombre.value = "";
  }
};

const validarTipo = () => {
  if (!form.value.tipo) {
    errorTipo.value = "Debe seleccionar un tipo de curso";
  } else {
    errorTipo.value = "";
  }
};

const validarCupo = () => {
  if (!form.value.cupo || form.value.cupo <= 0 || form.value.cupo > 50) {
    errorCupo.value = "El cupo debe ser un número entre 1 y 50";
  } else {
    errorCupo.value = "";
  }
};

const validarDia = () => {
  if (!form.value.dia) {
    errorDia.value = "Debe seleccionar un día";
  } else {
    errorDia.value = "";
  }
};

const validarHoraInicio = () => {
  if (!form.value.horaInicio) {
    errorHoraInicio.value = "La hora de inicio es obligatoria";
  } else {
    errorHoraInicio.value = "";
    validarHoraFin();
  }
};

const validarHoraFin = () => {
  if (!form.value.horaFin) {
    errorHoraFin.value = "La hora fin es obligatoria";
  } else if (
    form.value.horaInicio &&
    form.value.horaFin <= form.value.horaInicio
  ) {
    errorHoraFin.value = "La hora fin debe ser mayor a la hora de inicio";
  } else {
    errorHoraFin.value = "";
  }
};

const validarFechaInicio = () => {
  if (!form.value.fechaInicio) {
    errorFechaInicio.value = "La fecha de inicio es obligatoria";
  } else {
    const fechaInicio = new Date(form.value.fechaInicio);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaInicio < hoy) {
      errorFechaInicio.value = "La fecha de inicio no puede ser anterior a hoy";
    } else {
      errorFechaInicio.value = "";
      validarFechaFin();
    }
  }
};

const validarFechaFin = () => {
  if (!form.value.fechaFin) {
    errorFechaFin.value = "La fecha fin es obligatoria";
  } else if (
    form.value.fechaInicio &&
    form.value.fechaFin <= form.value.fechaInicio
  ) {
    errorFechaFin.value =
      "La fecha fin debe ser posterior a la fecha de inicio";
  } else {
    errorFechaFin.value = "";
  }
};

const validarDocente = () => {
  if (!form.value.docente) {
    errorDocente.value = "Debe seleccionar un docente";
  } else {
    errorDocente.value = "";
  }
};

const validarAula = () => {
  if (!form.value.aula) {
    errorAula.value = "Debe seleccionar un aula";
  } else {
    errorAula.value = "";
  }
};

const validarMonto = () => {
  if (!form.value.monto || form.value.monto <= 0) {
    errorMonto.value = "El monto debe ser mayor a 0";
  } else {
    errorMonto.value = "";
  }
};

const formularioValido = computed(() => {
  return (
    form.value.codigo &&
    form.value.nombre &&
    form.value.tipo &&
    form.value.cupo &&
    form.value.dia &&
    form.value.horaInicio &&
    form.value.horaFin &&
    form.value.fechaInicio &&
    form.value.fechaFin &&
    form.value.docente &&
    form.value.aula &&
    form.value.monto &&
    !errorCodigo.value &&
    !errorNombre.value &&
    !errorTipo.value &&
    !errorCupo.value &&
    !errorDia.value &&
    !errorHoraInicio.value &&
    !errorHoraFin.value &&
    !errorFechaInicio.value &&
    !errorFechaFin.value &&
    !errorDocente.value &&
    !errorAula.value &&
    !errorMonto.value
  );
});

const manejarEnvio = async (e) => {
  e.preventDefault();

  validarCodigo();
  validarNombre();
  validarTipo();
  validarCupo();
  validarDia();
  validarHoraInicio();
  validarHoraFin();
  validarFechaInicio();
  validarFechaFin();
  validarDocente();
  validarAula();
  validarMonto();

  if (!formularioValido.value) {
    alert("Por favor corrige los errores antes de enviar");
    return;
  }

  const datosEnviar = {
    id_materia: form.value.codigo.toString(),
    usuario_ci: form.value.docente,
    nombre: form.value.nombre,
    cupo: parseInt(form.value.cupo),
    dia: form.value.dia,
    hora_inicio: form.value.horaInicio,
    hora_fin: form.value.horaFin,
    fecha_inicio: form.value.fechaInicio,
    fecha_fin: form.value.fechaFin,
    aula_id_aula: parseInt(form.value.aula),
    monto: parseFloat(form.value.monto),
  };

  const resultado = await registrarCursoExtracurricular(datosEnviar);
  if (resultado.exito) {
    successMessage.value =
      resultado.mensaje || "Curso extracurricular registrado correctamente";
    showModal.value = true;

    Object.keys(form.value).forEach((campo) => {
      form.value[campo] = "";
    });
    form.value.tipo = "Extracurricular";
  } else {
    errorMessage.value = resultado.mensaje || "Error desconocido";
    if (resultado.errores && resultado.errores.length > 0) {
      errorMessage.value += ": " + resultado.errores.join(", ");
    }
    showErrorModal.value = true;
  }
};

onMounted(async () => {
  try {
    const resultado = await listarDocentes();
    if (resultado.exito) {
      docentes.value = resultado.data;
      console.log(`✅ ${docentes.value.length} docentes cargados`);
    } else {
      console.warn(
        "⚠️ No se pudo cargar la lista de docentes:",
        resultado.mensaje,
      );
    }
  } catch (error) {
    console.error("❌ Error al cargar docentes:", error);
  }

  try {
    const resultado = await listarAulas();
    if (resultado.exito) {
      aulas.value = resultado.data;
      console.log(`✅ ${aulas.value.length} aulas cargadas`);
    } else {
      console.warn(
        "⚠️ No se pudo cargar la lista de aulas:",
        resultado.mensaje,
      );
    }
  } catch (error) {
    console.error("❌ Error al cargar aulas:", error);
  }
});
</script>

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
