<template>
  <div class="contenedor">
    <h2>Mi Progreso en la Materia</h2>

    <div v-if="cargando" class="mensaje">Cargando datos...</div>

    <div v-else-if="error" class="mensaje error">
      {{ error }}
    </div>

    <div v-else>
      <div class="dashboard">
        <div class="grafica-card">
          <h3>Porcentaje de Asistencia</h3>
          <Pie :data="chartData" :options="chartOptions" />
          <div class="porcentaje-grande">{{ porcentaje }}%</div>
        </div>

        <div class="resumen-card">
          <h3>Resumen</h3>

          <div class="dato">
            <span>Clases asistidas</span>
            <strong class="positivo">{{ presentes }}</strong>
          </div>

          <div class="dato">
            <span>Faltas</span>
            <strong class="negativo">{{ faltas }}</strong>
          </div>

          <div class="dato">
            <span>Total de clases</span>
            <strong>{{ total }}</strong>
          </div>

          <div :class="['mensaje-asistencia', claseMensaje]">
            {{ mensajeAsistencia }}
          </div>
        </div>
      </div>
      <br />
      <h1>Mis notas</h1>

      <div class="notas-container">
        <div class="nota-card" v-for="(nota, index) in notas" :key="index">
          <div class="nota-header">Nota {{ index + 1 }}</div>

          <div class="nota-valor">
            {{ nota.calificacion }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { Pie } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";

import {
  obtenerMiProgreso,
  listarNotasMaterias,
} from "../services/miProgresoService";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const route = useRoute();
const materiaId = route.params.id_materia;

const notas = ref([]);

const cargando = ref(true);
const error = ref(null);

const presentes = ref(0);
const faltas = ref(0);
const total = ref(0);

const porcentaje = computed(() => {
  if (total.value === 0) return 0;
  return Math.round((presentes.value / total.value) * 100);
});

const mensajeAsistencia = computed(() => {
  if (porcentaje.value >= 70) {
    return "Tu asistencia está bien";
  }
  return "Tu asistencia no está bien";
});

const claseMensaje = computed(() => {
  return porcentaje.value >= 70 ? "mensaje-ok" : "mensaje-mal";
});

const chartData = computed(() => ({
  labels: ["Asistencias", "Faltas"],
  datasets: [
    {
      data: [presentes.value, faltas.value],
      backgroundColor: ["#067647", "#b42318"],
    },
  ],
}));

const chartOptions = {
  responsive: true,
  plugins: {
    legend: { position: "bottom" },
  },
};

onMounted(async () => {
  try {
    const resp = await obtenerMiProgreso(materiaId);
    const data = resp.data;
    presentes.value = data.presentes || 0;
    faltas.value = data.faltas || 0;
    total.value = data.total || 0;
  } catch (error) {
    error.value = resp.mensaje;
    cargando.value = false;
    return;
  }

  try {
    const response = await listarNotasMaterias(materiaId);

    notas.value = response.data.data.data;
  } catch (error) {
    console.log(error);
  }

  cargando.value = false;
});
</script>

<style scoped>
.contenedor {
  padding: 0;
}

.contenedor h2 {
  font-size: var(--text-h1);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.contenedor h1 {
  margin-top: var(--space-4);
  font-size: var(--text-h2);
  font-weight: 600;
  letter-spacing: 0;
  color: var(--color-text);
}

.contenedor h3 {
  margin-bottom: var(--space-4);
  font-size: var(--text-h3);
  font-weight: 600;
  color: var(--color-text);
}

.dashboard {
  display: flex;
  gap: var(--space-5);
  margin-top: var(--space-6);
}

.grafica-card,
.resumen-card {
  padding: var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}

.grafica-card {
  position: relative;
  width: 320px;
  flex-shrink: 0;
}

.porcentaje-grande {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: var(--text-h1);
  font-weight: 700;
  color: var(--color-text-inverse);
}

.resumen-card {
  flex: 1;
}

.dato {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: var(--space-3) 0;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.dato strong {
  font-size: var(--text-h2);
  font-weight: 700;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.dato strong.positivo {
  color: var(--color-success);
}

.dato strong.negativo {
  color: var(--color-danger);
}

.mensaje {
  margin-top: var(--space-6);
  padding: var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-align: center;
}

.mensaje.error {
  background: var(--color-danger-soft);
  border-color: var(--color-danger-border);
  color: var(--color-danger);
}

.mensaje-asistencia {
  margin-top: var(--space-5);
  padding: var(--space-3) var(--space-4);
  border: 1px solid;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  text-align: left;
}

.mensaje-ok {
  background-color: var(--color-success-soft);
  border-color: var(--color-success-border);
  color: var(--color-success);
}

.mensaje-mal {
  background-color: var(--color-danger-soft);
  border-color: var(--color-danger-border);
  color: var(--color-danger);
}

.notas-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.nota-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  transition: transform var(--transition), box-shadow var(--transition),
    border-color var(--transition);
}

.nota-card:hover {
  transform: translateY(-2px);
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-sm);
}

.nota-header {
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.nota-valor {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1.1;
  letter-spacing: -0.01em;
  color: var(--color-primary);
  font-variant-numeric: tabular-nums;
}

@media (max-width: 768px) {
  .dashboard {
    flex-direction: column;
    gap: var(--space-4);
  }

  .grafica-card,
  .resumen-card {
    width: 100%;
    padding: var(--space-5);
  }

  .notas-container {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
}
</style>
