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
  min-height: 70vh;
  gap: var(--space-2);
  padding: var(--space-6);
  text-align: center;
}

.sin-acceso h2 {
  font-size: var(--text-h1);
  font-weight: 700;
  color: var(--color-text);
}

.sin-acceso p {
  font-size: var(--text-body);
  color: var(--color-text-muted);
}

.form-actions {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-5);
}

.form-actions button {
  min-height: 40px;
  padding: 0 var(--space-5);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-strong);
  transition: background-color var(--transition);
}

.form-actions button:hover {
  background: var(--color-surface-hover);
}

.form-actions button:last-child {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}

.form-actions button:last-child:hover {
  background: var(--color-primary-hover);
}

@media (max-width: 480px) {
  .form-actions {
    flex-direction: column-reverse;
    width: 100%;
  }

  .form-actions button {
    width: 100%;
  }
}
</style>
