<template>
  <div class="perfil-container">
    <h1>Panel de Estudiante</h1>

    <section class="card shadow-sm">
      <div class="card-header">Mis Datos Académicos</div>
      <div class="datos-grid" v-if="estudiante">
        <div class="info-group">
          <p><b>Nombre completo:</b> {{ estudiante.nombre }}</p>
          <p><b>Cédula de Identidad:</b> {{ estudiante.ci }}</p>
          <p><b>Correo institucional:</b> {{ estudiante.correo }}</p>
        </div>
        <div class="info-group">
          <p><b>Carrera:</b> {{ estudiante.carrera || "No definida" }}</p>
          <p><b>Teléfono:</b> {{ estudiante.telefono }}</p>
          <p><b>Ubicación:</b> {{ estudiante.direccion }}</p>
        </div>
      </div>
    </section>

    <section class="card shadow-sm">
      <div class="card-header">Mi Horario Semanal</div>

      <div class="horario-layout">
        <aside class="materias-sidebar">
          <h3>Mis Materias</h3>
          <div v-if="materiasUnicas.length === 0" class="no-data">
            Cargando...
          </div>
          <div
            v-for="m in materiasUnicas"
            :key="m.id_materia"
            class="materia-item"
          >
            <span class="dot"></span>
            <div>
              <div class="m-code">{{ m.id_materia }}</div>
              <div class="m-name">{{ m.nombre }}</div>
            </div>
          </div>
        </aside>

        <div class="grid-wrapper">
          <div class="grid-container">
            <div class="grid-header-cell time-col">Hora</div>
            <div v-for="dia in dias" :key="dia" class="grid-header-cell">
              {{ dia }}
            </div>
            <div
              v-for="hora in etiquetasHoras"
              :key="hora"
              class="hora-label"
              :style="{ gridRowStart: getRowIndex(hora) }"
            >
              {{ hora }}
            </div>

            <div
              v-for="(clase, index) in horario"
              :key="index"
              class="clase-bloque"
              :style="posicionarClase(clase)"
              @click="abrirDetalle(clase)"
            >
              <div class="clase-mini-info">
                <span class="clase-id">{{ clase.id_materia }}</span>
                <span class="clase-aula">Aula: {{ clase.aula }}</span>
              </div>
            </div>

            <div
              v-for="n in 6"
              :key="'line-' + n"
              class="vertical-line"
              :style="{ gridColumn: n + 1 }"
            ></div>
          </div>
        </div>
      </div>
    </section>

    <Transition name="bounce">
      <div v-if="modalActivo" class="modal-overlay" @click.self="cerrarModal">
        <div class="modal-box">
          <div class="modal-banner">
            <h2>Información de la Clase</h2>
            <button @click="cerrarModal" class="close-x">&times;</button>
          </div>
          <div class="modal-body" v-if="seleccion">
            <div class="detail-row">
              <span class="label">Materia:</span>
              <span class="value">{{ seleccion.nombre }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Código:</span>
              <span class="value">{{ seleccion.id_materia }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Horario:</span>
              <span class="value highlight">
                {{ seleccion.dia }} |
                {{ seleccion.hora_inicio.substring(0, 5) }} -
                {{ seleccion.hora_fin.substring(0, 5) }}
              </span>
            </div>
            <div class="detail-row">
              <span class="label">Ubicación:</span>
              <span class="value">{{ seleccion.aula }}</span>
            </div>
          </div>
          <div class="modal-footer">
            <button @click="cerrarModal" class="btn-primary">Cerrar</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { miPerfil } from "../services/estudianteService";

const estudiante = ref(null);
const materias = ref([]);
const horario = ref([]);
const modalActivo = ref(false);
const seleccion = ref(null);

const dias = ["Lunes", "Martes", "Miercoles", "Jueves", "Viernes", "Sábado"];

const START_MIN = 7 * 60;
const END_MIN = 21 * 60;
const STEP = 15;

const materiasUnicas = computed(() => {
  const ids = new Set();
  return materias.value.filter((m) => {
    if (!ids.has(m.id_materia)) {
      ids.add(m.id_materia);
      return true;
    }
    return false;
  });
});

onMounted(async () => {
  try {
    const res = await miPerfil();
    if (res.data.success) {
      estudiante.value = res.data.data.estudiante;
      materias.value = res.data.data.materias_inscritas;
      horario.value = res.data.data.horario;
    }
  } catch (e) {
    console.error("Error API:", e);
  }
});

const toMin = (t) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

const etiquetasHoras = computed(() => {
  const list = [];
  for (let t = START_MIN; t <= END_MIN; t += 60) {
    const h = Math.floor(t / 60)
      .toString()
      .padStart(2, "0");
    list.push(`${h}:00`);
  }
  return list;
});

const getRowIndex = (horaStr) =>
  Math.floor((toMin(horaStr) - START_MIN) / STEP) + 2;

const posicionarClase = (c) => {
  const dIdx = dias.indexOf(c.dia);
  if (dIdx === -1) return { display: "none" };

  return {
    gridRowStart: Math.floor((toMin(c.hora_inicio) - START_MIN) / STEP) + 2,
    gridRowEnd: Math.floor((toMin(c.hora_fin) - START_MIN) / STEP) + 2,
    gridColumnStart: dIdx + 2,
  };
};

const abrirDetalle = (clase) => {
  seleccion.value = clase;
  modalActivo.value = true;
};

const cerrarModal = () => {
  modalActivo.value = false;
  setTimeout(() => {
    seleccion.value = null;
  }, 300);
};
</script>

<style scoped>
.perfil-container {
  min-height: 100%;
  color: var(--color-text);
}

h1 {
  margin-bottom: var(--space-6);
  font-size: var(--text-h1);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.card {
  margin-bottom: var(--space-6);
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.shadow-sm {
  box-shadow: var(--shadow-xs);
}

.card-header {
  padding: var(--space-4) var(--space-6);
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-h3);
  font-weight: 600;
  color: var(--color-text);
}

.datos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(300px, 100%), 1fr));
  gap: var(--space-2) var(--space-6);
  padding: var(--space-5) var(--space-6);
}

