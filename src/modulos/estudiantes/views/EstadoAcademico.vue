<template>
  <div class="wrapper">
    <div class="title-row">
      <h1>Estado académico de mis materias</h1>

      <button class="volver-btn" @click="volver">Volver</button>
    </div>

    <div class="head">
      <div class="search">
        <SearchBar @update:search="searchTerm = $event" />
      </div>

      <div class="filter-container">
        <select v-model="estadoFiltro">
          <option value="">Filtrar por estado</option>
          <option value="EN_CURSO">Activo</option>
          <option value="APROBADA">Aprobado</option>
          <option value="REPROBADA">Reprobado</option>
        </select>
      </div>

      <button class="archivadas-btn" @click="abrirArchivadas">
        <i class="fa-solid fa-box-archive"></i>
        Materias archivadas
      </button>
    </div>

    <div class="container">
      <CursoEstadoCard
        v-for="curso in filteredEnCurso"
        :key="curso.id_materia + '-' + (curso.id_inscripcion || '')"
        :curso="curso"
        @view="irMiProgreso"
      />
    </div>

    <ModalMateriasCulminadas
      v-if="modalArchivadas"
      :materias="filteredArchivadas"
      @close="modalArchivadas = false"
      @view="irMiProgreso"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import SearchBar from "../components/SearchBar.vue";
import CursoEstadoCard from "../components/CursoEstadoCard.vue";
import ModalMateriasCulminadas from "../components/ModalMateriasCulminadas.vue";
import {
  listarMateriasEnCurso,
  listarMateriasCulminadas,
} from "../services/estudianteService";

const router = useRouter();

const searchTerm = ref("");
const estadoFiltro = ref("");
const materiasEnCurso = ref([]);
const materiasArchivadas = ref([]);
const modalArchivadas = ref(false);

const normalizarEstadoAcademico = (estado) => {
  if (!estado) return "";
  return String(estado).toUpperCase().trim();
};

const abrirArchivadas = () => {
  modalArchivadas.value = true;
};

const irMiProgreso = (curso) => {
  modalArchivadas.value = false;
  router.push({
    name: "miProgreso",
    params: {
      id_materia: curso.id_materia,
    },
  });
};

const volver = () => {
  router.back();
};

const filteredEnCurso = computed(() => {
  let resultado = materiasEnCurso.value.filter(
    (curso) => normalizarEstadoAcademico(curso.estado_academico) === "EN_CURSO",
  );

  if (searchTerm.value) {
    resultado = resultado.filter(
      (curso) =>
        curso.nombre?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        curso.id_materia?.toString().includes(searchTerm.value),
    );
  }

  if (estadoFiltro.value) {
    resultado = resultado.filter(
      (curso) =>
        normalizarEstadoAcademico(curso.estado_academico) ===
        normalizarEstadoAcademico(estadoFiltro.value),
    );
  }

  return resultado;
});

const filteredArchivadas = computed(() => {
  let resultado = materiasArchivadas.value.filter((curso) => {
    const estado = normalizarEstadoAcademico(curso.estado_academico);
    return estado === "APROBADA" || estado === "REPROBADA";
  });

  if (searchTerm.value) {
    resultado = resultado.filter(
      (curso) =>
        curso.nombre?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
        curso.id_materia?.toString().includes(searchTerm.value),
    );
  }

  if (estadoFiltro.value) {
    const filtro = normalizarEstadoAcademico(estadoFiltro.value);
    resultado = resultado.filter(
      (curso) => normalizarEstadoAcademico(curso.estado_academico) === filtro,
    );
  }

  return resultado;
});

const mapearInscripcionesAMaterias = (inscripciones = []) => {
  return inscripciones.flatMap((inscripcion) =>
    (inscripcion.materias || []).map((m) => ({
      ...m.materia,
      estado: m.estado,
      estado_academico: m.estado_academico,
      id_inscripcion: inscripcion.id_inscripcion,
      fecha_inscripcion: inscripcion.fecha_inscripcion,
      fecha_retiro: m.fecha_retiro || null,
      fecha_culminacion: m.fecha_fin || null,
    })),
  );
};

const cargarMateriasEnCurso = async () => {
  try {
    const response = await listarMateriasEnCurso();

    console.log("RESPUESTA EN_CURSO:", response);

    const inscripciones = response?.data?.data || [];
    materiasEnCurso.value = mapearInscripcionesAMaterias(inscripciones);

    console.log("MATERIAS EN CURSO MAPEADAS:", materiasEnCurso.value);
  } catch (error) {
    console.log(
      "Error al obtener materias en curso:",
      error?.response?.data || error,
    );
    materiasEnCurso.value = [];
  }
};

const cargarMateriasArchivadas = async () => {
  try {
    const response = await listarMateriasCulminadas();

    console.log("RESPUESTA CULMINADAS:", response);

    const inscripciones = response?.data?.data || [];
    materiasArchivadas.value = mapearInscripcionesAMaterias(inscripciones);

    console.log("MATERIAS ARCHIVADAS MAPEADAS:", materiasArchivadas.value);
  } catch (error) {
    console.log(
      "Error al obtener materias culminadas:",
      error?.response?.data || error,
    );
    materiasArchivadas.value = [];
  }
};

onMounted(async () => {
  await Promise.all([cargarMateriasEnCurso(), cargarMateriasArchivadas()]);
});
</script>

<style scoped>
.wrapper {
  padding: 0;
}

.wrapper h1 {
  margin-bottom: var(--space-6);
  font-size: var(--text-h1);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.title-row h1 {
  margin-bottom: 0;
}

.estado-academico-btn,
.volver-btn,
.archivadas-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 40px;
  padding: 0 var(--space-4);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
  font-size: var(--text-sm);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition);
}

.estado-academico-btn:hover,
.volver-btn:hover,
.archivadas-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.estado-academico-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}

.estado-academico-btn:hover {
  background: var(--color-primary-hover);
  color: var(--color-text-inverse);
}

.head {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-3);
}

.search {
  flex: 1;
  min-width: 0;
}

.filter-container {
  flex-shrink: 0;
}

.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: var(--space-5);
  margin-top: var(--space-5);
}

select {
  height: 40px;
  min-width: 200px;
  padding: 0 36px 0 var(--space-3);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
  font-size: var(--text-sm);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color var(--transition), box-shadow var(--transition);
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23667085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}

select:hover {
  border-color: var(--color-text-disabled);
}

select:focus {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
  outline: none;
}

option {
  font-size: var(--text-sm);
  background-color: var(--color-surface);
  color: var(--color-text);
}

.cart-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition);
}

.cart-button:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.cart-button :deep(svg) {
  width: 20px;
  height: 20px;
  display: block;
}

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: 2px solid var(--color-bg);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 700;
}

@media (max-width: 768px) {
  .title-row {
    flex-direction: column;
    align-items: stretch;
  }

  .head {
    flex-direction: column;
    align-items: stretch;
  }

  .head :deep(.search-bar) {
    max-width: none;
  }

  .search,
  .filter-container,
  select,
  .archivadas-btn,
  .estado-academico-btn,
  .volver-btn {
    width: 100%;
  }

  .cart-button {
    width: 100%;
  }

  .container {
    gap: var(--space-4);
  }
}
</style>
