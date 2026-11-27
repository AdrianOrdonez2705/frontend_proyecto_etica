<template>
  <div class="contenedor">
    <h2>Registro de Asistencia</h2>
    <p class="subtitulo">
      Aquí puedes registrar las asistencias de los estudiantes
    </p>

    <div class="barra-acciones">
      <button class="btn-agregar-fecha" @click="abrirModalFecha">
        + Registrar Nueva Asistencia
      </button>
    </div>

    <div
      v-if="mostrarModalFecha"
      class="modal-overlay"
      @click.self="cerrarModalFecha"
    >
      <div class="modal-contenido">
        <h3>Registrar Nueva Fecha de Asistencia</h3>

        <div class="campo-fecha">
          <label>Seleccione la fecha:</label>
          <input
            type="date"
            v-model="nuevaFecha"
            :max="fechaActual"
            class="input-fecha"
          />
        </div>

        <div class="modal-acciones">
          <button class="btn-cancelar" @click="cerrarModalFecha">
            Cancelar
          </button>
          <button
            class="btn-confirmar"
            @click="confirmarNuevaFecha"
            :disabled="!nuevaFecha"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="mostrarModalConfirmacion"
      class="modal-overlay"
      @click.self="cerrarModalConfirmacion"
    >
      <div class="modal-contenido modal-confirmacion">
        <h3>Confirmar Registro de Asistencia</h3>

        <div class="mensaje-advertencia">
          Una vez guardada la asistencia, NO se podrá modificar
        </div>

        <div v-if="estudiantesSinMarcar.length > 0" class="lista-pendientes">
          <p><strong>Estudiantes sin asistencia marcada:</strong></p>
          <p class="nota">(Se les asignará FALTA por defecto)</p>
          <ul>
            <li v-for="est in estudiantesSinMarcar" :key="est.id_estudiante">
              {{ est.nombre }}
            </li>
          </ul>
        </div>

        <div v-else class="mensaje-exito">
          ✓ Todos los estudiantes tienen su asistencia marcada
        </div>

        <div class="fecha-confirmacion">
          <strong>Fecha a registrar:</strong>
          {{ formatearFecha(nuevaFechaActual) }}
        </div>

        <div class="modal-acciones">
          <button class="btn-cancelar" @click="cerrarModalConfirmacion">
            Cancelar
          </button>
          <button class="btn-confirmar-guardar" @click="confirmarGuardado">
            Sí, Guardar Asistencia
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="mostrarModalCancelar"
      class="modal-overlay"
      @click.self="cerrarModalCancelar"
    >
      <div class="modal-contenido modal-confirmacion">
        <h3>Cancelar Registro</h3>

        <div class="mensaje-advertencia">
          Se perderán todos los cambios no guardados
        </div>

        <div class="modal-acciones">
          <button class="btn-cancelar" @click="cerrarModalCancelar">
            Volver
          </button>
          <button class="btn-confirmar-guardar" @click="confirmarCancelacion">
            Sí, Cancelar
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="mostrarModalExito"
      class="modal-overlay"
      @click.self="cerrarModalExito"
    >
      <div class="modal-contenido modal-confirmacion">
        <h3>Registro Exitoso</h3>

        <div class="mensaje-exito">
          {{ mensajeExito }}
        </div>

        <div class="modal-acciones">
          <button class="btn-confirmar-guardar" @click="cerrarModalExito">
            Aceptar
          </button>
        </div>
      </div>
    </div>

    <div class="tabla-contenedor" v-if="tieneFechas">
      <table class="tabla">
        <thead>
          <tr>
            <th class="columna-fija nombre-col">Nombre del Estudiante</th>
            <th class="columna-fija porcentaje-col">% Asistencia</th>

            <th
              v-for="fecha in fechasOrdenadas"
              :key="fecha"
              class="fecha-col"
              :class="{
                'fecha-actual': fecha === nuevaFechaActual && modoRegistro,
              }"
            >
              <div class="encabezado-fecha">
                <span>{{ formatearFecha(fecha) }}</span>
                <span
                  v-if="fecha === nuevaFechaActual && modoRegistro"
                  class="badge-nuevo"
                >
                  Nuevo
                </span>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="estudiante in estudiantes" :key="estudiante.id_estudiante">
            <td class="columna-fija nombre">{{ estudiante.nombre }}</td>

            <td class="columna-fija porcentaje">
              <span
                class="porcentaje-valor"
                :class="{
                  alto: estudiante.porcentajeAsistencia >= 70,
                  bajo: estudiante.porcentajeAsistencia < 70,
                }"
              >
                {{ estudiante.porcentajeAsistencia }}%
              </span>
            </td>

            <td
              v-for="fecha in fechasOrdenadas"
              :key="fecha"
              class="asistencia-col"
            >
              <button
                v-if="fecha === nuevaFechaActual && modoRegistro"
                class="btn-estado"
                :class="{
                  presente: estudiante.asistenciasTemp[fecha] === true,
                  ausente: estudiante.asistenciasTemp[fecha] === false,
                  pendiente:
                    estudiante.asistenciasTemp[fecha] === undefined ||
                    estudiante.asistenciasTemp[fecha] === null,
                }"
                @click="cambiarAsistenciaTemp(estudiante, fecha)"
              >
                <span v-if="estudiante.asistenciasTemp[fecha] === true">✓</span>
                <span v-else-if="estudiante.asistenciasTemp[fecha] === false"
                  >✗</span
                >
                <span v-else class="pendiente">-</span>
              </button>

              <div v-else class="asistencia-lectura">
                <span
                  class="icono-asistencia"
                  :class="{
                    presente: estudiante.asistencias[fecha] === true,
                    ausente: estudiante.asistencias[fecha] === false,
                    'sin-registro':
                      estudiante.asistencias[fecha] === undefined ||
                      estudiante.asistencias[fecha] === null,
                  }"
                >
                  {{ obtenerIconoAsistencia(estudiante.asistencias[fecha]) }}
                </span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="sin-datos-mensaje">
      <p>No hay asistencias registradas para esta materia</p>
      <p class="subtitulo-mensaje">
        Haz clic en "Registrar Nueva Asistencia" para comenzar
      </p>
    </div>

    <div v-if="modoRegistro" class="acciones-finales">
      <button class="btn-cancelar" @click="cancelarRegistro">Cancelar</button>
      <button class="btn-guardar" @click="abrirModalConfirmacion">
        Guardar Asistencia
      </button>
    </div>
  </div>
