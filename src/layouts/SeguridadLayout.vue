<template>
  <div class="admin-container">
    <Sidebar />

    <div class="content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import Sidebar from "../modulos/seguridad/components/Sidebar.vue";
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
  height: 100%;
  width: 100%;
  min-width: 0;
}

.content {
  height: 100%;
  flex: 1;
  min-width: 0;
  padding: 40px;
  background: #f5f6f7;
  overflow-y: auto;
  overflow-x: hidden;
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
