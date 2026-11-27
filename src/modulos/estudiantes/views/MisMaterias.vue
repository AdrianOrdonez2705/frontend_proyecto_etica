<template>
  <div class="wrapper">
    <div class="title-row">
      <h1>Mis materias</h1>

      <button class="estado-academico-btn" @click="irEstadoAcademico">
        Estado Académico
      </button>
    </div>

    <div class="head">
      <div class="search">
        <SearchBar @update:search="searchTerm = $event" />
      </div>

      <div class="filter-container">
        <select v-model="estadoFiltro">
          <option value="">Filtrar por estado</option>
          <option value="INSCRITO">Inscrito</option>
          <option value="PENDIENTE_PAGO">Pago pendiente</option>
          <option value="RETIRADO">Retirado</option>
        </select>
      </div>
    </div>

    <div class="container" v-if="ofertaCarrera">
      <CursoCard
        v-for="curso in filteredCursos"
        :key="curso.id_materia + '-' + curso.id_inscripcion"
        :curso="curso"
        @view="abrirModal(curso)"
      />
    </div>

    <ModalCurso
      v-if="modalAbierto"
      :curso="selectedCurso"
      :noCumple="noCumplen"
      @close="modalAbierto = false"
      @retirar="confirmarRetiro"
    />
  </div>
</template>

<script setup>
import SearchBar from "../components/SearchBar.vue";
import { ref, computed, onMounted } from "vue";
import Swal from "sweetalert2";
import { useRouter } from "vue-router";
import {
  listarMisMaterias,
  retirarMateria,
} from "../services/estudianteService";
import CursoCard from "../components/CursoCard.vue";
import ModalCurso from "../components/ModalCurso.vue";

const router = useRouter();

const modalAbierto = ref(false);
const searchTerm = ref("");
const selectedCurso = ref(null);
const ofertaCarrera = ref(true);
const cumpleMateria = ref(Boolean);
const noCumplen = [];
const estadoFiltro = ref("");

const cursos = ref([]);
const cursosExtracurriculares = ref([]);

const normalizarEstado = (estado) => {
  if (!estado) return "";
  return estado.toUpperCase().trim();
};

const abrirModal = async (curso) => {
  selectedCurso.value = { ...curso };
  modalAbierto.value = true;
};

const irEstadoAcademico = () => {
  router.push("/estudiante/estadoAcademico");
};

const filteredCursos = computed(() => {
  let resultado = cursos.value;

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
        normalizarEstado(curso.estado) === normalizarEstado(estadoFiltro.value),
    );
  }

  return resultado;
});

const filteredCursosExtra = computed(() => {
  if (!searchTerm.value) return cursosExtracurriculares.value;

  return cursosExtracurriculares.value.filter(
    (curso) =>
      curso.nombre?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      curso.id_materia?.toString().includes(searchTerm.value),
  );
});

const confirmarRetiro = async (curso) => {
  if (!curso) return;

  if (normalizarEstado(curso.estado) === "RETIRADO") return;

  const result = await Swal.fire({
    title: "Confirmar retiro",
    html: `
      <p>¿Seguro que deseas retirar esta materia?</p>
      <p>Esta acción no permitirá reinscribirte en el mismo ciclo además de que no hay devoluciones del mismo.</p>
    `,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Confirmar",
    cancelButtonText: "Cancelar",
    reverseButtons: true,
  });

  if (!result.isConfirmed) return;

  try {
    await retirarMateria(curso.id_inscripcion, curso.id_materia);

    await cargarMisMaterias();

    const materiaActualizada = cursos.value.find(
      (item) =>
        item.id_materia === curso.id_materia &&
        item.id_inscripcion === curso.id_inscripcion,
    );

    if (materiaActualizada) {
      selectedCurso.value = { ...materiaActualizada };
    }

    await Swal.fire({
      icon: "success",
      title: "Materia retirada",
      text: "La materia fue retirada correctamente.",
    });
  } catch (error) {
    console.log("Error al retirar la materia:", error);

    await Swal.fire({
      icon: "error",
      title: "Error",
      text: error?.mensaje || "No se pudo retirar la materia.",
    });
  }
};

const cargarMisMaterias = async () => {
  try {
    const response = await listarMisMaterias();
    const inscripciones = response.data.data;

    cursos.value = inscripciones.flatMap((inscripcion) =>
      inscripcion.materias.map((m) => ({
        ...m.materia,
        estado: m.estado,
        id_inscripcion: inscripcion.id_inscripcion,
        fecha_inscripcion: inscripcion.fecha_inscripcion,
        fecha_retiro: m.fecha_retiro ?? m.materia?.fecha_retiro ?? null,
      })),
    );
  } catch (error) {
    console.log("Error al obtener los cursos: ", error);
  }
};

onMounted(async () => {
  await cargarMisMaterias();
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
