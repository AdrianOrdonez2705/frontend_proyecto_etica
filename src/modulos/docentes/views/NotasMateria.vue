<template>
  <div class="contenedor">
    <div class="icon-wrapper">
      <Icon
        to="../MateriasDocente"
        iconName="arrow_back"
        iconColor="var(--color-text-secondary)"
        message="Volver"
      />
    </div>
    <h2>Registro de notas</h2>
    <p class="subtitulo">
      Aquí puedes registrar nuevas notas de los estudiantes
    </p>

    <button
      class="btn-guardar"
      @click="guardarNotas"
      :disabled="!notasCompletas"
    >
      Guardar Notas
    </button>

    <button
      class="btn-certificados"
      @click="procesarEnvioCertificados"
      :disabled="cargandoCertificados || estudiantes.length === 0"
    >
      {{ cargandoCertificados ? "Enviando..." : "Enviar Certificados (PDF)" }}
    </button>

    <div class="tabla-wrapper">
      <table class="tabla">
        <thead>
          <tr>
            <th>Nombre Completo</th>

            <th v-for="i in cantidadEvaluaciones" :key="i">Nota {{ i }}</th>

            <th v-if="nuevaEvaluacion">Nueva Evaluación</th>

            <th>
              <button class="btn-agregar" @click="agregarEvaluacion">
                + Agregar Evaluación
              </button>
            </th>

            <th>Promedio</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="estudiante in estudiantes" :key="estudiante.id_estudiante">
            <td class="nombre">{{ estudiante.nombre }}</td>

            <td v-for="i in cantidadEvaluaciones" :key="i">
              {{ estudiante.notas?.[i - 1]?.calificacion ?? "-" }}
            </td>

            <td v-if="nuevaEvaluacion">
              <input
                type="number"
                v-model.number="
                  obtenerNuevaNota(estudiante.id_estudiante).nueva_nota
                "
                @input="calcularEstado(estudiante)"
                class="input-nota"
              />
            </td>

            <td></td>

            <td>
              <span class="estado">
                {{ calcularPromedio(estudiante) }}
              </span>
            </td>
            <td>
              <button class="btn-editar" @click="abrirModalEditar(estudiante)">
                Editar
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div v-if="mostrarModal" class="modal-overlay">
      <div class="modal">
        <h3>¿Estás seguro de guardar la evaluación?</h3>

        <p class="sub">Estas son las notas a registrar</p>

        <div class="lista-notas">
          <div
            v-for="nota in nuevasNotas"
            :key="nota.id_estudiante"
            class="item-nota"
          >
            <strong>{{ nota.nombre }}</strong> :
            {{ nota.nueva_nota }}
          </div>
        </div>

        <div class="botones">
          <button class="btn-cancelar" @click="cancelarGuardado">
            Cancelar
          </button>

          <button class="btn-confirmar" @click="confirmarGuardado">
            Confirmar
          </button>
        </div>
      </div>
    </div>
  </div>
  <div v-if="mostrarModalEditar" class="modal-overlay">
    <div class="modal">
      <h3>Editar notas de {{ estudianteSeleccionado.nombre }}</h3>

      <div class="lista-notas">
        <div
          v-for="(nota, index) in notasEditar"
          :key="nota.id_nota"
          class="item-nota"
        >
          Nota {{ index + 1 }}:
          <input
            type="number"
            v-model.number="nota.calificacion"
            class="input-nota"
          />
        </div>
      </div>

      <div class="botones">
        <button class="btn-cancelar" @click="cancelarEdicion">Cancelar</button>
        <button class="btn-confirmar" @click="guardarEdicion">Guardar</button>
      </div>
    </div>
  </div>
  <ModalExito
    :message="mensajeModal"
    :visible="mostrarExito"
    @close="mostrarExito = false"
  />

  <ModalError
    :message="mensajeModal"
    :visible="mostrarError"
    @close="mostrarError = false"
  />
</template>

