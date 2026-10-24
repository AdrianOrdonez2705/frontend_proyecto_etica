<template>
  <div>
    <h2>Catálogo de permisos</h2>
    <p class="subtitle">
      Solo lectura. Los permisos se crean únicamente por base de datos.
    </p>

    <div class="barra">
      <input
        type="text"
        v-model="busqueda"
        placeholder="Buscar por código o nombre"
      />
    </div>

    <p v-if="error" class="error">{{ error }}</p>

    <div
      v-for="grupo in gruposFiltrados"
      :key="grupo.modulo"
      class="form-card"
    >
      <h3>{{ grupo.modulo }} ({{ grupo.items.length }})</h3>
      <div class="table-scroll">
        <table class="tabla">
          <thead>
            <tr>
              <th>Código</th>
              <th>Nombre</th>
              <th>Descripción</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in grupo.items" :key="p.codigo">
              <td>{{ p.codigo }}</td>
              <td>{{ p.nombre }}</td>
              <td>{{ p.descripcion }}</td>
            </tr>
          </tbody>
      </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { listarPermisos } from "../servicios/rolService";

const permisos = ref([]);
const busqueda = ref("");
const error = ref("");

const gruposFiltrados = computed(() => {
  const texto = busqueda.value.trim().toLowerCase();
  const mapa = {};
  permisos.value.forEach((p) => {
    const juntado = (p.codigo + " " + p.nombre).toLowerCase();
    if (texto && !juntado.includes(texto)) return;
    if (!mapa[p.modulo]) mapa[p.modulo] = [];
    mapa[p.modulo].push(p);
  });
  return Object.keys(mapa)
    .sort()
    .map((modulo) => ({ modulo, items: mapa[modulo] }));
});

async function cargar() {
  try {
    const respuesta = await listarPermisos();
    if (respuesta.exito) {
      permisos.value = respuesta.data || [];
    } else {
      error.value = respuesta.mensaje || "No se pudo listar permisos";
    }
  } catch (err) {
    error.value =
      err.response?.data?.mensaje || "Error de conexión con el servidor";
  }
}

onMounted(cargar);
</script>

<style scoped>
.subtitle {
  color: #555;
  margin-bottom: 1.5rem;
}
.barra {
  margin-bottom: 1rem;
}
.barra input {
  width: 100%;
  max-width: 420px;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  box-sizing: border-box;
}
.form-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 1rem;
}
.form-card h3 {
  margin-top: 0;
  color: #004d66;
}
.tabla {
  width: 100%;
  border-collapse: collapse;
}
.tabla th,
.tabla td {
  padding: 0.6rem;
  border-bottom: 1px solid #eee;
  text-align: left;
}
.error {
  color: #b23b3b;
}

.table-scroll {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

@media (max-width: 768px) {
  .barra input {
    max-width: 100%;
  }

  .form-card {
    padding: 1rem;
  }

  .tabla {
    min-width: 520px;
  }

  .tabla th,
  .tabla td {
    white-space: nowrap;
  }
}
</style>
