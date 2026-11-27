<template>
  <div class="titles">
    <h1>Registro de Nuevas Aulas</h1>
    <p class="subtitle">Completa el formulario para agregar una nueva aula</p>
  </div>
  <div class="main-card">
    <p>Nombre o Código del Aula:</p>
    <div class="register-container">
      <input
        v-model="nombreAula"
        type="text"
        class="new-aula"
        placeholder="Nombre o código"
        @keyup.enter="handleRegister"
        :disabled="isSubmitting"
      />
      <button
        class="registrar"
        @click="handleRegister"
        :disabled="isSubmitting"
      >
        <span v-if="!isSubmitting">Registrar</span>
        <span v-else class="loading-content">
          <i class="spinner"></i> Registrando...
        </span>
      </button>
    </div>

    <h2>Aulas Registradas:</h2>
    <div class="aulas-cards">
      <div class="single-aula" v-for="aula in aulas" :key="aula.id_aula">
        <Icon iconName="classroom" iconColor="var(--color-primary)" />
        <p>{{ aula.nombre }}</p>
      </div>
    </div>
  </div>

  <Transition name="fade">
    <div
      v-if="modal.show"
      class="modal-overlay"
      @click.self="modal.show = false"
    >
      <div class="modal-content" :class="modal.type">
        <div class="modal-icon-circle">
          <span v-if="modal.type === 'success'">✓</span>
          <span v-else>✕</span>
        </div>
        <h3>{{ modal.title }}</h3>
        <p>{{ modal.message }}</p>
        <button class="modal-close-btn" @click="modal.show = false">
          Entendido
        </button>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { listAllAulas, registrarAula } from "../servicios/aulasService";
import Icon from "../../seguridad/components/Icon.vue";

const nombreAula = ref("");
const aulas = ref([]);
const isSubmitting = ref(false);

const modal = ref({
  show: false,
  title: "",
  message: "",
  type: "",
});

const showModal = (title, message, type) => {
  modal.value = { show: true, title, message, type };
};

const handleRegister = async () => {
  if (!nombreAula.value.trim()) {
    showModal(
      "Campo vacío",
      "Por favor, ingresa un nombre para el aula.",
      "error",
    );
    return;
  }

  isSubmitting.value = true;

  try {
    const payload = { nombre: nombreAula.value.trim() };
    const response = await registrarAula(payload);

    if (response && response.exito !== false) {
      showModal(
        "¡Registro Exitoso!",
        `El aula ${nombreAula.value} ha sido guardada.`,
        "success",
      );
      nombreAula.value = "";
      await fetchAulas();
    } else {
      showModal(
        "No se pudo registrar",
        response.mensaje || "Error inesperado",
        "error",
      );
    }
  } catch (error) {
    showModal("Error de conexión", "Servidor no disponible", "error");
  } finally {
    isSubmitting.value = false;
  }
};

const fetchAulas = async () => {
  try {
    const response = await listAllAulas();
    if (response && response.exito) {
      aulas.value = response.data;
    }
  } catch (error) {
    console.error("Error al listar aulas:", error);
  }
};

onMounted(() => fetchAulas());
</script>

<style scoped>
.titles {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-1);
  margin-bottom: var(--space-6);
}

.titles h1 {
  font-size: var(--text-h1);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.subtitle {
  font-size: var(--text-body);
  color: var(--color-text-muted);
}

.main-card {
  padding: var(--space-6);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}

.main-card > p {
  margin-bottom: 6px;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.main-card h2 {
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
  font-size: var(--text-h3);
  font-weight: 600;
  color: var(--color-text);
}

.register-container {
  display: flex;
  gap: var(--space-3);
  align-items: center;
  max-width: 640px;
}

.new-aula {
  flex: 1;
  height: 40px;
  padding: 0 var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text);
  box-shadow: var(--shadow-xs);
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}

.new-aula:focus {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.new-aula:disabled {
  background: var(--color-surface-muted);
}

.aulas-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-4);
}

.single-aula {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  min-height: 128px;
  padding: var(--space-4);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  transition: border-color var(--transition), box-shadow var(--transition);
}

.single-aula:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-sm);
}

.single-aula :deep(svg) {
  width: 28px;
  height: 28px;
  display: block;
}

.single-aula > :first-child {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  background: var(--color-primary-soft);
}

.single-aula p {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  text-align: center;
}

.registrar {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 40px;
  padding: 0 var(--space-5);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition), opacity var(--transition);
}

.registrar:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.registrar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.loading-content {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-radius: 50%;
  border-top-color: var(--color-text-inverse);
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

.modal-content {
  width: 100%;
  max-width: 400px;
  background: var(--color-surface);
  padding: var(--space-8) var(--space-6) var(--space-6);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.modal-icon-circle {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto var(--space-4);
  font-size: 1.25rem;
  font-weight: 700;
}

.modal-content h3 {
  font-size: var(--text-h2);
  font-weight: 600;
  margin-bottom: var(--space-2);
}

.success .modal-icon-circle {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.success h3 {
  color: var(--color-text);
}

.error .modal-icon-circle {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.error h3 {
  color: var(--color-text);
}

.modal-content p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--space-6);
  line-height: 1.5;
}

.modal-close-btn {
  width: 100%;
  min-height: 40px;
  border: none;
  border-radius: var(--radius-md);
  background: var(--color-primary);
  color: var(--color-text-inverse);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition);
}

.modal-close-btn:hover {
  background: var(--color-primary-hover);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--transition);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .main-card {
    padding: var(--space-4);
  }

  .register-container {
    flex-direction: column;
    align-items: stretch;
  }

  .new-aula,
  .registrar {
    width: 100%;
  }

  .aulas-cards {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }

  .modal-content {
    padding: var(--space-6) var(--space-5) var(--space-5);
    max-height: 90vh;
    max-height: 90dvh;
    overflow-y: auto;
  }
}
</style>