.info-group p {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin: var(--space-2) 0;
  font-size: var(--text-sm);
  color: var(--color-text);
}

.info-group b {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.horario-layout {
  display: flex;
  gap: var(--space-6);
  padding: var(--space-6);
}

.materias-sidebar {
  width: 220px;
  flex-shrink: 0;
  padding-right: var(--space-5);
  border-right: 1px solid var(--color-border);
}

.materias-sidebar h3 {
  margin-bottom: var(--space-4);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.no-data {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.materia-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
  padding: var(--space-3);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  transition: background-color var(--transition);
}

.materia-item:hover {
  background: var(--color-surface-hover);
}

.dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  margin-top: 6px;
  background: var(--color-primary);
  border-radius: var(--radius-full);
}

.m-code {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-primary);
}

.m-name {
  font-size: var(--text-sm);
  line-height: 1.3;
  color: var(--color-text);
}

.grid-wrapper {
  flex: 1;
  min-width: 0;
  overflow-x: auto;
}

.grid-container {
  display: grid;
  grid-template-columns: 70px repeat(6, 1fr);
  grid-template-rows: 48px repeat(auto-fill, 12px);
  min-width: 800px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.grid-header-cell {
  position: relative;
  z-index: 20;
  grid-row: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-surface-muted);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.hora-label {
  grid-column: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 2px;
  font-size: 11px;
  font-weight: 500;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-muted);
}

.clase-bloque {
  z-index: 10;
  margin: 1px 2px;
  background: var(--color-primary-soft);
  border: 1px solid var(--color-primary-border);
  border-left: 3px solid var(--color-primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color var(--transition), box-shadow var(--transition);
}

.clase-bloque:hover {
  background: var(--color-surface);
  box-shadow: var(--shadow-sm);
}

.clase-mini-info {
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2px;
  padding: var(--space-1);
  text-align: center;
}

.clase-id {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
  color: var(--color-primary);
}

.clase-aula {
  font-size: 11px;
  color: var(--color-text-secondary);
}

.vertical-line {
  grid-row: 2 / -1;
  border-right: 1px solid var(--color-border);
  pointer-events: none;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-4);
  z-index: 9999;
}

.modal-box {
  width: 100%;
  max-width: 440px;
  overflow: hidden;
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.modal-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5) var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.modal-banner h2 {
  margin: 0;
  font-size: var(--text-h2);
  font-weight: 600;
  color: var(--color-text);
}

.close-x {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  font-size: 24px;
  line-height: 1;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition);
}

.close-x:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.modal-body {
  padding: var(--space-6);
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: var(--space-4);
}

.detail-row:last-child {
  margin-bottom: 0;
}

.label {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.value {
  font-size: var(--text-body);
  font-weight: 500;
  color: var(--color-text);
}

.highlight {
  color: var(--color-primary);
  font-weight: 600;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: var(--space-4) var(--space-6);
  border-top: 1px solid var(--color-border);
  background: var(--color-surface-muted);
}

.btn-primary {
  min-height: 40px;
  padding: 0 var(--space-5);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition);
}

.btn-primary:hover {
  background: var(--color-primary-hover);
}

.bounce-enter-active,
.bounce-leave-active {
  transition: opacity var(--transition);
}

.bounce-enter-from,
.bounce-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .horario-layout {
    flex-direction: column;
    padding: var(--space-4);
  }

  .materias-sidebar {
    width: 100%;
    padding-right: 0;
    padding-bottom: var(--space-4);
    border-right: none;
    border-bottom: 1px solid var(--color-border);
  }

  .datos-grid {
    padding: var(--space-4);
  }

  .card-header {
    padding: var(--space-4);
  }

  .modal-box {
    max-height: 90vh;
    max-height: 90dvh;
    overflow-y: auto;
  }

  .modal-body {
    padding: var(--space-5) var(--space-4);
  }

  .modal-footer {
    padding: var(--space-4);
  }

  .btn-primary {
    width: 100%;
  }
}
</style>
