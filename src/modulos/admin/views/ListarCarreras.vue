<template>
  <h2>Carreras</h2>
  <p class="subtitle">
    Aquí puedes ver la lista de Carreras registradas y agregar una nueva
  </p>
  <div class="container">
    <div class="search-container">
      <SearchBar @update:search="searchTerm = $event" />
      <router-link class="registrar" to="registrarCarrera">
        Registrar Nueva Carrera
      </router-link>
    </div>
    <div>
      <ActionCard
        v-for="carrera in filteredCarreras"
        :key="carrera.codigo"
        :user="carrera"
        @edit="verCarrera(carrera)"
        @delete="openDeletionModal(carrera)"
      />
    </div>
  </div>

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
import router from "../../../router";
import VerCarrera from "./VerCarrera.vue";
import EditModal from "../../seguridad/components/EditModal.vue";
import ActionCard from "../components/ActionCard.vue";
import SearchBar from "../../seguridad/components/SearchBar.vue";
import ModalError from "../../seguridad/components/ModalError.vue";
import ModalExito from "../../seguridad/components/ModalExito.vue";
import DeletionModal from "../../seguridad/components/DeletionModal.vue";
import { listarCarreras } from "../servicios/adminsService";

const showModal = ref(false);
const successMessage = ref("");

const showErrorModal = ref(false);
const errorMessage = ref("");

const carreras = ref([]);
const selectedUser = ref(null);
const isOpen = ref(false);
const isDeletion = ref(false);
const searchTerm = ref("");

const verCarrera = (carrera) => {
  router.push({
    name: "verCarrera",
    params: { codigo: carrera.codigo },
  });
};
const openEditModal = (carrera) => {
  selectedUser.value = { ...carrera };
  isOpen.value = true;
};

const openDeletionModal = (carrera) => {
  selectedUser.value = { ...carrera };
  isDeletion.value = true;
};

const filteredCarreras = computed(() => {
  if (!searchTerm.value) return carreras.value;

  return carreras.value.filter(
    (carrera) =>
      carrera.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      carrera.codigo.toString().includes(searchTerm.value),
  );
});

onMounted(async () => {
  try {
    const response = await listarCarreras();
    const data = response.data;
    carreras.value = data.data;
  } catch (err) {
    console.error("Error al obtener los datos: ", err);
  }
});

const listaCarreras = [
  {
    codigo: "ins",
    nombre: "Ingenieria de Sistemas",
    descripcion:
      "Se enfoca en el diseño, desarrollo, implementación y mantenimiento de software y sistemas informáticos. Los estudiantes aprenden programación, bases de datos, redes y gestión de proyectos tecnológicos.",
    duracion: "5 años",
  },
  {
    codigo: "der",
    nombre: "Derecho",
    descripcion:
      "Forma profesionales capaces de interpretar y aplicar las leyes, representando a personas o instituciones en asuntos legales, así como asesorando en contratos y derechos.",
    duracion: "5 años",
  },
  {
    codigo: "psi",
    nombre: "Psicología",
    descripcion:
      "Estudia el comportamiento y los procesos mentales de las personas, capacitando a los profesionales para ofrecer apoyo psicológico, terapias y asesoramiento en distintos contextos.",
    duracion: "5 años",
  },
];
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
