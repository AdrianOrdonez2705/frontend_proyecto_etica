<template>
  <div class="sin-acceso">
    <h2>Sin acceso</h2>
    <p>No tienes permiso para ver esta pantalla.</p>
    <div class="form-actions">
      <button @click="volver">Volver</button>
      <button @click="salir">Ir al login</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

function volver() {
  router.back();
}

function salir() {
  localStorage.clear();
  router.push("/login");
}
</script>

<style scoped>
.sin-acceso {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  gap: 1rem;
}
.form-actions {
  display: flex;
  gap: 0.75rem;
}
.form-actions button {
  background: #004d66;
  color: white;
  padding: 0.7rem 1.4rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

@media (max-width: 480px) {
  .form-actions {
    flex-direction: column;
    width: 100%;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
