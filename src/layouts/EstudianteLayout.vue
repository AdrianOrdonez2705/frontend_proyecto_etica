<template>
  <div class="admin-container">
    <Sidebar />

    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Sidebar from "../modulos/estudiantes/components/Sidebar.vue";
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
}

.content {
  flex: 1;
  min-width: 0;
  background: #f5f6f7;
  overflow-y: auto;
  overflow-x: hidden;
  width: 100%;
}

@media (max-width: 1024px) {
  .content {
    padding: 28px 24px;
  }
}

@media (max-width: 768px) {
  .content {
    padding: 16px;
    padding-top: 76px;
  }
}
</style>
