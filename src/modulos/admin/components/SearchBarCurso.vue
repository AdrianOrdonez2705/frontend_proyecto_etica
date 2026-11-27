<template>
  <div class="search-bar">
    <Icon iconName="search" iconColor="var(--color-text-muted)" />
    <input
      type="text"
      class="search-box"
      placeholder="Buscar..."
      v-model="search"
      @input="emitSearch"
    />
  </div>
</template>

<script setup>
import { ref } from "vue";
import Icon from "../../seguridad/components/Icon.vue";

const emit = defineEmits(["update:search"]);

const search = ref("");

const emitSearch = () => {
  emit("update:search", search.value);
};
</script>

<style scoped>
.search-bar {
  display: flex;
  flex-direction: row;
  flex: 1;
  align-items: center;
  gap: var(--space-2);
  max-width: 420px;
  height: 40px;
  padding: 0 var(--space-3);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
  transition: border-color var(--transition), box-shadow var(--transition);
}

.search-bar:focus-within {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.search-bar :deep(svg) {
  width: 18px;
  height: 18px;
  display: block;
}

.search-box {
  flex: 1;
  min-width: 0;
  height: 100%;
  background: transparent;
  border: none;
  font-size: var(--text-sm);
  color: var(--color-text);
  outline: none;
}

.search-box:focus-visible {
  box-shadow: none;
}
</style>
