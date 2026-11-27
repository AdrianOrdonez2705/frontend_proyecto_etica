<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <h2>Eliminar a: {{ user.nombre }}</h2>
      <div class="button-group">
        <button class="btn-cancelar" @click="$emit('cancelar')">
          Cancelar
        </button>
        <button class="btn-eliminar" @click="$emit('aceptar')">Eliminar</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({ user: { type: Object, required: true } });
defineEmits(["cancelar", "aceptar"]);
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background-color: var(--color-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-4);
  z-index: 1000;
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 440px;
  background-color: var(--color-surface);
  padding: var(--space-6);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.modal-content h2 {
  font-size: var(--text-h2);
  font-weight: 600;
  color: var(--color-text);
}

.button-group {
  margin-top: var(--space-6);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-3);
}

.btn-cancelar,
.btn-eliminar {
  min-height: 40px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition);
}

.btn-cancelar {
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-strong);
}

.btn-cancelar:hover {
  background-color: var(--color-surface-hover);
}

.btn-eliminar {
  background-color: var(--color-danger);
  color: var(--color-text-inverse);
  border: none;
}

.btn-eliminar:hover {
  background-color: var(--color-danger-hover);
}

@media (max-width: 768px) {
  .button-group {
    flex-direction: column-reverse;
  }

  .button-group button {
    width: 100%;
  }
}
</style>
