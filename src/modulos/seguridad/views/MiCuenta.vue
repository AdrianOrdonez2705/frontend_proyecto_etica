<template>
  <div>
    <h2>Mi cuenta</h2>
    <p class="subtitle">Cambiar mi contraseña</p>

    <div class="form-card">
      <form @submit.prevent="guardar" autocomplete="off">
        <div class="grid">
          <div>
            <label>Contraseña actual</label>
            <input type="password" v-model="form.actual" />
          </div>
          <div></div>
          <div>
            <label>Contraseña nueva</label>
            <input type="password" v-model="form.nueva" />
          </div>
          <div>
            <label>Confirmar contraseña nueva</label>
            <input type="password" v-model="form.confirmar" />
          </div>
        </div>

        <p class="politica">
          Mínimo 14 caracteres, al menos una mayúscula, una minúscula, un
          número y un carácter especial (!@#$%^&*).
        </p>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="exito" class="exito">{{ exito }}</p>

        <div class="form-actions">
          <button type="submit" :disabled="cargando">
            {{ cargando ? "Guardando..." : "Cambiar contraseña" }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import authService from "../servicios/AuthServicio";

const form = ref({ actual: "", nueva: "", confirmar: "" });
const error = ref("");
const exito = ref("");
const cargando = ref(false);

async function guardar() {
  error.value = "";
  exito.value = "";

  if (form.value.nueva !== form.value.confirmar) {
    error.value = "La confirmación no coincide";
    return;
  }

  cargando.value = true;
  try {
    const response = await authService.cambiarContrasenia(
      form.value.actual,
      form.value.nueva,
    );
    if (response.data.exito) {
      exito.value = response.data.mensaje || "Contraseña actualizada";
      form.value = { actual: "", nueva: "", confirmar: "" };
    } else {
      error.value = response.data.mensaje || "No se pudo actualizar";
    }
  } catch (err) {
    const datos = err.response?.data;
    error.value =
      (datos?.errores && datos.errores.join(". ")) ||
      datos?.mensaje ||
      "Error de conexión con el servidor";
  } finally {
    cargando.value = false;
  }
}
</script>

<style scoped>
.subtitle {
  color: #555;
  margin-bottom: 1.5rem;
}
.form-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  max-width: 640px;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}
.grid label {
  display: block;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.grid input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-sizing: border-box;
}
.politica {
  margin-top: 1rem;
  color: #555;
  font-size: 0.9rem;
}
.error {
  color: #b23b3b;
}
.exito {
  color: green;
}
.form-actions {
  margin-top: 1rem;
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
@media (max-width: 768px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .form-card {
    padding: 1rem;
  }
  .form-actions button {
    width: 100%;
  }
}
</style>