</template>

<script setup>
import {
  obtenerHistorialMateria,
  registrarAsistenciaClase,
} from "../services/asistenciaService";
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const materiaId = route.params.id_materia;
const router = useRouter();

const estudiantes = ref([]);
const modoRegistro = ref(false);
const mostrarModalFecha = ref(false);
const mostrarModalConfirmacion = ref(false);
const mostrarModalCancelar = ref(false);
const mostrarModalExito = ref(false);
const mensajeExito = ref("");
const nuevaFecha = ref("");
const nuevaFechaActual = ref("");

const tieneFechas = computed(() => {
  return fechasOrdenadas.value.length > 0;
});

const todasLasFechas = computed(() => {
  const fechasSet = new Set();

  estudiantes.value.forEach((est) => {
    Object.keys(est.asistencias).forEach((fecha) => {
      if (
        fecha &&
        fecha !== "undefined" &&
        fecha !== "null" &&
        fecha.trim() !== ""
      ) {
        fechasSet.add(fecha);
      }
    });
  });
  return Array.from(fechasSet);
});

const fechasOrdenadas = computed(() => {
  const fechas = todasLasFechas.value.filter((fecha) => {
    return (
      fecha && fecha !== "undefined" && fecha !== "null" && fecha.trim() !== ""
    );
  });

  return fechas.sort((a, b) => {
    return new Date(b) - new Date(a);
  });
});

const estudiantesSinMarcar = computed(() => {
  if (!nuevaFechaActual.value) return [];

  return estudiantes.value.filter((est) => {
    const temp = est.asistenciasTemp[nuevaFechaActual.value];
    return temp === undefined || temp === null;
  });
});

