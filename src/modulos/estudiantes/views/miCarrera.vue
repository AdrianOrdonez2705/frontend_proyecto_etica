<template>
  <div v-if="loading">Cargando...</div>

  <div v-else>
    <div v-if="student && student.data.carrera_usuario === null">
      <h1 class="title">Carreras Disponibles</h1>
      <p class="description">
        Aún no estás inscrito en ninguna carrera. Este es el momento perfecto
        para dar el primer paso hacia tu futuro profesional. Explora nuestras
        carreras disponibles, descubre nuevas oportunidades y elige el camino
        que mejor se adapte a tus metas y aspiraciones. Empieza hoy a construir
        tu futuro académico con confianza, compromiso y el respaldo que
        necesitas para alcanzar el éxito.
      </p>
      <div class="carrera-grid">
        <div class="carrera-card" v-for="carrera in carreras.data">
          <h2>{{ carrera.nombre }}</h2>
          <p class="desc">{{ carrera.descripcion }}</p>
          <div class="specs">
            <p class="spec">
              <SimpleIcon iconName="grid" iconColor="var(--color-primary)" />
              Código: {{ String(carrera.codigo).toUpperCase() }}
            </p>
            <p class="spec">
              <SimpleIcon iconName="verified" iconColor="var(--color-success)" />
              Certificación
            </p>
            <p class="spec">
              <SimpleIcon iconName="clock" iconColor="var(--color-warning)" />
              Duración: {{ carrera.duracion }}
            </p>
          </div>
          <div class="button-group">
            <button class="insc" @click="prepararInscripcion(carrera)">
              Inscribirse
            </button>
            <button class="vermas" @click="verMaterias(carrera)">
              Ver Materias
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="showModal"
        class="modal-overlay"
        @click.self="showModal = false"
      >
        <div class="modal-content">
          <h2>{{ selectedCarrera }}</h2>

          <div v-if="materias.data && materias.data.length > 0">
            <div v-for="materia in materias.data" class="materia-row">
              <p class="detail">
                <SimpleIcon iconName="carrera" iconColor="var(--color-info)" />
                {{ materia.nombre }}
              </p>
              <p class="detail">
                <SimpleIcon iconName="attention" iconColor="var(--color-danger)" />
                Tipo: {{ materia.tipo }}
              </p>
              <p class="detail">
                <SimpleIcon iconName="money" iconColor="var(--color-success)" />
                Monto: Bs. {{ materia.monto }}
              </p>
            </div>
          </div>
          <p v-else-if="!materias.data">Cargando materias...</p>
          <p v-else>No hay materias disponibles.</p>

          <button class="btn-cancel" @click="showModal = false">Cerrar</button>
        </div>
      </div>
      <div
        v-if="showConfirmModal"
        class="modal-overlay"
        @click.self="showConfirmModal = false"
      >
        <div class="modal-content confirm-box">
          <SimpleIcon iconName="warning" iconColor="var(--color-warning)" />
          <p>
            Te inscribirás a
            <strong>{{ carreraParaInscribir?.nombre }}</strong> ¿Deseas
            continuar?
          </p>

          <div class="confirm-buttons">
            <button class="btn-cancel" @click="showConfirmModal = false">
              Cancelar
            </button>
            <button class="btn-confirm" @click="inscribirse">
              Sí, Inscribirme
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="student">
      <h1>Mi Carrera</h1>
      <div class="main-container">
        <h1 class="title">{{ student.data.carrera.nombre }}</h1>
        <p class="description">{{ student.data.carrera.descripcion }}</p>
        <div class="two-group">
          <div class="badges">
            <p class="badge">
              <SimpleIcon iconName="clock" iconColor="var(--color-warning)" />
              Duración de {{ student.data.carrera.duracion }}
            </p>
            <p class="badge">
              <SimpleIcon iconName="verified" iconColor="var(--color-success)" />
              Certificación Digital
            </p>
            <p class="badge">
              <SimpleIcon iconName="grid" iconColor="var(--color-primary)" />
              Código:
              {{ String(student.data.carrera.codigo).toUpperCase() }}
            </p>
            <p class="badge" v-if="courseComp && totalMaterias > 0">
              <SimpleIcon iconName="percentage" iconColor="var(--color-danger)" />
              Completado: {{ completionPercentage }} %
            </p>
          </div>
          <div class="information">
            <h3 class="title">
              <SimpleIcon iconName="datos" iconColor="var(--color-warning)" />
              Mis Datos:
            </h3>
            <p class="titu">Nombre:</p>
            {{ student.data.nombre }}
            <p class="titu">CI:</p>
            {{ student.data.ci }}
            <p class="titu">Correo:</p>
            {{ student.data.correo }}
            <p class="titu">Fecha de Nacimiento:</p>
            {{ student.data.fecha_nac }}
            <p class="titu">Dirección:</p>
            {{ student.data.direccion }}
            <p class="titu">Teléfono:</p>
            {{ student.data.telefono }}
          </div>
        </div>
      </div>
    </div>

    <div v-else>
      <p>Estudiante no encontrado o error al cargar los datos.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import api from "../../../services";
