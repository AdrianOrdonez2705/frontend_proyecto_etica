<template>
  <div class="admin-container">
    <Sidebar />

    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Sidebar from "../modulos/admin/components/Sidebar.vue";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();

onMounted(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    router.replace("/login");
  }
});
</script>

<style scoped>
.admin-container {
  display: flex;
  height: 100vh;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  background: var(--color-bg);
}

.content {
  flex: 1;
  min-width: 0;
  height: 100%;
  padding: var(--space-8);
  background: var(--color-bg);
  overflow-y: auto;
  overflow-x: hidden;
}

@media (max-width: 1024px) {
  .content {
    padding: var(--space-6);
  }
}

@media (max-width: 768px) {
  .content {
    padding: var(--space-4);
    padding-top: 72px;
  }
}
</style>