const fechaActual = computed(() => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
});

const obtenerIconoAsistencia = (estado) => {
  if (estado === true) return "✓";
  if (estado === false) return "✗";
  return "-";
};

const formatearFecha = (fecha) => {
  if (!fecha || fecha === "undefined" || fecha === "null")
    return "Fecha inválida";
  const [year, month, day] = fecha.split("-");
  return `${day}/${month}/${year}`;
};

const calcularPorcentajes = () => {
  if (!estudiantes.value) return;

  estudiantes.value.forEach((est) => {
    const asistencias = Object.values(est.asistencias).filter(
      (val) => val !== undefined && val !== null,
    );
    const total = asistencias.length;
    if (total > 0) {
      const presentes = asistencias.filter((a) => a === true).length;
      est.porcentajeAsistencia = Math.round((presentes / total) * 100);
    } else {
      est.porcentajeAsistencia = 0;
    }
  });
};

const abrirModalFecha = () => {
  nuevaFecha.value = "";
  mostrarModalFecha.value = true;
};

const cerrarModalFecha = () => {
  mostrarModalFecha.value = false;
  nuevaFecha.value = "";
};

const confirmarNuevaFecha = () => {
  if (!nuevaFecha.value) return;

  if (todasLasFechas.value.includes(nuevaFecha.value)) {
    alert("Esta fecha ya ha sido registrada");
    return;
  }

  if (!modoRegistro.value) {
    modoRegistro.value = true;
  }

  nuevaFechaActual.value = nuevaFecha.value;

  estudiantes.value.forEach((est) => {
    est.asistencias[nuevaFecha.value] = null;
    est.asistenciasTemp[nuevaFecha.value] = null;
  });

  cerrarModalFecha();
};

const cambiarAsistenciaTemp = (estudiante, fecha) => {
  if (!modoRegistro.value || fecha !== nuevaFechaActual.value) return;

  const estadoActual = estudiante.asistenciasTemp[fecha];

  if (estadoActual === null || estadoActual === undefined) {
    estudiante.asistenciasTemp[fecha] = true;
  } else if (estadoActual === true) {
    estudiante.asistenciasTemp[fecha] = false;
  } else {
    estudiante.asistenciasTemp[fecha] = null;
  }
};

const abrirModalConfirmacion = () => {
  mostrarModalConfirmacion.value = true;
};

const cerrarModalConfirmacion = () => {
  mostrarModalConfirmacion.value = false;
};

const cerrarModalExito = () => {
  mostrarModalExito.value = false;
};

const confirmarGuardado = async () => {
  try {
    const asistenciasPayload = estudiantes.value.map((est) => {
      const temp = est.asistenciasTemp[nuevaFechaActual.value];
      const estado = temp === true ? true : false;

      return {
        ci: est.id_estudiante,
        estado: estado,
      };
    });

    const payload = {
      fecha: nuevaFechaActual.value,
      asistencias: asistenciasPayload,
    };

    const resp = await registrarAsistenciaClase(materiaId, payload);

    estudiantes.value.forEach((est) => {
      const temp = est.asistenciasTemp[nuevaFechaActual.value];
      est.asistencias[nuevaFechaActual.value] = temp === true ? true : false;
    });

    calcularPorcentajes();

    estudiantes.value.forEach((est) => {
      delete est.asistenciasTemp[nuevaFechaActual.value];
    });

    modoRegistro.value = false;
    nuevaFechaActual.value = "";

    mensajeExito.value = resp.mensaje || "Asistencia guardada correctamente";
    mostrarModalExito.value = true;

    cerrarModalConfirmacion();
  } catch (err) {
    console.error(err);
  }
};

const cancelarRegistro = () => {
  mostrarModalCancelar.value = true;
};

const cerrarModalCancelar = () => {
  mostrarModalCancelar.value = false;
};

const confirmarCancelacion = () => {
  estudiantes.value.forEach((est) => {
    delete est.asistenciasTemp[nuevaFechaActual.value];
    delete est.asistencias[nuevaFechaActual.value];
  });

  modoRegistro.value = false;
  nuevaFechaActual.value = "";
  mostrarModalCancelar.value = false;
};

