<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <div class="top">
        <h2>Materias culminadas</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </div>

      <div class="cards-container">
        <CursoEstadoCard
          v-for="curso in materias"
          :key="curso.id_materia + '-' + (curso.id_inscripcion || '')"
          :curso="curso"
          @view="$emit('view', curso)"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import CursoEstadoCard from "./CursoEstadoCard.vue";

defineProps({
  materias: {
    type: Array,
    default: () => [],
  },
});

defineEmits(["close", "view"]);
</script>

<style scoped>
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
  width: 100%;
  max-width: 1200px;
  max-height: 85vh;
  max-height: 85dvh;
  overflow-y: auto;
  padding: var(--space-6);
  background: var(--color-bg);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  padding-bottom: var(--space-5);
  margin-bottom: var(--space-6);
  border-bottom: 1px solid var(--color-border);
}

.top h2 {
  font-size: var(--text-h2);
  font-weight: 600;
  color: var(--color-text);
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--radius-md);
  background: transparent;
  font-size: 24px;
  line-height: 1;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition);
}

.close-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.cards-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: var(--space-5);
}

@media (max-width: 768px) {
  .modal-content {
    max-height: 90vh;
    max-height: 90dvh;
    padding: var(--space-4);
  }

  .cards-container {
    gap: var(--space-4);
  }
}
</style>
