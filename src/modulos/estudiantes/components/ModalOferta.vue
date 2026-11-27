<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="helper-container">
        <div class="user-data">
          <h2>{{ curso.nombre }}</h2>
        </div>

        <div class="close-button" @click="$emit('close')">×</div>
      </div>

      <form>
        <div class="form-grid">
          <div class="field">
            <label>Código</label>
            <input :value="curso.id_materia" disabled />
          </div>

          <div class="field">
            <label>Docente</label>
            <input :value="curso.docente?.nombre" disabled />
          </div>

          <div class="field">
            <label>Tipo</label>
            <input :value="curso.tipo" disabled />
          </div>

          <div class="field">
            <label>Cupo</label>
            <input :value="curso.cupo" disabled />
          </div>

          <div class="field">
            <label>Inscritos</label>
            <input :value="curso.inscritos" disabled />
          </div>

          <div class="field">
            <label>Día</label>
            <input :value="curso.dia" disabled />
          </div>

          <div
            class="field requisitos"
            v-if="Array.isArray(curso.requisitos) && curso.requisitos.length"
          >
            <label>Requisitos</label>
            <div class="req-container">
              <input
                v-for="req in curso.requisitos"
                :key="req.id_materia"
                :value="req.nombre"
                disabled
                :class="{
                  'input-error': noCumpleComputed.includes(req.id_materia),
                  'input-success': !noCumpleComputed.includes(req.id_materia),
                }"
              />
            </div>
          </div>

          <div class="field">
            <label>Fecha de inicio</label>
            <input :value="curso.fecha_inicio" disabled />
          </div>

          <div class="field">
            <label>Hora de inicio</label>
            <input :value="curso.hora_inicio" disabled />
          </div>

          <div class="field">
            <label>Fecha fin</label>
            <input :value="curso.fecha_fin" disabled />
          </div>

          <div class="field">
            <label>Hora fin</label>
            <input :value="curso.hora_fin" disabled />
          </div>

          <div class="field monto-field">
            <label>Monto</label>
            <input :value="curso.monto + ' Bs'" disabled />
          </div>
        </div>
      </form>

      <div v-if="motivosBloqueoComputed.length > 0" class="bloqueos-container">
        <p class="bloqueos-title">No puedes inscribirte por lo siguiente:</p>
        <ul class="bloqueos-list">
          <li v-for="(motivo, index) in motivosBloqueoComputed" :key="index">
            {{ motivo }}
          </li>
        </ul>
      </div>

      <button
        type="button"
        class="btn-submit"
        @click="agregarAlCarrito"
        :disabled="botonDeshabilitado"
      >
        {{ textoBoton }}
      </button>
    </div>
  </div>

  <ModalError
    :message="mensajeModal"
    :visible="mostrarError"
    @close="mostrarError = false"
  />
  <ModalExito
    :message="mensajeModal"
    :visible="mostrarExito"
    @close="mostrarExito = false"
  />
</template>

<script setup>
import { computed, ref } from "vue";
import { usarCarrito } from "../../../store/carrito";
import ModalError from "../../seguridad/components/ModalError.vue";
import ModalExito from "../../seguridad/components/ModalExito.vue";

const carrito = usarCarrito();
const mensajeModal = ref("");
const mostrarExito = ref(false);
const mostrarError = ref(false);

const props = defineProps({
  curso: { type: Object, required: true },
  noCumple: { type: Array, required: true },
  motivosBloqueo: { type: Array, default: () => [] },
  puedeInscribirse: { type: Boolean, default: true },
});

const emit = defineEmits(["close", "save"]);

const noCumpleComputed = computed(() => {
  return Array.isArray(props.noCumple) ? props.noCumple : [];
});

const motivosBloqueoComputed = computed(() => {
  return Array.isArray(props.motivosBloqueo) ? props.motivosBloqueo : [];
});

const yaEnCarrito = computed(() => {
  return carrito.cursos.some((c) => c.id_materia === props.curso.id_materia);
});

const tieneRequisitosIncumplidos = computed(() => {
  return noCumpleComputed.value.length > 0;
});

const tieneBloqueos = computed(() => {
  return (
    motivosBloqueoComputed.value.length > 0 || props.puedeInscribirse === false
  );
});

const botonDeshabilitado = computed(() => {
  return (
    yaEnCarrito.value || tieneRequisitosIncumplidos.value || tieneBloqueos.value
  );
});