onMounted(async () => {
  try {
    const resp = await obtenerHistorialMateria(materiaId);
    console.log("Historial de asistencias:", resp);
    const historial = resp.data;

    estudiantes.value = historial.map((est) => {
      const asistenciasObj = {};

      if (est.asistencias && Array.isArray(est.asistencias)) {
        est.asistencias.forEach((a) => {
          if (a.fecha && a.fecha !== "undefined" && a.fecha !== "null") {
            asistenciasObj[a.fecha] = a.estado;
          }
        });
      }

      return {
        id_estudiante: est.ci,
        nombre: est.nombre,
        asistencias: asistenciasObj,
        asistenciasTemp: {},
      };
    });

    calcularPorcentajes();
  } catch (err) {
    console.error("Error cargando historial:", err);
  }
});

watch(todasLasFechas, (nuevasFechas) => {
  console.log("Fechas actualizadas:", nuevasFechas);
});
</script>

<style scoped>
.contenedor {
  padding: 0;
}

.contenedor > h2 {
  margin-bottom: var(--space-1);
  font-size: var(--text-h1);
  font-weight: 700;
  letter-spacing: -0.01em;
  color: var(--color-text);
}

.subtitulo {
  margin-bottom: var(--space-6);
  font-size: var(--text-body);
  color: var(--color-text-muted);
}

.barra-acciones {
  margin-bottom: var(--space-5);
}

.btn-agregar-fecha,
.btn-guardar,
.btn-confirmar,
.btn-confirmar-guardar,
.btn-cancelar {
  min-height: 40px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition), opacity var(--transition);
}

.btn-agregar-fecha,
.btn-guardar,
.btn-confirmar,
.btn-confirmar-guardar {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-primary);
}

.btn-agregar-fecha:hover,
.btn-guardar:hover,
.btn-confirmar:hover:not(:disabled),
.btn-confirmar-guardar:hover {
  background: var(--color-primary-hover);
}

.btn-confirmar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancelar {
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-strong);
}