import SimpleIcon from "../../seguridad/components/SimpleIcon.vue";

const student = ref(null);
const loading = ref(true);
const carreras = ref([]);
const materias = ref([]);
const selectedCarrera = ref("");
const showModal = ref(false);
const showConfirmModal = ref(false);
const carreraParaInscribir = ref(null);
const courseComp = ref(null);

const totalMaterias = computed(() => {
  return courseComp.value?.data?.total_materias_carrera ?? 0;
});

const aprobadasMaterias = computed(() => {
  return courseComp.value?.data?.materias_por_estado?.aprobadas ?? 0;
});

const completionPercentage = computed(() => {
  if (!totalMaterias.value) return 0;
  return ((aprobadasMaterias.value / totalMaterias.value) * 100).toFixed(0);
});

onMounted(async () => {
  try {
    const ci = localStorage.getItem("ci");
    const token = localStorage.getItem("token");
    if (ci) {
      const response = await api.get(`/estudiantes/${ci}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.data;
      student.value = data;
    }

    const carrerasResponse = await api.get("/carreras/disponibles", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const carreraData = await carrerasResponse.data;
    carreras.value = carreraData;

    const courseResponse = await api.get("/estudiantes/mi-carrera", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    courseComp.value = courseResponse.data;
  } catch (error) {
    console.error("Error al obtener el usuario:", error);
  } finally {
    loading.value = false;
  }
});

async function verMaterias(carrera) {
  try {
    selectedCarrera.value = carrera.nombre;
    const localToken = localStorage.getItem("token");
    const materiasResponse = await api.get(
      `carreras/disponibles/${carrera.codigo}/materias`,
      {
        headers: { Authorization: `Bearer ${localToken}` },
      },
    );

    const materiasData = materiasResponse.data;
    materias.value = materiasData;
    showModal.value = true;
  } catch (error) {
    console.error("ERROR", error);
  }
}

function prepararInscripcion(carrera) {
  carreraParaInscribir.value = carrera;
  showConfirmModal.value = true;
}

async function inscribirse() {
  if (!carreraParaInscribir.value) return;

  try {
    showConfirmModal.value = false;
    loading.value = true;
    const locToken = localStorage.getItem("token");

    const inscResponse = await api.post(
      "/estudiantes/inscribirse",
      {
        codigo_carrera: carreraParaInscribir.value.codigo,
      },
      {
        headers: { Authorization: `Bearer ${locToken}` },
      },
    );

    if (inscResponse.data.success) {
      student.value = inscResponse.data;
    }
  } catch (error) {
    console.error("ERROR", error);
    alert("No se pudo completar la inscripción.");
  } finally {
    loading.value = false;
    carreraParaInscribir.value = null;
  }
}
</script>

<style scoped>
h1 {
  margin-bottom: var(--space-6);
  font-size: var(--text-h1);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.title {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin: 0 0 var(--space-2);
  font-size: var(--text-h1);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text);
  text-align: left;
}

.main-container .title {
  font-size: var(--text-h2);
  font-weight: 600;
  letter-spacing: 0;
}

.description {
  max-width: 760px;
  margin: 0 0 var(--space-6);
  font-size: var(--text-body);
  line-height: 1.6;
  color: var(--color-text-muted);
  text-align: left;
}

.main-container {
  padding: var(--space-6);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-top: 4px solid var(--color-primary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}

.two-group {
  display: flex;
  gap: var(--space-6);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
  flex-wrap: wrap;
}

.badges {
  display: flex;
  flex-direction: column;
  flex: 1 1 260px;
  gap: var(--space-2);
}

.badge,
.spec {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  width: fit-content;
  max-width: 100%;
  padding: var(--space-1) var(--space-3);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-full);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
  cursor: default;
  user-select: none;
}

.badge :deep(svg),
.spec :deep(svg),
.detail :deep(svg),
.title :deep(svg) {
  width: 16px;
  height: 16px;
  display: block;
}

.information {
  display: flex;
  flex-direction: column;
  flex: 2 1 400px;
  padding: var(--space-5);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  font-size: var(--text-sm);
  color: var(--color-text);
}

.information .title {
  margin-bottom: var(--space-2);
  font-size: var(--text-h3);
}

.titu {
  margin-top: var(--space-3);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.carrera-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(340px, 100%), 1fr));
  gap: var(--space-5);
}

.carrera-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-6);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  transition: border-color var(--transition), box-shadow var(--transition);
}

.carrera-card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-sm);
}

.carrera-card h2 {
  font-size: var(--text-h3);
  font-weight: 600;
  color: var(--color-text);
}

.desc {
  margin: var(--space-2) 0 0;
  font-size: var(--text-sm);
  line-height: 1.6;
  color: var(--color-text-muted);
}

.specs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin: var(--space-4) 0 0;
}

.spec {
  font-size: var(--text-xs);
  white-space: nowrap;
}

.button-group {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-3);
  margin-top: auto;
  padding-top: var(--space-5);
}

.insc,
.vermas,
.btn-cancel,
.btn-confirm {
  min-height: 40px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition);
}

.insc,
.btn-confirm {
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
}

.insc:hover,
.btn-confirm:hover {
  background-color: var(--color-primary-hover);
}

.vermas,
.btn-cancel {
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-strong);
}

.vermas:hover,
.btn-cancel:hover {
  background-color: var(--color-surface-hover);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
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
  max-width: 520px;
  max-height: 85vh;
  overflow-y: auto;
  padding: var(--space-6);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.modal-content > h2 {
  margin-bottom: var(--space-4);
  font-size: var(--text-h2);
  font-weight: 600;
  color: var(--color-text);
}

.modal-content > p {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.modal-content > .btn-cancel {
  align-self: flex-end;
  margin-top: var(--space-5);
}

.materia-row {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin: 0 0 var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.detail {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.detail:first-child {
  font-weight: 600;
  color: var(--color-text);
}

.confirm-box {
  align-items: center;
  max-width: 440px;
  text-align: center;
}

.confirm-box > :first-child {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: var(--space-4);
  border-radius: var(--radius-full);
  background: var(--color-warning-soft);
}

.confirm-box > p {
  font-size: var(--text-body);
  color: var(--color-text-secondary);
}

.confirm-box strong {
  color: var(--color-text);
}

.confirm-buttons {
  display: flex;
  gap: var(--space-3);
  justify-content: center;
  margin-top: var(--space-6);
  flex-wrap: wrap;
}

@media (max-width: 900px) {
  .two-group {
    flex-direction: column;
  }
}

@media (max-width: 768px) {
  .main-container,
  .carrera-card {
    padding: var(--space-4);
  }

  .button-group {
    flex-direction: column;
    align-items: stretch;
  }

  .insc,
  .vermas {
    width: 100%;
  }

  .confirm-buttons {
    flex-direction: column-reverse;
    width: 100%;
  }

  .btn-cancel,
  .btn-confirm {
    width: 100%;
  }
}
</style>
