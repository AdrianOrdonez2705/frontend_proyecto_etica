<template>
  <div>
    <div class="icon-wrapper">
      <Icon
        to="../listarCarreras"
        iconName="arrow_back"
        iconColor="var(--color-text-secondary)"
        message="Volver"
      />
    </div>

    <h2>{{ user.nombre }}</h2>

    <div class="form-card">
      <form @submit="manejarEnvio" autocomplete="off">
        <div class="grid">
          <div class="left-column">
            <div>
              <label>Código</label>
              <input type="text" :value="user?.codigo" disabled />
            </div>

            <div>
              <label>Duración</label>
              <input type="text" :value="user?.duracion" disabled />
            </div>
          </div>

          <div class="right-column">
            <label>Descripción</label>
            <textarea :value="user?.descripcion" disabled></textarea>
          </div>
        </div>
      </form>
    </div>
    <br />
    <div class="container">
      <div class="search-container">
        <SearchBarCurso @update:search="searchTerm = $event" />

        <router-link class="registrar" to="../registrarCursos">
          Registrar Curso
        </router-link>
      </div>
      <div>
        <ActionCard
          v-for="curso in filteredCursos"
          :key="curso.id_materia"
          :user="curso"
          @delete="openDeletionModal(curso)"
          @edit="openEditModal(curso)"
        />
      </div>
    </div>
  </div>
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

<style scoped>
.icon-wrapper {
  display: inline-flex;
  align-items: center;
  margin-bottom: var(--space-4);
  padding: var(--space-1) var(--space-2);
  margin-left: calc(var(--space-2) * -1);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition);
}

.icon-wrapper:hover {
  background-color: var(--color-surface-hover);
}

.icon-wrapper :deep(.icon-group) {
  align-items: center;
}

.icon-wrapper :deep(svg) {
  width: 18px;
  height: 18px;
  display: block;
}

h2 {
  font-size: var(--text-h1);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

h2 + p {
  font-size: var(--text-body);
  color: var(--color-text-muted);
  margin-bottom: var(--space-6);
}

h2 + .form-card {
  margin-top: var(--space-5);
}

.form-card {
  max-width: 960px;
  background: var(--color-surface);
  padding: var(--space-8);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-5);
}

.left-column {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.right-column {
  display: flex;
  flex-direction: column;
}

.full-width {
  grid-column: span 1;
}

label {
  display: block;
  margin-bottom: 6px;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

input,
textarea,
.custom-select {
  width: 100%;
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text);
  box-shadow: var(--shadow-xs);
  transition: border-color var(--transition), box-shadow var(--transition);
}

input,
.custom-select {
  height: 40px;
  padding: 0 var(--space-3);
}

textarea {
  flex: 1;
  min-height: 112px;
  padding: 10px var(--space-3);
  line-height: 1.5;
  resize: vertical;
}

.custom-select {
  padding-right: 36px;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23667085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}

input:focus,
textarea:focus,
.custom-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

input:disabled,
textarea:disabled,
.custom-select:disabled {
  background-color: var(--color-surface-muted);
  color: var(--color-text-muted);
  box-shadow: none;
  cursor: default;
}

.buttons {
  margin-top: var(--space-8);
  padding-top: var(--space-5);
  border-top: 1px solid var(--color-border);
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.btn-clear,
.btn-register {
  min-height: 40px;
  padding: 0 var(--space-5);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition), opacity var(--transition);
}

.btn-clear {
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-strong);
}

.btn-clear:hover {
  background: var(--color-surface-hover);
}

.btn-register {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
}

.btn-register:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-register:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.error {
  margin-top: var(--space-1);
  margin-bottom: 0;
  font-size: var(--text-xs);
  color: var(--color-danger);
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  width: 100%;
  padding-right: 44px;
}

.toggle-btn {
  position: absolute;
  right: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.toggle-btn:hover {
  background: var(--color-surface-hover);
}

.container {
  display: flex;
  flex-direction: column;
  margin-top: var(--space-8);
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
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none;
  white-space: nowrap;
  transition: background-color var(--transition);
}

.registrar:hover {
  background-color: var(--color-primary-hover);
}

@media (max-width: 1024px) {
  .form-card {
    padding: var(--space-6);
  }
}

@media (max-width: 768px) {
  .form-card {
    padding: var(--space-5) var(--space-4);
  }

  .grid {
    grid-template-columns: 1fr;
    gap: var(--space-4);
  }

  .buttons {
    flex-direction: column-reverse;
    margin-top: var(--space-6);
  }

  .buttons button {
    width: 100%;
  }

  .search-container {
    flex-direction: column;
    align-items: stretch;
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

<script setup>
import Icon from "../../seguridad/components/Icon.vue";
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import ModalExito from "../../seguridad/components/ModalExito.vue";
import ModalError from "../../seguridad/components/ModalError.vue";
import ActionCard from "../components/ActionCard.vue";
import SearchBarCurso from "../components/SearchBarCurso.vue";
import { verCarrera } from "../servicios/adminsService";
import EditModal from "../components/EditModal.vue";
import DeletionModal from "../../seguridad/components/DeletionModal.vue";
const route = useRoute();

const showModal = ref(false);
const successMessage = ref("");

const showErrorModal = ref(false);
const errorMessage = ref("");
const searchTerm = ref("");

const form = ref({
  codigo: "",
  nombre: "",
  descripcion: "",
  duracion: "",
});

const user = ref({});
const listaCursos = ref([]);
onMounted(async () => {
  try {
    const codigo = route.params.codigo;
    console.log(codigo);
    const response = await verCarrera(codigo);
    user.value = {
      codigo: response.data.data.codigo,
      nombre: response.data.data.nombre,
      descripcion: response.data.data.descripcion,
      duracion: response.data.data.duracion,
    };
    listaCursos.value = response.data.data.materias;
  } catch (err) {
    alert("Error");
  }
});
const filteredCursos = computed(() => {
  if (!searchTerm.value) return listaCursos.value;

  return listaCursos.value.filter(
    (curso) =>
      curso.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      curso.id_materia.toString().includes(searchTerm.value),
  );
});

const selectedUser = ref(null);
const isOpen = ref(false);
const isDeletion = ref(false);

const openEditModal = (curso) => {
  selectedUser.value = { ...curso };
  isOpen.value = true;
};
const openDeletionModal = (curso) => {
  selectedUser.value = { ...curso };
  isDeletion.value = true;
};
</script>