const textoBoton = computed(() => {
  if (yaEnCarrito.value) return "Ya agregado";
  if (tieneBloqueos.value) return "No disponible";
  if (tieneRequisitosIncumplidos.value) return "No se cumplen los requisitos";
  return "Agregar al carrito";
});

const agregarAlCarrito = () => {
  if (tieneBloqueos.value) {
    mensajeModal.value =
      motivosBloqueoComputed.value.length > 0
        ? motivosBloqueoComputed.value.join(" | ")
        : "No puedes inscribirte en esta materia";
    mostrarError.value = true;
    return;
  }

  if (tieneRequisitosIncumplidos.value) {
    mensajeModal.value =
      "No puedes agregar este curso porque no cumple los requisitos";
    mostrarError.value = true;
    return;
  }

  const resultado = carrito.agregarCurso(props.curso);

  mensajeModal.value = resultado.mensaje;

  if (resultado.exito) {
    mostrarExito.value = true;

    setTimeout(() => {
      emit("close");
    }, 3000);
  } else {
    mostrarError.value = true;
  }
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
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 960px;
  max-height: 90vh;
  max-height: 90dvh;
  overflow-y: auto;
  padding: var(--space-6);
  background-color: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.helper-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-4);
  padding-bottom: var(--space-5);
  margin-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.user-data {
  flex: 1;
  min-width: 0;
}

.user-data h2 {
  margin: 0;
  font-size: var(--text-h2);
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text);
}

.user-data p {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
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
  line-height: 1;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition);
}

.close-button:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text);
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

.field {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

label {
  margin-bottom: 6px;
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
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
}

input:focus {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
  outline: none;
}

input:disabled {
  background-color: var(--color-surface-muted);
  border-color: var(--color-border);
  color: var(--color-text);
  -webkit-text-fill-color: var(--color-text);
  opacity: 1;
  cursor: default;
}

.req-container {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.req-container input {
  flex: 1 1 140px;
}

.input-error,
.input-error:disabled {
  background-color: var(--color-danger-soft) !important;
  border-color: var(--color-danger-border);
  color: var(--color-danger);
  -webkit-text-fill-color: var(--color-danger);
}

.input-success,
.input-success:disabled {
  background-color: var(--color-success-soft) !important;
  border-color: var(--color-success-border);
  color: var(--color-success);
  -webkit-text-fill-color: var(--color-success);
}

.bloqueos-container {
  margin-top: var(--space-5);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  background: var(--color-danger-soft);
  border: 1px solid var(--color-danger-border);
}

.bloqueos-title {
  margin: 0 0 var(--space-2) 0;
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-danger);
}

.bloqueos-list {
  margin: 0;
  padding-left: var(--space-5);
  font-size: var(--text-sm);
  color: var(--color-danger);
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
  margin-top: var(--space-6);
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
}

.btn-submit,
.btn-retirar,
.btn-retirada,
.btn-progreso {
  width: 100%;
  min-height: 40px;
  padding: 0 var(--space-5);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: background-color var(--transition), border-color var(--transition),
    opacity var(--transition);
}

.btn-submit,
.btn-progreso {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-primary);
}

.btn-submit:hover:not(:disabled),
.btn-progreso:hover {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.modal-content > .btn-submit {
  margin-top: var(--space-6);
}

.buttons .btn-submit + .btn-submit {
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border-color: var(--color-border-strong);
}

.buttons .btn-submit + .btn-submit:hover {
  background: var(--color-surface-hover);
  border-color: var(--color-border-strong);
}

.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-retirar {
  background: var(--color-surface);
  color: var(--color-danger);
  border: 1px solid var(--color-danger-border);
}

.btn-retirar:hover {
  background: var(--color-danger-soft);
}

.btn-retirada {
  background: var(--color-surface-hover);
  color: var(--color-text-disabled);
  border: 1px solid var(--color-border);
  cursor: not-allowed;
}

@media (min-width: 768px) {
  .modal-content {
    padding: var(--space-8);
  }

  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-5);
  }

  .requisitos {
    grid-column: span 2;
  }

  .buttons {
    flex-direction: row;
    justify-content: flex-end;
  }

  .btn-submit,
  .btn-retirar,
  .btn-retirada,
  .btn-progreso {
    width: auto;
    min-width: 180px;
  }

  .modal-content > .btn-submit {
    align-self: flex-end;
  }
}

@media (min-width: 1024px) {
  .form-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--space-5) var(--space-6);
  }

  .requisitos {
    grid-column: span 3;
  }

  .monto-field {
    grid-column: 4;
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: var(--space-5) var(--space-4);
  }
}
</style>
