<template>
  <div class="card">
    <div class="teacher-data">
      <h3>{{ user.nombre }}</h3>
      <p class="teacher-details">{{ user.correo }}</p>
    </div>
    <div class="action-group">
      <button class="action" @click="$emit('edit')">
        <Icon iconName="edit" />
      </button>
      <button class="action" @click="$emit('delete')">
        <Icon iconName="trash" />
      </button>
    </div>
  </div>
</template>

<script setup>
import Icon from "./Icon.vue";

defineProps({ user: { type: Object, required: true } });
defineEmits(["edit", "delete"]);
</script>

<style scoped>
.card {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-4);
  margin: var(--space-3) 0;
  padding: var(--space-4) var(--space-5);
  border-radius: var(--radius-lg);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-xs);
  transition: border-color var(--transition), box-shadow var(--transition);
}

.card:hover {
  border-color: var(--color-border-strong);
  box-shadow: var(--shadow-sm);
}

.teacher-data {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.teacher-data h3 {
  font-size: var(--text-h3);
  font-weight: 600;
  color: var(--color-text);
}

.teacher-details {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.action-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  gap: var(--space-1);
  flex-shrink: 0;
}

.action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: var(--radius-md);
  background-color: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition);
}

.action :deep(svg) {
  width: 20px;
  height: 20px;
}

.action:hover {
  background-color: var(--color-surface-hover);
  color: var(--color-text);
}

.action:last-child:hover {
  background-color: var(--color-danger-soft);
  color: var(--color-danger);
}

@media (max-width: 768px) {
  .card {
    flex-wrap: wrap;
    gap: var(--space-2);
    padding: var(--space-4);
  }

  .teacher-data {
    flex: 1 1 100%;
  }

  .action-group {
    flex: 1 1 100%;
  }

  .action {
    width: 40px;
    height: 40px;
  }
}
</style>