.btn-cancelar:hover {
  background: var(--color-surface-hover);
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

.modal-contenido {
  width: 100%;
  max-width: 480px;
  max-height: 90vh;
  overflow-y: auto;
  padding: var(--space-6);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
}

.modal-confirmacion {
  max-width: 540px;
}

.modal-contenido h3 {
  margin-bottom: var(--space-5);
  font-size: var(--text-h2);
  font-weight: 600;
  color: var(--color-text);
}

.campo-fecha {
  margin-bottom: var(--space-4);
}

.campo-fecha label {
  display: block;
  margin-bottom: 6px;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.input-fecha {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text);
  box-shadow: var(--shadow-xs);
}

.input-fecha:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.modal-acciones {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.mensaje-advertencia,
.mensaje-exito,
.fecha-confirmacion,
.lista-pendientes {
  margin-bottom: var(--space-4);
  padding: var(--space-3) var(--space-4);
  border: 1px solid;
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
}

.mensaje-advertencia {
  background: var(--color-warning-soft);
  border-color: var(--color-warning-border);
  color: var(--color-warning);
  font-weight: 500;
}

.mensaje-exito {
  background: var(--color-success-soft);
  border-color: var(--color-success-border);
  color: var(--color-success);
}

.fecha-confirmacion {
  background: var(--color-surface-muted);
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}

.fecha-confirmacion strong {
  font-weight: 600;
  color: var(--color-text);
}

.lista-pendientes {
  max-height: 220px;
  overflow-y: auto;
  background: var(--color-danger-soft);
  border-color: var(--color-danger-border);
  color: var(--color-text);
}

.lista-pendientes p {
  margin: 0;
}

.lista-pendientes strong {
  font-weight: 600;
}

.lista-pendientes .nota {
  margin-top: 2px;
  font-size: var(--text-xs);
  color: var(--color-danger);
}

.lista-pendientes ul {
  margin: var(--space-2) 0 0 var(--space-5);
  color: var(--color-text-secondary);
}

.tabla-contenedor {
  width: 100%;
  overflow-x: auto;
  margin: 0 0 var(--space-5);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}

.tabla {
  width: 100%;
  min-width: 800px;
  border-collapse: separate;
  border-spacing: 0;
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
}

.tabla tbody tr:last-child td {
  border-bottom: none;
}

.columna-fija {
  position: sticky;
  left: 0;
  z-index: 2;
  background: var(--color-surface);
  border-right: 1px solid var(--color-border);
}

.nombre-col {
  min-width: 250px;
  left: 0;
  background: var(--color-surface-muted);
  text-align: left !important;
}

.porcentaje-col {
  min-width: 120px;
  left: 250px;
  background: var(--color-surface-muted);
}

.nombre {
  min-width: 250px;
  left: 0;
  background: var(--color-surface);
  font-weight: 500;
  color: var(--color-text) !important;
  text-align: left !important;
}

.porcentaje {
  min-width: 120px;
  left: 250px;
  background: var(--color-surface);
}

.porcentaje-valor {
  display: inline-flex;
  padding: 2px var(--space-2);
  border-radius: var(--radius-full);
  font-size: var(--text-xs);
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.porcentaje-valor.alto {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.porcentaje-valor.bajo {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.fecha-col {
  min-width: 100px;
  background: var(--color-surface-muted);
}

.tabla th.fecha-actual {
  background: var(--color-primary-soft);
  color: var(--color-primary);
}

.encabezado-fecha {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
}

.badge-nuevo {
  padding: 1px 6px;
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border-radius: var(--radius-full);
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0;
  text-transform: none;
}

.asistencia-col {
  min-width: 100px;
}

.btn-estado {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  margin: 0 auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color var(--transition), border-color var(--transition),
    color var(--transition);
}

.btn-estado.presente {
  background: var(--color-success-soft);
  border-color: var(--color-success-border);
  color: var(--color-success);
}

.btn-estado.ausente {
  background: var(--color-danger-soft);
  border-color: var(--color-danger-border);
  color: var(--color-danger);
}

.btn-estado.pendiente {
  background: var(--color-surface-muted);
  border-color: var(--color-border-strong);
  color: var(--color-text-disabled);
}

.btn-estado:hover {
  border-color: var(--color-primary);
}

.asistencia-lectura {
  display: flex;
  justify-content: center;
  align-items: center;
}

.icono-asistencia {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  font-size: 14px;
  font-weight: 700;
}

.icono-asistencia.presente {
  background: var(--color-success-soft);
  color: var(--color-success);
}

.icono-asistencia.ausente {
  background: var(--color-danger-soft);
  color: var(--color-danger);
}

.icono-asistencia.sin-registro {
  background: var(--color-surface-hover);
  color: var(--color-text-muted);
}

.acciones-finales {
  display: flex;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-5);
}

.sin-datos-mensaje {
  padding: var(--space-12) var(--space-6);
  background: var(--color-surface);
  border: 1px dashed var(--color-border-strong);
  border-radius: var(--radius-lg);
  text-align: center;
}

.sin-datos-mensaje p {
  margin: 0;
  font-size: var(--text-body);
  font-weight: 500;
  color: var(--color-text);
}

.sin-datos-mensaje .subtitulo-mensaje {
  margin-top: var(--space-1);
  font-size: var(--text-sm);
  font-weight: 400;
  color: var(--color-text-muted);
}

@media (max-width: 768px) {
  .btn-agregar-fecha {
    width: 100%;
  }

  .modal-contenido {
    padding: var(--space-5) var(--space-4);
  }

  .modal-acciones {
    flex-direction: column-reverse;
  }

  .modal-acciones button {
    width: 100%;
  }

  .nombre-col,
  .nombre {
    min-width: 160px;
  }

  .porcentaje-col,
  .porcentaje {
    min-width: 90px;
    left: 160px;
  }

  .acciones-finales {
    flex-direction: column-reverse;
  }

  .acciones-finales button {
    width: 100%;
  }
}
</style>