<script setup>
import { ref, onMounted } from "vue";
import Icon from "../../seguridad/components/Icon.vue";
import { useRoute, useRouter } from "vue-router";
const mostrarModal = ref(false);
import ModalExito from "../../seguridad/components/ModalExito.vue";
import ModalError from "../../seguridad/components/ModalError.vue";
import { computed } from "vue";
import {
  listarNotasMateria,
  registrarNotas,
  editarNotas,
  enviarCertificadosLote,
} from "../services/DocenteService";
const route = useRoute();
const router = useRouter();
const mostrarError = ref(false);
const mostrarExito = ref(false);
const mensajeModal = ref("");
const mostrarModalEditar = ref(false);
const estudianteSeleccionado = ref(null);
const notasEditar = ref([]);
const cargandoCertificados = ref(false);
onMounted(async () => {
  const id_materia = route.params.id_materia;
  const response = await listarNotasMateria(id_materia);

  if (!response?.data?.data) {
    mensajeModal.value =
      response?.mensaje || "Error al obtener las notas de la materia";
    mostrarError.value = true;
    estudiantes.value = [];
    return;
  }

  estudiantes.value = response.data.data.map((e) => ({
    ...e,
    notas: e.notas ?? [],
    correo: e.correo,
  }));
});

async function procesarEnvioCertificados() {
  if (estudiantes.value.length === 0) return;

  cargandoCertificados.value = true;

  const id_materia = route.params.id_materia;

  const payload = {
    id_materia: id_materia,
    estudiantes: estudiantes.value.map((e) => ({
      id_estudiante: e.id_estudiante,
      nombre: e.nombre,
      correo: e.correo,
      promedio: calcularPromedio(e),
    })),
  };

  const response = await enviarCertificadosLote(payload);

  if (response.exito) {
    mensajeModal.value =
      response.mensaje || "Certificados enviados con éxito por correo.";
    mostrarExito.value = true;
  } else {
    mensajeModal.value =
      response.mensaje || "Hubo un problema al enviar los certificados.";
    mostrarError.value = true;
  }

  cargandoCertificados.value = false;
}

function abrirModalEditar(estudiante) {
  if (!estudiante.notas || estudiante.notas.length === 0) {
    mensajeModal.value =
      "Este estudiante todavía no tiene notas registradas para editar";
    mostrarError.value = true;
    return;
  }

  estudianteSeleccionado.value = estudiante;

  notasEditar.value = estudiante.notas.map((n) => ({
    id_nota: n.id_nota,
    calificacion: n.calificacion,
  }));

  mostrarModalEditar.value = true;
}
function cancelarEdicion() {
  mostrarModalEditar.value = false;
  estudianteSeleccionado.value = null;
  notasEditar.value = [];
}

async function guardarEdicion() {
  if (!estudianteSeleccionado.value) return;

  if (!notasEditar.value || notasEditar.value.length === 0) {
    mensajeModal.value = "No hay notas para editar";
    mostrarError.value = true;
    return;
  }

  const tieneNotasInvalidas = notasEditar.value.some(
    (nota) =>
      nota.calificacion === null ||
      nota.calificacion === undefined ||
      nota.calificacion === "" ||
      Number.isNaN(Number(nota.calificacion)),
  );

  if (tieneNotasInvalidas) {
    mensajeModal.value = "Todas las notas deben tener una calificación válida";
    mostrarError.value = true;
    return;
  }

  const id_materia = route.params.id_materia;
  const enviar = {
    id_materia,
    notas: [
      {
        id_estudiante: estudianteSeleccionado.value.id_estudiante,
        nombre: estudianteSeleccionado.value.nombre,
        nuevas_notas: notasEditar.value.map((n) => ({
          id_nota: n.id_nota,
          calificacion: Number(n.calificacion),
        })),
      },
    ],
  };

  console.log(JSON.stringify(enviar, null, 2));

  const response = await editarNotas(enviar);

  if (response.exito) {
    mensajeModal.value = response.mensaje || "Notas actualizadas correctamente";
    mostrarExito.value = true;

    estudianteSeleccionado.value.notas = notasEditar.value.map((n) => ({
      ...n,
      calificacion: Number(n.calificacion),
    }));

    cancelarEdicion();

    setTimeout(() => {
      router.go(0);
    }, 2000);

    return;
  }

  mensajeModal.value = response.mensaje || "Error al actualizar notas";
  mostrarError.value = true;
  console.log(response);
}

