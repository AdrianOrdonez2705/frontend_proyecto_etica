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
  margin: 10px 0px;
  padding: 1rem;
  border-radius: 5px;
  background-color: white;
  box-shadow: 10px 10px 12px 10px rgba(0, 0, 0, 0.05);
}

.teacher-data {
  display: flex;
  flex-direction: column;
  flex: 8;
}

.teacher-details {
  color: #666;
}

.action-group {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 5px;
  flex: 2;
  flex-shrink: 0;
}

.action {
  cursor: pointer;
  min-width: 35%;
  height: 80%;
  min-height: 40px;
  border: none;
  border-radius: 5px;
  background-color: transparent;
  color: black;
}

.action:hover {
  background-color: #eee;
}

@media (max-width: 768px) {
  .card {
    flex-wrap: wrap;
    gap: 10px;
    padding: 0.85rem;
  }

  .teacher-data {
    flex: 1 1 100%;
    min-width: 0;
  }

  .action-group {
    flex: 1 1 100%;
    justify-content: flex-end;
  }

  .action {
    min-width: 48px;
    height: 48px;
  }
}
</style>
