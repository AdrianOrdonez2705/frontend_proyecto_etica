<template>
  <div class="wrapper">
    <h1>Oferta academica</h1>
    <div class="head">
      <div class="search">
        <SearchBar @update:search="searchTerm = $event" />
      </div>

      <select v-model="ofertaCarrera">
        <option :value="true">Mi carrera</option>
        <option :value="false">Extracurricular</option>
      </select>

      <button class="cart-button" @click="toggleCarrito">
        <Icon iconName="shopping_cart" />
        <span v-if="carrito.cursos.length > 0" class="badge">
          {{ carrito.cursos.length }}
        </span>
      </button>
    </div>

    <div class="container" v-if="ofertaCarrera">
      <OfertaCard
        v-for="curso in filteredCursos"
        :key="curso.id_materia"
        :curso="curso"
        @view="abrirModal(curso)"
      />
    </div>

    <div class="container" v-if="!ofertaCarrera">
      <OfertaCard
        v-for="curso in filteredCursosExtra"
        :key="curso.id_materia"
        :curso="curso"
        @view="abrirModal(curso)"
      />
    </div>

    <ModalOferta
      v-if="modalAbierto"
      :curso="selectedCurso"
      :noCumple="noCumplen"
      :motivosBloqueo="motivosBloqueo"
      :puedeInscribirse="puedeInscribirse"
      @close="modalAbierto = false"
    />

    <CarritoCursos v-if="mostrarCarrito" @cerrar="mostrarCarrito = false" />
  </div>
</template>

<script setup>
import OfertaCard from "../components/OfertaCard.vue";
import SearchBar from "../components/SearchBar.vue";
import { ref, computed, onMounted } from "vue";
import ModalOferta from "../components/ModalOferta.vue";
import { usarCarrito } from "../../../store/carrito";
import CarritoCursos from "../components/CarritoCursos.vue";
import Icon from "../../seguridad/components/Icon.vue";
import {
  listarOfertaCarrera,
  listarOfertaExtra,
  materiaOfertaDetalle,
  detalleExtracurricular,
} from "../services/estudianteService";

const carrito = usarCarrito();
const mostrarCarrito = ref(false);

const toggleCarrito = () => {
  mostrarCarrito.value = !mostrarCarrito.value;
};

const modalAbierto = ref(false);
const searchTerm = ref("");
const selectedCurso = ref(null);
const ofertaCarrera = ref(true);
const noCumplen = ref([]);
const motivosBloqueo = ref([]);
const puedeInscribirse = ref(true);

const cursos = ref([]);
const cursosExtracurriculares = ref([]);

const abrirModal = async (curso) => {
  noCumplen.value = [];
  motivosBloqueo.value = [];
  puedeInscribirse.value = true;

  try {
    let response;

    if (ofertaCarrera.value) {
      response = await materiaOfertaDetalle(curso.id_materia);
    } else {
      response = await detalleExtracurricular(curso.id_materia);
    }

    const data = response?.data?.data || {};

    if (Array.isArray(data.requisitos)) {
      data.requisitos.forEach((requisito) => {
        if (requisito.cumple === false) {
          noCumplen.value.push(requisito.id_materia);
        }
      });
    }

    motivosBloqueo.value = Array.isArray(data.motivos_bloqueo)
      ? data.motivos_bloqueo
      : [];

    puedeInscribirse.value = data.puede_inscribirse !== false;

    selectedCurso.value = {
      ...(data.materia || curso),
      requisitos: data.materia?.requisitos || curso.requisitos || [],
      puede_inscribirse: data.puede_inscribirse !== false,
      motivos_bloqueo: data.motivos_bloqueo || [],
    };

    modalAbierto.value = true;
  } catch (error) {
    console.log("Error al obtener detalle de materia:", error);

    selectedCurso.value = {
      ...curso,
      requisitos: curso.requisitos || [],
      puede_inscribirse: true,
      motivos_bloqueo: [],
    };
    modalAbierto.value = true;
  }
};

const filteredCursos = computed(() => {
  if (!searchTerm.value) return cursos.value;

  return cursos.value.filter(
    (curso) =>
      curso.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      curso.id_materia.toString().includes(searchTerm.value),
  );
});

const filteredCursosExtra = computed(() => {
  if (!searchTerm.value) return cursosExtracurriculares.value;

  return cursosExtracurriculares.value.filter(
    (curso) =>
      curso.nombre.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      curso.id_materia.toString().includes(searchTerm.value),
  );
});

onMounted(async () => {
  try {
    const response = await listarOfertaCarrera();
    cursos.value = response.data.data || [];

    const response2 = await listarOfertaExtra();
    cursosExtracurriculares.value = response2.data.data || [];
  } catch (error) {
    console.log("Error al obtener la oferta académica: ", error);
  }
  try {
    const response2 = await listarOfertaExtra();
    cursosExtracurriculares.value = response2.data.data || [];
  } catch (error) {
    console.log("Error al obtener la oferta académica: ", error);
  }
});
</script>

<style scoped>
.wrapper {
  padding: 0;
}

.wrapper h1 {
  margin-bottom: var(--space-6);
  font-size: var(--text-h1);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-4);
  margin-bottom: var(--space-6);
}

.title-row h1 {
  margin-bottom: 0;
}

.estado-academico-btn,
.volver-btn,
.archivadas-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  min-height: 40px;
  padding: 0 var(--space-4);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
  font-size: var(--text-sm);
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition);
}

.estado-academico-btn:hover,
.volver-btn:hover,
.archivadas-btn:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.estado-academico-btn {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-color: var(--color-primary);
}

.estado-academico-btn:hover {
  background: var(--color-primary-hover);
  color: var(--color-text-inverse);
}

.head {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-3);
}

.search {
  flex: 1;
  min-width: 0;
}

.filter-container {
  flex-shrink: 0;
}

.container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: var(--space-5);
  margin-top: var(--space-5);
}

select {
  height: 40px;
  min-width: 200px;
  padding: 0 36px 0 var(--space-3);
  background-color: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
  font-size: var(--text-sm);
  color: var(--color-text);
  cursor: pointer;
  transition: border-color var(--transition), box-shadow var(--transition);
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23667085' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 16px;
}

select:hover {
  border-color: var(--color-text-disabled);
}

select:focus {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
  outline: none;
}

option {
  font-size: var(--text-sm);
  background-color: var(--color-surface);
  color: var(--color-text);
}

.cart-button {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition);
}

.cart-button:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.cart-button :deep(svg) {
  width: 20px;
  height: 20px;
  display: block;
}

.badge {
  position: absolute;
  top: -6px;
  right: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 5px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: 2px solid var(--color-bg);
  border-radius: var(--radius-full);
  font-size: 11px;
  font-weight: 700;
}

@media (max-width: 768px) {
  .title-row {
    flex-direction: column;
    align-items: stretch;
  }

  .head {
    flex-direction: column;
    align-items: stretch;
  }

  .head :deep(.search-bar) {
    max-width: none;
  }

  .search,
  .filter-container,
  select,
  .archivadas-btn,
  .estado-academico-btn,
  .volver-btn {
    width: 100%;
  }

  .cart-button {
    width: 100%;
  }

  .container {
    gap: var(--space-4);
  }
}
</style>
