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
        </div>
      </form>
      <div class="buttons">
        <button type="submit" class="btn-submit" @click="abrirNotas">
          Registrar Notas
        </button>

        <button type="submit" class="btn-submit" @click="abrirAsistencia">
          Registrar Asistencia
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from "vue";
import { useRouter } from "vue-router";
const mensajeModal = ref("");
const mostrarExito = ref(false);
const mostrarError = ref(false);

const router = useRouter();

const props = defineProps({
  curso: { type: Object, required: true },
});
const emit = defineEmits(["close", "save"]);

const form = ref({
  nombre: "",
  cupo: "",
  dia: "",
  monto: "",
});

const formatearFecha = (fecha) => {
  if (!fecha) return "N/A";
  return fecha;
};

const abrirNotas = () => {
  const idMateria = props.curso.id_materia;
  router.push({ name: "NotasMateria", params: { id_materia: idMateria } });
};
const abrirAsistencia = () => {
  const idMateria = props.curso.id_materia;

  router.push({
    name: "AsistenciaMateria",
    params: { id_materia: idMateria },
  });
};
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 15px;
}

.modal-content {
  background-color: #f2f2f2;
  padding: 1.5rem;
  border-radius: 12px;
  width: 100%;
  max-width: 1100px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.helper-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
}

.user-data {
  flex: 1;
}

.user-data h2 {
  margin: 0;
  font-size: 1.4rem;
  color: #333;
}

.close-button {
  font-size: 32px;
  cursor: pointer;
  color: #000;
  line-height: 0.8;
  padding: 5px;
  transition: color 0.2s;
}

.close-button:hover {
  color: #666;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 15px;
}

.field {
  display: flex;
  flex-direction: column;
}

label {
  font-size: 13px;
  margin-bottom: 5px;
  color: #555;
  font-weight: 600;
}

input {
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #dcdcdc;
  background: #fff;
  font-size: 14px;
  width: 100%;
}

input:focus {
  border-color: #5fa8a8;
  outline: none;
}

input:disabled {
  background-color: #f9f9f9;
  cursor: not-allowed;
}

.req-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.req-container input {
  flex: 1 1 140px;
}

.input-error {
  background-color: #ffadad !important;
  border-color: #e57373;
}

.input-success {
  background-color: #b2ffb2 !important;
  border-color: #81c784;
}

.bloqueos-container {
  margin-top: 20px;
  padding: 14px 16px;
  border-radius: 10px;
  background: #ffe3e3;
  border: 1px solid #f0a7a7;
}

.bloqueos-title {
  margin: 0 0 8px 0;
  font-weight: 700;
  color: #8a1f1f;
  font-size: 14px;
}

.bloqueos-list {
  margin: 0;
  padding-left: 20px;
  color: #7a2323;
  font-size: 13px;
}

.btn-submit {
  width: 100%;
  cursor: pointer;
  background: #5fa8a8;
  border: none;
  padding: 14px 22px;
  border-radius: 8px;
  color: white;
  margin-top: 24px;
  font-weight: bold;
  transition: background 0.3s;
}

.btn-submit:hover:not(:disabled) {
  background: #4d8a8a;
}

.btn-submit:disabled {
  background: #405656;
  cursor: not-allowed;
  opacity: 0.8;
}

@media (min-width: 768px) {
  .modal-content {
    padding: 2.5rem;
    width: 90%;
  }

  .form-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  .requisitos {
    grid-column: span 2;
  }

  .btn-submit {
    width: auto;
    min-width: 200px;
    display: block;
    margin: 24px auto 0 auto;
  }
}

@media (min-width: 1024px) {
  .form-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 25px 35px;
  }

  .requisitos {
    grid-column: span 3;
  }

  .monto-field {
    grid-column: 4;
  }

  .user-data h2 {
    font-size: 1.8rem;
  }
}

@media (max-width: 480px) {
  .modal-content {
    padding: 1rem;
  }

  .helper-container {
    margin-bottom: 16px;
  }

  .user-data h2 {
    font-size: 1.15rem;
  }
}
</style>
