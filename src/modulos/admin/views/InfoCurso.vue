<template>
  <div class="info-curso-container">
    <div class="header">
      <button class="back-button" @click="volver">
        <span class="back-arrow">←</span> Volver
      </button>
      <h2>Información de la Materia</h2>
      <p class="subtitle">
        Aquí puedes ver la lista de estudiantes y los pagos relacionados
      </p>
    </div>

    <div v-if="cursoInfo" class="curso-header">
      <h3>
        {{ cursoInfo.nombre }} <br /><span class="curso-id"
          >[{{ cursoInfo.id_materia }}]</span
        >
      </h3>
    </div>

    <div v-if="resumen" class="resumen-cards">
      <div class="resumen-card">
        <div class="resumen-info">
          <span class="resumen-label">Inscritos</span>
          <span class="resumen-value">{{ resumen.inscritos }}</span>
        </div>
      </div>
      <div class="resumen-card">
        <div class="resumen-info">
          <span class="resumen-label">Cupos restantes</span>
          <span class="resumen-value">{{ resumen.cupos_restantes }}</span>
        </div>
      </div>
      <div class="resumen-card">
        <div class="resumen-info">
          <span class="resumen-label">Recaudado</span>
          <span class="resumen-value">{{
            formatCurrency(resumen.recaudado)
          }}</span>
        </div>
      </div>
    </div>

    <div class="table-container" v-if="estudiantes.length > 0">
      <table class="estudiantes-table">
        <thead>
          <tr>
            <th>Nombre Completo</th>
            <th>Estado materia</th>
            <th>Estado académico</th>
            <th>Fecha retiro</th>
            <th>Monto pagado</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(estudiante, index) in estudiantes" :key="index">
            <td>{{ estudiante.nombre_completo }}</td>
            <td>
              <span :class="getEstadoMateriaClass(estudiante.estado_materia)">
                {{ estudiante.estado_materia }}
              </span>
            </td>
            <td>{{ estudiante.estado_academico || "-" }}</td>
            <td>{{ estudiante.fecha_retiro || "-" }}</td>
            <td :class="{ 'monto-pagado': estudiante.monto_pagado > 0 }">
              {{ formatCurrency(estudiante.monto_pagado) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else-if="cargando" class="loading-message">
      Cargando información...
    </div>

    <div v-else class="no-data-message">
      No hay estudiantes inscritos en este curso
    </div>

    <ModalError
      :message="errorMessage"
      :visible="showErrorModal"
      @close="showErrorModal = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import ModalError from "../../seguridad/components/ModalError.vue";
import {
  obtenerEstudiantesPagosCurso,
  obtenerResumenPagosCurso,
} from "../servicios/cursosService";

const route = useRoute();
const router = useRouter();

const cursoInfo = ref(null);
const estudiantes = ref([]);
const resumen = ref(null);
const cargando = ref(true);
const showErrorModal = ref(false);
const errorMessage = ref("");

const cursoId = route.params.id;

const volver = () => {
  router.push("/administrador/listarCursos");
};

const formatCurrency = (value) => {
  if (value === undefined || value === null) return "$0";
  return new Intl.NumberFormat("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const getEstadoMateriaClass = (estado) => {
  switch (estado) {
    case "INSCRITO":
      return "estado-inscrito";
    case "PENDIENTE_PAGO":
      return "estado-pendiente";
    case "RETIRADO":
      return "estado-retirado";
    default:
      return "";
  }
};

onMounted(async () => {
  cargando.value = true;

  try {
    const estudiantesResponse = await obtenerEstudiantesPagosCurso(cursoId);
    if (estudiantesResponse.exito) {
      cursoInfo.value = estudiantesResponse.data.curso;
      estudiantes.value = estudiantesResponse.data.estudiantes || [];
    } else {
      errorMessage.value =
        estudiantesResponse.mensaje || "Error al cargar estudiantes";
      showErrorModal.value = true;
    }

    const resumenResponse = await obtenerResumenPagosCurso(cursoId);
    if (resumenResponse.exito) {
      resumen.value = resumenResponse.data.resumen;
    }
  } catch (error) {
    console.error("Error cargando datos:", error);
    errorMessage.value = "Error al cargar la información del curso";
    showErrorModal.value = true;
  } finally {
    cargando.value = false;
  }
});
</script>

<style scoped>
.info-curso-container {
  min-height: 100%;
}

.header {
  margin-bottom: var(--space-6);
}

.back-button {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-4);
  margin-left: calc(var(--space-2) * -1);
  padding: var(--space-1) var(--space-2);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition);
}

.back-button:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text);
}

.back-arrow {
  font-size: 16px;
  line-height: 1;
}

h2 {
  margin: 0 0 var(--space-1) 0;
  font-size: var(--text-h1);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.subtitle {
  margin-top: 0;
  font-size: var(--text-body);
  color: var(--color-text-muted);
}

.curso-header {
  padding: var(--space-5) var(--space-6);
  margin-bottom: var(--space-5);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-top: 4px solid var(--color-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}

.curso-header h3 {
  margin: 0;
  font-size: var(--text-h2);
  font-weight: 600;
  line-height: 1.4;
  color: var(--color-text);
  text-align: left;
}

.curso-id {
  display: inline-block;
  margin-top: var(--space-2);
  margin-left: 0;
  padding: 2px var(--space-2);
  background: var(--color-surface-hover);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-text-muted);
}

.resumen-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.resumen-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-5);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}

.resumen-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: var(--color-primary-soft);
  color: var(--color-primary);
  border-radius: var(--radius-md);
}

.resumen-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  text-align: left;
}

.resumen-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-muted);
}

.resumen-value {
  font-size: 1.75rem;
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.table-container {
  overflow-x: auto;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}

.estudiantes-table {
  width: 100%;
  border-collapse: collapse;
}

.estudiantes-table th {
  padding: var(--space-3) var(--space-4);
  background-color: var(--color-surface-muted);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  text-align: left;
  white-space: nowrap;
}

.estudiantes-table td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-align: left;
}

.estudiantes-table td:first-child {
  color: var(--color-text);
  font-weight: 500;
}

.estudiantes-table tbody tr:last-child td {
  border-bottom: none;
}

.estudiantes-table tbody tr:hover {
  background-color: var(--color-surface-hover);
}

.estado-inscrito,
.estado-pendiente,
.estado-retirado {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-2);
  border: 1px solid;
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 600;
}

.estado-inscrito {
  background-color: var(--color-success-soft);
  border-color: var(--color-success-border);
  color: var(--color-success);
}

.estado-pendiente {
  background-color: var(--color-warning-soft);
  border-color: var(--color-warning-border);
  color: var(--color-warning);
}

.estado-retirado {
  background-color: var(--color-danger-soft);
  border-color: var(--color-danger-border);
  color: var(--color-danger);
}

.monto-pagado {
  color: var(--color-success);
  font-weight: 600;
}

.loading-message,
.no-data-message {
  padding: var(--space-10) var(--space-6);
  background-color: var(--color-surface);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-align: center;
}

@media (max-width: 768px) {
  .resumen-cards {
    grid-template-columns: 1fr;
  }

  .estudiantes-table {
    min-width: 560px;
  }

  .curso-header {
    padding: var(--space-4);
  }
}
</style>
