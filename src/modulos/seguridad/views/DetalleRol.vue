<template>
  <div>
    <router-link :to="{ name: 'gestionRoles' }" class="volver">
      Volver a roles
    </router-link>
    <h2>Detalle de rol</h2>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="exito" class="exito">{{ exito }}</p>

    <div v-if="rol" class="form-card">
      <div class="grid">
        <div><strong>Rol:</strong> {{ rol.rol }}</div>
        <div><strong>Base:</strong> {{ rol.base ? "Sí" : "No" }}</div>
        <div><strong>Usuarios:</strong> {{ rol.total_usuarios }}</div>
      </div>

      <form @submit.prevent="guardarDescripcion">
        <div>
          <label>Descripción</label>
          <input type="text" v-model="descripcion" />
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="cargando">Guardar descripción</button>
        </div>
      </form>

      <h3>Permisos adjuntos ({{ seleccionados.length }})</h3>
      <form @submit.prevent="guardarPermisos">
        <div v-for="grupo in grupos" :key="grupo.modulo" class="grupo">
          <h4>{{ grupo.modulo }}</h4>
          <label
            v-for="p in grupo.items"
            :key="p.codigo"
            class="check"
          >
            <input
              type="checkbox"
              :value="p.codigo"
              v-model="seleccionados"
            />
            <span>{{ p.codigo }} — {{ p.nombre }}</span>
          </label>
        </div>
        <div class="form-actions">
          <button type="submit" :disabled="cargando">
            Guardar permisos
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  verRol,
  editarRol,
  asignarPermisos,
  listarPermisos,
} from "../servicios/rolService";

const route = useRoute();
const rol = ref(null);
const descripcion = ref("");
const seleccionados = ref([]);
const permisos = ref([]);
const error = ref("");
const exito = ref("");
const cargando = ref(false);

const grupos = computed(() => {
  const mapa = {};
  permisos.value.forEach((p) => {
    if (!mapa[p.modulo]) mapa[p.modulo] = [];
    mapa[p.modulo].push(p);
  });
  return Object.keys(mapa)
    .sort()
    .map((modulo) => ({ modulo, items: mapa[modulo] }));
});

async function cargar() {
  error.value = "";
  try {
    const [resRol, resPermisos] = await Promise.all([
      verRol(route.params.id),
      listarPermisos(),
    ]);
    if (!resRol.exito) {
      error.value = resRol.mensaje || "Rol no encontrado";
      return;
    }
    rol.value = resRol.data;
    descripcion.value = resRol.data.descripcion || "";
    seleccionados.value = [...(resRol.data.permisos || [])];
    if (resPermisos.exito) permisos.value = resPermisos.data || [];
  } catch (err) {
    error.value =
      err.response?.data?.mensaje || "Error de conexión con el servidor";
  }
}

async function guardarDescripcion() {
  error.value = "";
  exito.value = "";
  cargando.value = true;
  try {
    const respuesta = await editarRol(route.params.id, {
      descripcion: descripcion.value,
    });
    if (respuesta.exito) {
      exito.value = "Descripción actualizada";
      rol.value.descripcion = respuesta.data.descripcion;
    } else {
      error.value = respuesta.mensaje || "No se pudo actualizar";
    }
  } catch (err) {
    error.value =
      err.response?.data?.mensaje || "Error de conexión con el servidor";
  } finally {
    cargando.value = false;
  }
}

async function guardarPermisos() {
  error.value = "";
  exito.value = "";
  cargando.value = true;
  try {
    const respuesta = await asignarPermisos(
      route.params.id,
      seleccionados.value,
    );
    if (respuesta.exito) {
      exito.value = "Permisos actualizados";
    } else {
      error.value = respuesta.mensaje || "No se pudo actualizar";
    }
  } catch (err) {
    error.value =
      err.response?.data?.mensaje || "Error de conexión con el servidor";
  } finally {
    cargando.value = false;
  }
}

onMounted(cargar);
</script>

<style scoped>
h2 {
  font-size: var(--text-h1);
  font-weight: 700;
  color: var(--color-text);
  letter-spacing: -0.01em;
  margin-bottom: var(--space-1);
}

h3 {
  font-size: var(--text-h3);
  font-weight: 600;
  color: var(--color-text);
  margin: var(--space-6) 0 var(--space-3);
}

h3:first-child {
  margin-top: 0;
}

.subtitle {
  font-size: var(--text-body);
  color: var(--color-text-muted);
  margin-bottom: var(--space-6);
}

.volver {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  margin-bottom: var(--space-4);
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-muted);
  text-decoration: none;
  transition: color var(--transition);
}

.volver:hover {
  color: var(--color-primary);
}

.volver + h2 {
  margin-bottom: var(--space-6);
}

.barra {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-5);
  flex-wrap: wrap;
}

.barra input,
.barra select {
  height: 40px;
  padding: 0 var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text);
  box-shadow: var(--shadow-xs);
}

.barra input {
  flex: 1;
  min-width: 220px;
  max-width: 420px;
}

.barra input:focus,
.barra select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.btn,
.btn-secundario,
.form-actions button,
.btn-desbloquear {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--transition), opacity var(--transition),
    border-color var(--transition);
}

.btn,
.form-actions button {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-primary);
}

.btn:hover,
.form-actions button:hover:not(:disabled) {
  background: var(--color-primary-hover);
  border-color: var(--color-primary-hover);
}

.barra .btn {
  margin-left: auto;
}

