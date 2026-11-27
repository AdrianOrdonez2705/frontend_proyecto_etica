<template>
  <h2>Cursos</h2>
  <p class="subtitle">
    Aquí puedes ver la lista de cursos por carrera y registrar un nuevo curso
  </p>

  <div class="container">
    <div class="search-container">
      <SearchBarCurso @update:search="searchTerm = $event" />
      <select v-model="carreraSeleccionada" class="custom-select">
        <option value="">Filtrar por carrera</option>
        <option
          v-for="carrera in listaCarreras"
          :key="carrera.codigo"
          :value="carrera.codigo"
        >
          {{ carrera.nombre }}
        </option>
      </select>

      <router-link class="registrar" to="registrarCursos">
        Registrar Nuevo Curso
      </router-link>
    </div>
    <div>
      <ActionCard
        v-for="curso in filteredCursos"
        :key="curso.id_materia"
        :user="curso"
        @edit="openEditModal(curso)"
        @delete="openDeletionModal(curso)"
        @info-pagos="verInfoPagos(curso)"
      />
    </div>
  </div>

  <router-view></router-view>

  <EditModal
    v-if="isOpen"
    :user="selectedUser"
    @close="isOpen = false"
    @save="actualizarCurso"
  />

  <DeletionModal
    v-if="isDeletion"
    :user="selectedUser"
    @cancelar="isDeletion = false"
    @aceptar="deleteTeacher"
  />

  <ModalExito
    :message="successMessage"
    :visible="showModal"
    @close="showModal = false"
  />

  <ModalError
    :message="errorMessage"
    :visible="showErrorModal"
    @close="showErrorModal = false"
  />
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import EditModal from "../components/EditModal.vue";
import ActionCard from "../components/ActionCard.vue";
import SearchBarCurso from "../components/SearchBarCurso.vue";
import ModalError from "../../seguridad/components/ModalError.vue";
import ModalExito from "../../seguridad/components/ModalExito.vue";
import DeletionModal from "../../seguridad/components/DeletionModal.vue";
import { listarCursos, listarCarreras } from "../servicios/adminsService";
import { editarCurso, eliminarCurso } from "../servicios/cursosService";
const router = useRouter();
const showModal = ref(false);
const successMessage = ref("");
const showErrorModal = ref(false);
const errorMessage = ref("");

const searchTerm = ref("");
const cursos = ref([]);
const selectedUser = ref(null);
const isOpen = ref(false);
const isDeletion = ref(false);

const carreraSeleccionada = ref("");

const listaCarreras = ref([]);

const verInfoPagos = (curso) => {
  router.push(`/administrador/info-curso/${curso.id_materia}`);
};

const openEditModal = (curso) => {
  selectedUser.value = { ...curso };
  isOpen.value = true;
};

const openDeletionModal = (curso) => {
  selectedUser.value = { ...curso };
  isDeletion.value = true;
};

const filteredCursos = computed(() => {
  return cursos.value.filter((curso) => {
    const coincideBusqueda =
      !searchTerm.value ||
      curso.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      curso.id_materia.toString().includes(searchTerm.value);

    const coincideCarrera =
      !carreraSeleccionada.value ||
      curso.carrera_codigo === carreraSeleccionada.value;

    return coincideBusqueda && coincideCarrera;
  });
});

const actualizarCurso = async (usuarioActualizado) => {
  console.log("Datos recibidos del modal:", usuarioActualizado);

  try {
    const { id_materia, ...cursoActualizado } = usuarioActualizado;
    console.log("Datos recibidos del modal:", cursoActualizado);
    const resultado = await editarCurso(
      usuarioActualizado.id_materia,
      cursoActualizado,
    );

    if (resultado?.exito) {
      console.log("curso actualizado correctamente:", resultado);

      cursos.value = cursos.value.map((doc) =>
        doc.id_materia === id_materia ? { ...doc, ...cursoActualizado } : doc,
      );

      successMessage.value = resultado.message;
      showModal.value = true;
    } else {
      console.error("Error al actualizar:", resultado?.message);
      errorMessage.value = resultado?.message || "Error desconocido";
      showErrorModal.value = true;
    }
  } catch (error) {
    console.error("Error de conexión con el backend:", error);
    errorMessage.value = "No se pudo conectar con el servidor";
    showErrorModal.value = true;
  }
};

const deleteTeacher = async () => {
  if (!selectedUser.value) return;

  try {
    const response = await eliminarCurso(selectedUser.value.id_materia);
    if (response.success === false) {
      console.error("Error al eliminar: ", response.message);
      return;
    }

    cursos.value = cursos.value.filter(
      (curso) => curso.id_materia !== selectedUser.value.id_materia,
    );

    isDeletion.value = false;
    selectedUser.value = null;

    successMessage.value = "cursoeliminado";
    showModal.value = true;
  } catch (error) {
    console.error("Error eliminando curso: ", error);
    errorMessage.value = "Error al eliminar el curso";
    showErrorModal.value = true;
  }
};

onMounted(async () => {
  try {
    const response = await listarCursos();
    const response2 = await listarCarreras();
    const data = response.data;
    cursos.value = data.data;
    listaCarreras.value = response2.data.data;
  } catch (err) {
    console.error("Error al obtener los datos: ", err);
  }
});
</script>

<style scoped>
h2 {
  font-size: var(--text-h1);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.subtitle {
  font-size: var(--text-body);
  color: var(--color-text-muted);
  margin-bottom: var(--space-6);
}

.container {
  display: flex;
  flex-direction: column;
  margin: 0;
}

.search-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.registrar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  margin-left: auto;
  padding: 0 var(--space-4);
  background-color: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--transition);
}

.registrar:hover {
  background-color: var(--color-primary-hover);
}

.custom-select {
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
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23667085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}

.custom-select:hover {
  border-color: var(--color-text-disabled);
}

.custom-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

@media (max-width: 768px) {
  .search-container {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-3);
  }

  .search-container > * {
    flex: none;
    max-width: none;
  }

  .registrar {
    margin-left: 0;
  }
}
</style>
