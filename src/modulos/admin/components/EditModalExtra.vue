<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="helper-container">
        <div class="user-data">
          <h2>Editar información del curso extracurricular</h2>
          <p class="subtitle">Modifica y guarda los cambios</p>
        </div>

        <div class="close-button" @click="$emit('close')">×</div>
      </div>

      <form @submit.prevent="guardarCambios">
        <div class="grid">
          <div>
            <label>Código</label>
            <input
              type="text"
              :value="curso.id_materia || curso.codigo"
              disabled
            />
          </div>

          <div>
            <label>Nombre</label>
            <input
              type="text"
              v-model="form.nombre"
              @input="validarNombre"
              placeholder="Nombre del curso"
            />
            <p v-if="errorNombre" class="error">{{ errorNombre }}</p>
          </div>

          <div>
            <label>Tipo</label>
            <input type="text" :value="curso.tipo" disabled />
          </div>

          <div>
            <label>Cupo</label>
            <input type="text" v-model="form.cupo" />
          </div>

          <div>
            <label>Día</label>
            <select v-model="form.dia">
              <option disabled value="">Seleccione un día</option>
              <option v-for="dia in dias" :key="dia" :value="dia">
                {{ dia }}
              </option>
            </select>
          </div>

          <div>
            <label>Hora de inicio</label>
            <input type="text" :value="curso.hora_inicio" disabled />
          </div>

          <div>
            <label>Hora fin</label>
            <input type="text" :value="curso.hora_fin" disabled />
          </div>

          <div>
            <label>Fecha de Inicio</label>
            <input
              type="text"
              :value="formatearFecha(curso.fecha_inicio)"
              disabled
            />
          </div>

          <div>
            <label>Fecha fin</label>
            <input
              type="text"
              :value="formatearFecha(curso.fecha_fin)"
              disabled
            />
          </div>

          <div>
            <label>Aula</label>
            <input
              type="text"
              :value="aulaSeleccionada || curso.id_aula || 'N/A'"
              disabled
            />
          </div>

          <div>
            <label>Monto</label>
            <input type="text" v-model="form.monto" />
          </div>
        </div>

        <div class="buttons">
          <button type="button" class="btn-clear" @click="$emit('close')">
            Cancelar
          </button>
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
import { computed, onMounted, ref, watch } from "vue";
import { listarAulas } from "../servicios/cursosService";
const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const props = defineProps({
  user: { type: Object, required: true },
});
const emit = defineEmits(["close", "save"]);

const curso = computed(() => props.user);

const form = ref({
  nombre: "",
  cupo: "",
  dia: "",
  monto: "",
});
const aulas = ref([]);
const aulaSeleccionada = ref(null);

onMounted(async () => {
  const respuestasAulas = await listarAulas();
  console.log(respuestasAulas.data);
  aulas.value = respuestasAulas.data;

  aulaSeleccionada.value = aulas.value.find(
    (a) => Number(a.id_aula) === Number(curso.aula_id_aula),
  );

  console.log(aulaSeleccionada);
});

const errorNombre = ref("");

watch(
  () => props.user,
  (newCurso) => {
    if (newCurso) {
      form.value.nombre = newCurso.nombre || "";
      form.value.monto = newCurso.monto || "";
      form.value.cupo = newCurso.cupo || "";
      form.value.dia = newCurso.dia || "";
    }
  },
  { immediate: true },
);

const validarNombre = () => {
  const regex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,50}$/;

  if (!form.value.nombre.trim()) {
    errorNombre.value = "El nombre no puede estar vacío";
  } else if (!regex.test(form.value.nombre)) {
    errorNombre.value =
      "El nombre debe contener solo letras y tener entre 3 y 50 caracteres";
  } else {
    errorNombre.value = "";
  }
};

const formularioValido = computed(() => {
  if (errorNombre.value) return false;

  const cambioNombre = form.value.nombre !== curso.value.nombre;
  const cambioDia = form.value.dia !== curso.value.dia;
  const cambioCupo = form.value.cupo !== curso.value.cupo;
  const cambioMonto = form.value.monto !== curso.value.monto;

  const hayCambios = cambioNombre || cambioDia || cambioCupo || cambioMonto;

  return form.value.nombre.trim() !== "" && hayCambios;
});

const formatearFecha = (fecha) => {
  if (!fecha) return "N/A";
  return fecha;
};

const guardarCambios = () => {
  validarNombre();

  if (!formularioValido.value) {
    return;
  }

  const cambios = {
    id_materia: curso.value.id_materia || curso.value.codigo,
  };

  if (form.value.nombre !== curso.value.nombre)
    cambios.nombre = form.value.nombre;
  if (form.value.dia !== curso.value.dia) cambios.dia = form.value.dia;
  if (form.value.cupo !== curso.value.cupo) cambios.cupo = form.value.cupo;
  if (form.value.monto !== curso.value.monto) cambios.monto = form.value.monto;

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
  display: flex;
  flex-direction: column;
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

.close-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: var(--radius-md);
  font-size: 24px;
  font-weight: 400;
  line-height: 1;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition);
}

.close-button:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text);
}

form {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
}

select {
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

select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.requisito-row {
  display: flex;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.btn-add {
  flex-shrink: 0;
  min-height: 40px;
  padding: 0 var(--space-4);
  background: var(--color-surface);
  color: var(--color-primary);
  border: 1px solid var(--color-primary-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition);
}

.btn-add:hover {
  background: var(--color-primary-soft);
}

.requisitos-burbujas {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.burbuja {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-1) 2px var(--space-3);
  background: var(--color-primary-soft);
  border: 1px solid var(--color-primary-border);
  color: var(--color-primary);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
}

.burbuja button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: none;
  border: none;
  border-radius: var(--radius-full);
  color: var(--color-primary);
  font-size: 14px;
  cursor: pointer;
}

.burbuja button:hover {
  background: var(--color-surface);
}

@media (max-width: 768px) {
  .requisito-row {
    flex-direction: column;
  }
}
</style>
