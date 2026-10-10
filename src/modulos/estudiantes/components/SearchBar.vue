<template>
  <div class="search-bar">
    <Icon iconName="search" iconColor="#666" />
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
  align-items: center;
  gap: 10px;
  background-color: #eee;
  border: 2px solid transparent;
  border-radius: 50px;
  padding: 8px 16px;
  transition: all 0.3s ease;

  width: 100%;
  max-width: 100%;
}

.search-bar:focus-within {
  background-color: #fff;
  border-color: #5fa8a8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-box {
  flex: 1;
  background: transparent;
  border: none;

  font-size: 16px;
  outline: none;
  color: #333;
  width: 100%;
}

.search-box::placeholder {
  color: #999;
}

@media (min-width: 768px) {
  .search-bar {
    max-width: 400px;
    padding: 6px 14px;
  }

  .search-box {
    font-size: 14px;
  }
}
</style>