const notasCompletas = computed(() => {
  if (!nuevaEvaluacion.value) return false;

  return nuevasNotas.value.every(
    (nota) => nota.nueva_nota !== null && nota.nueva_nota !== "",
  );
});
function calcularPromedio(estudiante) {
  let notas = [...(estudiante.notas ?? []).map((n) => Number(n.calificacion))];
  const nueva = obtenerNuevaNota(estudiante.id_estudiante);

  if (nueva && nueva.nueva_nota !== null && nueva.nueva_nota !== undefined) {
    notas.push(Number(nueva.nueva_nota));
  }

  if (notas.length === 0) return "-";

  const suma = notas.reduce((a, b) => a + Number(b), 0);
  return Math.round(suma / notas.length);
}

const nuevaEvaluacion = ref(false);

const nuevasNotas = ref([]);

const estudiantes = ref([]);

const cantidadEvaluaciones = computed(() => {
  if (estudiantes.value.length === 0) return 1;

  const maxNotas = Math.max(
    ...estudiantes.value.map((e) => e.notas?.length ?? 0),
    1,
  );

  return maxNotas;
});

function calcularEstado(estudiante) {
  let notas = [...(estudiante.notas ?? []).map((n) => Number(n.calificacion))];

  const nueva = obtenerNuevaNota(estudiante.id_estudiante);

  if (
    nueva &&
    nueva.nueva_nota !== null &&
    nueva.nueva_nota !== undefined &&
    nueva.nueva_nota !== ""
  ) {
    notas.push(Number(nueva.nueva_nota));
  }

  if (notas.length === 0) {
    estudiante.estado = null;
    return;
  }

  const suma = notas.reduce((a, b) => a + Number(b), 0);
  const promedio = suma / notas.length;

  estudiante.estado = promedio >= 51 ? "APROBADO" : "REPROBADO";
}

function agregarEvaluacion() {
  nuevaEvaluacion.value = true;

  nuevasNotas.value = estudiantes.value.map((e) => ({
    id_estudiante: e.id_estudiante,
    nombre: e.nombre,
    correo: e.correo,
    nueva_nota: null,
  }));
}
function obtenerNuevaNota(id_estudiante) {
  return nuevasNotas.value.find((n) => n.id_estudiante === id_estudiante);
}

function guardarNotas() {
  mostrarModal.value = true;
}

async function confirmarGuardado() {
  const id_materia = route.params.id_materia;

  const hayNotasInvalidas = nuevasNotas.value.some(
    (nota) =>
      nota.nueva_nota === null ||
      nota.nueva_nota === undefined ||
      nota.nueva_nota === "" ||
      Number.isNaN(Number(nota.nueva_nota)),
  );

  if (hayNotasInvalidas) {
    mensajeModal.value = "Debes completar todas las nuevas notas";
    mostrarError.value = true;
    mostrarModal.value = false;
    return;
  }

  const enviar = {
    id_materia,
    notas: nuevasNotas.value.map((n) => ({
      id_estudiante: n.id_estudiante,
      nombre: n.nombre,
      nueva_nota: Number(n.nueva_nota),
    })),
  };

  console.log(JSON.stringify(enviar, null, 2));
  mostrarModal.value = false;

  const response = await registrarNotas(enviar);

  if (response.exito) {
    mensajeModal.value = response.mensaje || "Notas correctamente registradas";
    mostrarExito.value = true;

    setTimeout(() => {
      router.go(0);
    }, 3000);

    return;
  }

  mensajeModal.value = response.mensaje || "Error al registrar notas";
  mostrarError.value = true;
  console.log(response);
}

function cancelarGuardado() {
  mostrarModal.value = false;
}
</script>

