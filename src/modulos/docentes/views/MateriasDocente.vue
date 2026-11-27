<template>
  <div class="wrapper">
    <h1>Mis materias</h1>
    <div class="head">
      <div class="search">
        <SearchBar @update:search="searchTerm = $event" />
      </div>
    </div>

    <div class="container">
      <CardMateria
        v-for="curso in filteredCursos"
        :key="curso.id_materia"
        :curso="curso"
        @view="abrirModal(curso)"
      />
    </div>
    <ModalMateria
      v-if="modalAbierto"
      :curso="selectedCurso"
      @close="modalAbierto = false"
    />
  </div>
</template>

<script setup>
import SearchBar from "../components/SearchBar.vue";
import { ref, computed, onMounted } from "vue";

import { listarMisMaterias } from "../services/DocenteService";
import CardMateria from "../components/CardMateria.vue";
import ModalMateria from "../components/ModalMateria.vue";

const modalAbierto = ref(false);
const searchTerm = ref("");
const selectedCurso = ref(null);
const ofertaCarrera = ref(true);
const cumpleMateria = ref(Boolean);
const noCumplen = [];
const abrirModal = async (curso) => {
  selectedCurso.value = { ...curso };
  modalAbierto.value = true;
};

const filteredCursos = computed(() => {
  if (!searchTerm.value) return cursos.value;

  return cursos.value.filter(
    (curso) =>
      curso.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      curso.id_materia.toString().includes(searchTerm.value),
  );
});

onMounted(async () => {
  try {
    const response = await listarMisMaterias(localStorage.getItem("ci"));
    console.log(response);
    cursos.value = response.data.data;
  } catch (error) {
    console.log("Error al obtener los cursos: ", error);
  }
});

const cursos = ref([]);
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

.search {
  width: 100%;
}

.head {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-3);
}

.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: var(--space-5);
  margin-top: var(--space-5);
}

@media (max-width: 768px) {
  .head {
    flex-direction: column;
    align-items: stretch;
  }

  .head :deep(.search-bar) {
    max-width: none;
  }

  .container {
    gap: var(--space-4);
  }
}
</style>
