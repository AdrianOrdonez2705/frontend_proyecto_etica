<template>
  <div v-if="visible" class="modal-backdrop">
    <div class="modal-container error-modal">
      <h2>Ocurrió un error</h2>
      <p>{{ message }}</p>
      <button @click="closeModal">Aceptar</button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

const props = defineProps({
  message: { type: String, default: "Ha ocurrido un error" },
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(["close"]);

function closeModal() {
  emit("close");
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: var(--color-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-4);
  z-index: 1000;
}

.modal-container {
  width: 100%;
  max-width: 420px;
  background: var(--color-surface);
  padding: var(--space-8) var(--space-6) var(--space-6);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  text-align: center;
}

.modal-container h2 {
  font-size: var(--text-h2);
  font-weight: 600;
  color: var(--color-danger);
  margin-bottom: var(--space-2);
}

.modal-container p {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.modal-container button {
  width: 100%;
  min-height: 40px;
  margin-top: var(--space-6);
  padding: 0 var(--space-4);
  background-color: var(--color-danger);
  color: var(--color-text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition);
}

.modal-container button:hover {
  background-color: var(--color-danger-hover);
}

@media (max-width: 768px) {
  .modal-container {
    padding: var(--space-6) var(--space-5) var(--space-5);
  }
}
</style>