<style scoped>
.contenedor {
  padding: 0;
}

.contenedor h2 {
  font-size: var(--text-h1);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text);
  margin-bottom: var(--space-1);
}

.subtitulo {
  font-size: var(--text-body);
  color: var(--color-text-muted);
}

.icon-wrapper {
  display: inline-flex;
  align-items: center;
  margin-bottom: var(--space-4);
  margin-left: calc(var(--space-2) * -1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: background-color var(--transition);
}

.icon-wrapper:hover {
  background-color: var(--color-surface-hover);
}

.icon-wrapper :deep(.icon-group) {
  align-items: center;
}

.icon-wrapper :deep(svg) {
  width: 18px;
  height: 18px;
  display: block;
}

.btn-guardar,
.btn-certificados,
.btn-cancelar,
.btn-confirmar {
  min-height: 40px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition), opacity var(--transition);
}

.btn-guardar {
  margin: var(--space-6) var(--space-3) var(--space-5) 0;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-primary);
}

.btn-guardar:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.btn-certificados {
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-strong);
}

.btn-certificados:hover:not(:disabled) {
  background: var(--color-surface-hover);
}

.btn-guardar:disabled,
.btn-certificados:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.tabla-wrapper {
  width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}

.tabla {
  width: 100%;
  min-width: 700px;
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
  text-align: center;
  white-space: nowrap;
}

.tabla td {
  padding: var(--space-3) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.tabla th:first-child {
  text-align: left;
}

.tabla tbody tr:last-child td {
  border-bottom: none;
}

.tabla tbody tr:hover {
  background: var(--color-surface-hover);
}

.nombre {
  text-align: left;
  color: var(--color-text) !important;
  font-weight: 500;
}

.input-nota {
  width: 72px;
  height: 32px;
  padding: 0 var(--space-2);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text);
  text-align: center;
}

.input-nota:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.btn-agregar {
  min-height: 30px;
  padding: 0 var(--space-3);
  background: var(--color-surface);
  color: var(--color-primary);
  border: 1px dashed var(--color-primary-border);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 600;
  text-transform: none;
  letter-spacing: 0;
  cursor: pointer;
  transition: background-color var(--transition);
}

.btn-agregar:hover {
  background: var(--color-primary-soft);
}

.estado {
  display: inline-flex;
  padding: 2px var(--space-3);
  border-radius: var(--radius-full);
  background: var(--color-surface-hover);
  font-weight: 700;
  color: var(--color-text);
}

.aprobado {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.reprobado {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.btn-editar {
  min-height: 32px;
  padding: 0 var(--space-3);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--text-xs);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition);
}

.btn-editar:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-4);
  z-index: 1000;
}

.modal {
  width: 100%;
  max-width: 440px;
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--space-6);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.modal h3 {
  margin-bottom: var(--space-1);
  font-size: var(--text-h2);
  font-weight: 600;
  color: var(--color-text);
}

.sub {
  margin-bottom: var(--space-4);
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.lista-notas {
  max-height: 240px;
  overflow-y: auto;
  margin: var(--space-4) 0 var(--space-6);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.item-nota {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-3);
  padding: var(--space-2) var(--space-4);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.item-nota:last-child {
  border-bottom: none;
}

.item-nota strong {
  font-weight: 500;
  color: var(--color-text);
}

.botones {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
}

.btn-cancelar {
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-strong);
}

.btn-cancelar:hover {
  background: var(--color-surface-hover);
}

.btn-confirmar {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-primary);
}

.btn-confirmar:hover {
  background: var(--color-primary-hover);
}

@media (max-width: 768px) {
  .btn-guardar,
  .btn-certificados {
    width: 100%;
  }

  .btn-guardar {
    margin: var(--space-5) 0 var(--space-3);
  }

  .btn-certificados {
    margin-bottom: var(--space-5);
  }

  .modal {
    padding: var(--space-5) var(--space-4);
  }

  .botones {
    flex-direction: column-reverse;
  }

  .botones button {
    width: 100%;
  }
}
</style>