.barra .btn:first-child {
  margin-left: 0;
}

.btn-secundario {
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-strong);
}

.btn-secundario:hover {
  background: var(--color-surface-hover);
}

.btn-desbloquear {
  background: var(--color-surface);
  color: var(--color-danger);
  border: 1px solid var(--color-danger-border);
}

.btn-desbloquear:hover:not(:disabled) {
  background: var(--color-danger-soft);
}

.form-actions button:disabled,
.btn-desbloquear:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  margin-bottom: var(--space-5);
  box-shadow: var(--shadow-xs);
}

.grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4) var(--space-5);
  margin-bottom: var(--space-5);
}

.grid label,
.form-card label {
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.grid input,
.grid select,
.form-card input[type="text"],
.form-card input[type="password"],
.form-card input[type="number"],
.form-card textarea {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 400;
  color: var(--color-text);
  box-shadow: var(--shadow-xs);
  transition: border-color var(--transition), box-shadow var(--transition);
}

.grid input:focus,
.grid select:focus,
.form-card input:focus,
.form-card textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.grid input:disabled,
.grid input[readonly],
.form-card input:disabled,
.form-card input[readonly] {
  background: var(--color-surface-muted);
  color: var(--color-text-muted);
  box-shadow: none;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-5);
}

.tabla {
  width: 100%;
  border-collapse: collapse;
}

.tabla th {
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-muted);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  text-align: left;
  white-space: nowrap;
}

.tabla td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-align: left;
  vertical-align: middle;
}

.tabla td:first-child {
  color: var(--color-text);
  font-weight: 500;
}

.tabla tbody tr {
  transition: background-color var(--transition);
}

.tabla tbody tr:hover {
  background: var(--color-surface-hover);
}

.tabla tbody tr:last-child td {
  border-bottom: none;
}

.form-card:has(> .table-scroll) {
  padding: 0;
  overflow: hidden;
}

.form-card:has(> .table-scroll) > h3 {
  margin: 0;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.form-card:has(> .table-scroll) > p {
  padding: var(--space-5);
  border-top: 1px solid var(--color-border);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  text-align: center;
}

.acciones {
  display: flex;
  gap: var(--space-2);
}

.btn-pequeno {
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 var(--space-3);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition),
    border-color var(--transition);
}

.btn-pequeno:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.btn-pequeno.peligro {
  color: var(--color-danger);
  border-color: var(--color-danger-border);
}

.btn-pequeno.peligro:hover {
  background: var(--color-danger-soft);
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  border: 1px solid transparent;
  font-size: var(--text-xs);
  font-weight: 600;
}

.badge.bloqueado {
  background: var(--color-danger-soft);
  border-color: var(--color-danger-border);
  color: var(--color-danger);
}

.badge.activo {
  background: var(--color-success-soft);
  border-color: var(--color-success-border);
  color: var(--color-success);
}

.error,
.exito,
.advertencia {
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-4);
  border: 1px solid;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}

.error {
  background: var(--color-danger-soft);
  border-color: var(--color-danger-border);
  color: var(--color-danger);
}

.exito {
  background: var(--color-success-soft);
  border-color: var(--color-success-border);
  color: var(--color-success);
}

.advertencia {
  background: var(--color-warning-soft);
  border-color: var(--color-warning-border);
  color: var(--color-warning);
}

.preview {
  margin-top: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--color-primary-soft);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-primary);
}

.resultado {
  margin-top: var(--space-6);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
}

.resultado h3 {
  color: var(--color-success);
}

.grupo {
  padding: var(--space-4);
  margin-bottom: var(--space-3);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-muted);
}

.grupo h4 {
  margin-bottom: var(--space-3);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
}

.check {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-1) 0;
  font-size: var(--text-sm);
  font-weight: 400;
  color: var(--color-text-secondary);
  cursor: pointer;
}

.check input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
  cursor: pointer;
}

.estado-acceso,
.bloque {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  margin-bottom: var(--space-5);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface-muted);
}

.bloque {
  gap: var(--space-1);
  margin-bottom: var(--space-3);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.estado-acceso h3 {
  margin: 0;
}

.nota,
.ayuda,
.meta,
.politica {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.ayuda {
  margin-top: 6px;
  font-weight: 400;
}

.meta {
  margin-top: var(--space-4);
  padding-top: var(--space-4);
  border-top: 1px solid var(--color-border);
}

.politica {
  margin-top: var(--space-2);
  padding: var(--space-3) var(--space-4);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  line-height: 1.6;
}

.estado-cuenta {
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-5);
  background: var(--color-info-soft);
  border: 1px solid var(--color-info-border);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-info);
}

.estado-cuenta .advertencia {
  margin: 0;
}

.estado {
  padding: var(--space-6);
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 768px) {
  .barra {
    flex-direction: column;
    align-items: stretch;
  }

  .barra input {
    flex: none;
    min-width: 0;
    max-width: none;
    width: 100%;
  }

  .barra select,
  .btn,
  .btn-secundario {
    width: 100%;
  }

  .barra .btn {
    margin-left: 0;
  }

  .grid {
    grid-template-columns: 1fr;
  }

  .form-card {
    padding: var(--space-4);
  }

  .tabla {
    min-width: 720px;
  }

  .tabla td {
    white-space: nowrap;
  }

  .acciones {
    flex-wrap: wrap;
  }

  .form-actions {
    flex-direction: column;
  }

  .form-actions button,
  .form-actions .btn {
    width: 100%;
  }
}
</style>
