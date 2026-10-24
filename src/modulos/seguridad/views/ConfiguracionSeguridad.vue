<template>
  <div>
    <h2>Configuración de seguridad</h2>
    <p class="subtitle">Vigencia e historial de contraseñas</p>

    <div class="form-card">
      <div v-if="cargando" class="estado">Cargando configuración...</div>

      <form v-else @submit.prevent="guardar" autocomplete="off">
        <div class="grid">
          <div>
            <label>Días de vigencia</label>
            <input
              v-model="form.dias_vida_contrasenia"
              type="number"
              min="1"
              max="365"
              :disabled="guardando"
            />
            <p class="ayuda">
              Días que puede usarse una contraseña antes de exigir el cambio.
            </p>
          </div>

          <div>
            <label>Contraseñas anteriores</label>
            <input
              v-model="form.historial_contrasenias"
              type="number"
              min="0"
              max="10"
              :disabled="guardando"
            />
            <p class="ayuda">
              Con 3 se bloquean la actual y las 3 anteriores. Con 0 solo se
              bloquea la actual.
            </p>
          </div>
        </div>

        <p class="advertencia">
          Reducir los días puede hacer que las contraseñas de los usuarios
          venzan de inmediato. Reducir el historial elimina hashes antiguos y no
          se pueden recuperar.
        </p>

        <p v-if="error" class="error">{{ error }}</p>
        <p v-if="exito" class="exito">{{ exito }}</p>

        <div class="form-actions">
          <button type="submit" :disabled="guardando">
            {{ guardando ? "Guardando..." : "Guardar cambios" }}
          </button>
        </div>

        <p v-if="meta" class="meta">
          <template v-if="meta.actualizado_en">
            Última actualización: {{ formatearFecha(meta.actualizado_en) }}
          </template>
          <template v-if="meta.actualizado_por">
            por {{ meta.actualizado_por }}
          </template>
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  obtenerConfiguracionSeguridad,
  actualizarConfiguracionSeguridad,
} from "../servicios/configuracionSeguridadService";

const form = ref({
  dias_vida_contrasenia: 90,
  historial_contrasenias: 3,
});
const meta = ref(null);
const error = ref("");
const exito = ref("");
const cargando = ref(false);
const guardando = ref(false);

function enteroValido(valor, min, max) {
  if (valor === "" || valor === null || valor === undefined) return false;
  const numero = Number(valor);
  return Number.isInteger(numero) && numero >= min && numero <= max;
}

function formatearFecha(iso) {
  if (!iso) return "";
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return "";
  return fecha.toLocaleString();
}

async function cargar() {
  cargando.value = true;
  error.value = "";
  try {
    const response = await obtenerConfiguracionSeguridad();
    if (response.exito) {
      form.value = {
        dias_vida_contrasenia: response.data.dias_vida_contrasenia,
        historial_contrasenias: response.data.historial_contrasenias,
      };
      meta.value = response.data;
    } else {
      error.value = response.mensaje || "No se pudo cargar la configuración";
    }
  } catch (err) {
    error.value =
      err.response?.data?.mensaje || "Error de conexión con el servidor";
  } finally {
    cargando.value = false;
  }
}

async function guardar() {
  error.value = "";
  exito.value = "";

  if (!enteroValido(form.value.dias_vida_contrasenia, 1, 365)) {
    error.value = "Los días de vigencia deben ser un entero entre 1 y 365";
    return;
  }

  if (!enteroValido(form.value.historial_contrasenias, 0, 10)) {
    error.value = "El historial debe ser un entero entre 0 y 10";
    return;
  }

  guardando.value = true;
  try {
    const response = await actualizarConfiguracionSeguridad({
      dias_vida_contrasenia: Number(form.value.dias_vida_contrasenia),
      historial_contrasenias: Number(form.value.historial_contrasenias),
    });

    if (response.exito) {
      form.value = {
        dias_vida_contrasenia: response.data.dias_vida_contrasenia,
        historial_contrasenias: response.data.historial_contrasenias,
      };
      meta.value = response.data;
      exito.value = response.mensaje || "Configuración actualizada";
    } else {
      error.value =
        (response.errores || []).join(". ") ||
        response.mensaje ||
        "No se pudo guardar";
    }
  } catch (err) {
    const datos = err.response?.data;
    error.value =
      (datos?.errores || []).join(". ") ||
      datos?.mensaje ||
      "Error de conexión con el servidor";
  } finally {
    guardando.value = false;
  }
}

onMounted(cargar);
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
  max-width: 720px;
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
.ayuda {
  margin-top: 0.4rem;
  color: #666;
  font-size: 0.85rem;
  line-height: 1.4;
}
.advertencia {
  margin-top: 1.25rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: #fff5e6;
  color: #8a5a00;
  font-size: 0.9rem;
  line-height: 1.5;
}
.estado {
  color: #555;
}
.error {
  margin-top: 1rem;
  color: #b23b3b;
}
.exito {
  margin-top: 1rem;
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
.form-actions button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.meta {
  margin-top: 1rem;
  color: #666;
  font-size: 0.85rem;
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
