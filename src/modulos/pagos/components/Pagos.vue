<template>
  <div class="app-wrapper">
    <div class="layout">
      <aside class="sidebar">
        <div class="sidebar-top"></div>
      </aside>

      <main class="main-content">
        <div class="card">
          <h2 class="card-title">Datos para la factura</h2>

          <div class="form-group">
            <label class="form-label">NIT/CI</label>
            <input
              type="text"
              class="form-input"
              :class="{ 'input-error': errors.nitci }"
              placeholder=""
              v-model="form.nitci"
              @blur="validateField('nitci')"
            />
            <span class="error-msg" v-if="errors.nitci">{{
              errors.nitci
            }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Razón Social/Nombre</label>
            <input
              type="text"
              class="form-input"
              :class="{ 'input-error': errors.razonSocial }"
              placeholder=""
              v-model="form.razonSocial"
              @blur="validateField('razonSocial')"
            />
            <span class="error-msg" v-if="errors.razonSocial">{{
              errors.razonSocial
            }}</span>
          </div>

          <div class="form-group">
            <label class="form-label">Correo</label>
            <input
              type="text"
              class="form-input"
              :class="{ 'input-error': errors.correo }"
              placeholder=""
              v-model="form.correo"
              @blur="validateField('correo')"
            />
            <span class="error-msg" v-if="errors.correo">{{
              errors.correo
            }}</span>
          </div>

          <div class="payment-buttons">
            <button class="pay-btn visa-btn" @click="openModal('visa')">
              <span class="visa-text">VISA</span>
            </button>

            <button class="pay-btn qr-btn" @click="openModal('qr')">
              <div class="qr-icon">
                <svg
                  viewBox="0 0 100 100"
                  width="48"
                  height="48"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="5"
                    y="5"
                    width="35"
                    height="35"
                    rx="3"
                    fill="none"
                    stroke="black"
                    stroke-width="6"
                  />
                  <rect
                    x="15"
                    y="15"
                    width="15"
                    height="15"
                    rx="1"
                    fill="black"
                  />
                  <rect
                    x="60"
                    y="5"
                    width="35"
                    height="35"
                    rx="3"
                    fill="none"
                    stroke="black"
                    stroke-width="6"
                  />
                  <rect
                    x="70"
                    y="15"
                    width="15"
                    height="15"
                    rx="1"
                    fill="black"
                  />
                  <rect
                    x="5"
                    y="60"
                    width="35"
                    height="35"
                    rx="3"
                    fill="none"
                    stroke="black"
                    stroke-width="6"
                  />
                  <rect
                    x="15"
                    y="70"
                    width="15"
                    height="15"
                    rx="1"
                    fill="black"
                  />
                  <rect x="60" y="60" width="10" height="10" fill="black" />
                  <rect x="75" y="60" width="10" height="10" fill="black" />
                  <rect x="60" y="75" width="10" height="10" fill="black" />
                  <rect x="75" y="75" width="10" height="10" fill="black" />
                  <rect x="45" y="5" width="10" height="10" fill="black" />
                  <rect x="45" y="20" width="10" height="10" fill="black" />
                  <rect x="45" y="35" width="10" height="10" fill="black" />
                  <rect x="45" y="50" width="10" height="10" fill="black" />
                  <rect x="60" y="45" width="10" height="10" fill="black" />
                  <rect x="75" y="45" width="10" height="10" fill="black" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </main>

      <aside class="items-sidebar">
        <div class="items-sidebar-header">
          <span class="items-sidebar-title">Resumen de compra</span>
          <span class="items-count"
            >{{ items.length }} ítem{{ items.length !== 1 ? "s" : "" }}</span
          >
        </div>

        <div class="items-list" v-if="items.length > 0">
          <div class="item-row" v-for="(item, index) in items" :key="index">
            <div class="item-info">
              <span class="codigo">{{ item.id_materia }}</span>

              <span class="item-name">{{ item.nombre }}</span>
            </div>
            <span class="item-price">Bs. {{ item.monto }}</span>
          </div>
        </div>

        <div class="items-empty" v-else>
          <svg
            width="40"
            height="40"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
              stroke="#cbd5e1"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <line
              x1="3"
              y1="6"
              x2="21"
              y2="6"
              stroke="#cbd5e1"
              stroke-width="1.5"
              stroke-linecap="round"
            />
            <path
              d="M16 10a4 4 0 01-8 0"
              stroke="#cbd5e1"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <p>Sin ítems</p>
        </div>

        <div class="items-divider"></div>

        <div class="items-total-row">
          <span class="items-total-label">Subtotal</span>
          <span class="items-total-value">Bs. {{ carrito.total }}</span>
        </div>
        <div class="items-total-row total-main">
          <span class="items-total-label">Total</span>
          <span class="items-total-value total-highlight"
            >Bs. {{ carrito.total }}</span
          >
        </div>
      </aside>
    </div>

    <div class="overlay" v-if="activeModal" @click.self="closeModal"></div>

    <div class="modal" v-if="activeModal === 'visa'">
      <div class="modal-body">
        <div class="form-group">
          <label class="form-label">Número de Tarjeta</label>
          <div class="input-icon-wrapper">
            <input
              type="text"
              class="form-input full-width"
              :class="{ 'input-error': cardErrors.cardNumber }"
              placeholder="Value"
              v-model="cardForm.cardNumber"
              @blur="validateCardField('cardNumber')"
              @input="formatCardNumber"
              maxlength="19"
            />
            <span class="input-icon">
              <svg
                width="20"
                height="14"
                viewBox="0 0 20 14"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <rect
                  x="1"
                  y="1"
                  width="18"
                  height="12"
                  rx="2"
                  stroke="#9ca3af"
                  stroke-width="1.5"
                  fill="none"
                />
                <rect x="1" y="4" width="18" height="2.5" fill="#9ca3af" />
              </svg>
            </span>
          </div>
          <span class="error-msg" v-if="cardErrors.cardNumber">{{
            cardErrors.cardNumber
          }}</span>
        </div>

        <div class="row-group">
          <div class="form-group flex-1">
            <label class="form-label">Fecha Expiración</label>
            <div class="expiry-row">
              <input
                type="text"
                class="form-input expiry-input"
                :class="{ 'input-error': cardErrors.expiryMM }"
                placeholder="MM"
                v-model="cardForm.expiryMM"
                @blur="validateCardField('expiryMM')"
                maxlength="2"
              />
              <input
                type="text"
                class="form-input expiry-input"
                :class="{ 'input-error': cardErrors.expiryYY }"
                placeholder="YY"
                v-model="cardForm.expiryYY"
                @blur="validateCardField('expiryYY')"
                maxlength="2"
              />
            </div>
            <span class="error-msg" v-if="cardErrors.expiryMM">{{
              cardErrors.expiryMM
            }}</span>
            <span class="error-msg" v-else-if="cardErrors.expiryYY">{{
              cardErrors.expiryYY
            }}</span>
          </div>

          <div class="form-group security-group">
            <label class="form-label">Código Seguridad</label>
            <input
              type="password"
              class="form-input security-input"
              :class="{ 'input-error': cardErrors.cvv }"
              placeholder="Value"
              v-model="cardForm.cvv"
              @blur="validateCardField('cvv')"
              maxlength="4"
            />
            <span class="error-msg" v-if="cardErrors.cvv">{{
              cardErrors.cvv
            }}</span>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Nombre Titular</label>
          <div class="name-row">
            <input
              type="text"
              class="form-input name-input"
              :class="{ 'input-error': cardErrors.firstName }"
              placeholder="Nombres"
              v-model="cardForm.firstName"
              @blur="validateCardField('firstName')"
            />
            <input
              type="text"
              class="form-input name-input"
              :class="{ 'input-error': cardErrors.lastName }"
              placeholder="Apellidos"
              v-model="cardForm.lastName"
              @blur="validateCardField('lastName')"
            />
          </div>
          <span class="error-msg" v-if="cardErrors.firstName">{{
            cardErrors.firstName
          }}</span>
          <span class="error-msg" v-else-if="cardErrors.lastName">{{
            cardErrors.lastName
          }}</span>
        </div>

        <div class="modal-actions">
          <button class="btn-pagar" @click="submitCard">Pagar</button>
          <button class="btn-regresar" @click="closeModal">Regresar</button>
        </div>

        <p class="modal-note">
          *Una vez realizado el pago, se enviará la factura &nbsp;electronica al
          correo electrónico
        </p>
      </div>
    </div>

    <div class="modal" v-if="activeModal === 'qr'">
      <div class="modal-body qr-modal-body">
        <div class="qr-container">
          <img src="/src/assets/qrcode.png" alt="QR" />
        </div>

        <div class="modal-actions">
          <button class="btn-pagar" @click="downloadQR">Descargar</button>
          <button class="btn-pagar" @click="procesarPagoQR">
            Procesar pago
          </button>
          <button class="btn-regresar" @click="closeModal">Regresar</button>
        </div>

        <p class="modal-note">
          *Una vez realizado el pago, se enviará la factura &nbsp;electronica al
          correo electrónico
        </p>
      </div>
    </div>
  </div>
  <ModalExito
    :message="mensaje"
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
import { ref, reactive, computed } from "vue";
import { usarCarrito } from "../../../store/carrito";

import { inscribirMaterias } from "../../estudiantes/services/estudianteService";
import { pagarInscripcion } from "../../estudiantes/services/estudianteService";
import ModalError from "../../seguridad/components/ModalError.vue";
import ModalExito from "../../seguridad/components/ModalExito.vue";

const mensaje = ref("");

const mostrarExito = ref(false);
const mostrarError = ref(false);

const carrito = usarCarrito();

const items = computed(() => carrito.cursos);

const subtotal = computed(() =>
  items.value.reduce((sum, item) => sum + Number(item.monto), 0),
);

const activeModal = ref(null);

const openModal = (type) => {
  const isValid = validateAllFacturaFields();

  if (!isValid) return;

  activeModal.value = type;
};

const closeModal = () => {
  activeModal.value = null;
};

const form = reactive({
  nitci: "",
  razonSocial: "",
  correo: "",
});

const errors = reactive({
  nitci: "",
  razonSocial: "",
  correo: "",
});

const validateField = (field) => {
  if (!form[field]) {
    errors[field] = "Este campo es obligatorio";
  } else {
    errors[field] = "";
  }
};

const cardForm = reactive({
  cardNumber: "",
  expiryMM: "",
  expiryYY: "",
  cvv: "",
  firstName: "",
  lastName: "",
});

const cardErrors = reactive({
  cardNumber: "",
  expiryMM: "",
  expiryYY: "",
  cvv: "",
  firstName: "",
  lastName: "",
});

const validateCardField = (field) => {
  if (!cardForm[field]) {
    cardErrors[field] = "Campo obligatorio";
  } else {
    cardErrors[field] = "";
  }
};

const validateAllCardFields = () => {
  let valid = true;
  Object.keys(cardForm).forEach((key) => {
    if (!cardForm[key]) {
      cardErrors[key] = "Campo obligatorio";
      valid = false;
    }
  });
  return valid;
};

const formatCardNumber = () => {
  let value = cardForm.cardNumber.replace(/\D/g, "");
  value = value.match(/.{1,4}/g)?.join(" ") || "";
  cardForm.cardNumber = value;
};

const submitCard = async () => {
  if (!validateAllCardFields()) return;

  try {
    const data = await inscribirMaterias(
      items.value.map((item) => item.id_materia),
    );

    console.log("Inscripción creada:", data);

    const idInscripcion = data.data.inscripcion.id_inscripcion;

    const pago = await pagarInscripcion(idInscripcion, {
      nit_ci: form.nitci,
      razon_social: form.razonSocial,
      correo: form.correo,
      metodo_pago: "TARJETA",
    });

    console.log("Pago realizado:", pago);

    mensaje.value = "Pago procesado correctamente";
    mostrarExito.value = true;
    carrito.vaciarCarrito();
    closeModal();
  } catch (error) {
    mensaje.value = "Error en el proceso de pago";
    mostrarError.value = true;
    console.log(error);
  }
};

const downloadQR = () => {
  alert("Descargando QR...");
};

const procesarPagoQR = async () => {
  try {
    const data = await inscribirMaterias(
      items.value.map((item) => item.id_materia),
    );

    console.log("Inscripción creada:", data);

    const idInscripcion = data.data.inscripcion.id_inscripcion;

    const pago = await pagarInscripcion(idInscripcion, {
      nit_ci: form.nitci,
      razon_social: form.razonSocial,
      correo: form.correo,
      metodo_pago: "QR",
    });

    console.log("Pago QR realizado:", pago);

    mensaje.value = "Pago procesado correctamente";
    mostrarExito.value = true;

    carrito.vaciarCarrito();
    closeModal();
  } catch (error) {
    mensaje.value = "Error en el proceso de pago";
    mostrarError.value = true;
    console.log(error);
  }
};

const validateAllFacturaFields = () => {
  let valid = true;

  Object.keys(form).forEach((key) => {
    if (!form[key]) {
      errors[key] = "Este campo es obligatorio";
      valid = false;
    } else {
      errors[key] = "";
    }
  });

  return valid;
};
</script>

<style scoped>
.codigo {
  align-self: flex-start;
  padding: 2px var(--space-2);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
}

.app-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: transparent;
}

.page-label {
  padding: var(--space-2) var(--space-4);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.layout {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: var(--space-6);
}

.sidebar {
  display: none;
}

.sidebar-top {
  display: none;
}

.main-content {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.card {
  width: 100%;
  max-width: 680px;
  padding: var(--space-8);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}

.card-title {
  margin-bottom: var(--space-6);
  padding-bottom: var(--space-4);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--text-h2);
  font-weight: 600;
  color: var(--color-text);
}

.form-group {
  margin-bottom: var(--space-4);
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text-secondary);
}

.form-input {
  width: 100%;
  height: 40px;
  padding: 0 var(--space-3);
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  color: var(--color-text);
  box-shadow: var(--shadow-xs);
  outline: none;
  transition: border-color var(--transition), box-shadow var(--transition);
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: var(--focus-ring);
}

.form-input.input-error {
  border-color: var(--color-danger);
  background: var(--color-surface);
}

.form-input.input-error:focus {
  box-shadow: var(--focus-ring-danger);
}

.form-input.full-width {
  width: 100%;
}

.error-msg {
  display: block;
  margin-top: var(--space-1);
  font-size: var(--text-xs);
  color: var(--color-danger);
}

.payment-buttons {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--space-4);
  margin-top: var(--space-8);
  padding-top: var(--space-6);
  border-top: 1px solid var(--color-border);
}

.pay-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 80px;
  background: var(--color-surface);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
  cursor: pointer;
  transition: border-color var(--transition), box-shadow var(--transition),
    background-color var(--transition);
}

.pay-btn:hover {
  background: var(--color-primary-soft);
  border-color: var(--color-primary);
  box-shadow: var(--shadow-sm);
}

.pay-btn:focus-visible {
  box-shadow: var(--focus-ring);
}

.qr-icon svg {
  width: 40px;
  height: 40px;
  display: block;
}

.visa-text {
  font-size: 28px;
  font-weight: 700;
  font-style: italic;
  letter-spacing: 1px;
  color: var(--color-info-hover);
}

.overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  z-index: 1000;
}

.modal {
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 1001;
  width: calc(100% - 32px);
  max-width: 480px;
  transform: translate(-50%, -50%);
  background: var(--color-surface);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-lg);
  animation: fadeIn 150ms ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

.modal-body {
  padding: var(--space-8);
}

.input-icon-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  top: 50%;
  right: var(--space-3);
  display: flex;
  transform: translateY(-50%);
  pointer-events: none;
}

.row-group {
  display: flex;
  gap: var(--space-4);
  align-items: flex-start;
}

.flex-1 {
  flex: 1;
}

.expiry-row,
.name-row {
  display: flex;
  gap: var(--space-2);
}

.expiry-input {
  width: 72px !important;
}

.security-group {
  flex-shrink: 0;
}

.security-input {
  width: 120px !important;
}

.name-input {
  flex: 1;
  width: auto !important;
  min-width: 0;
}

.modal-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--space-3);
  margin-top: var(--space-6);
}

.btn-pagar,
.btn-regresar {
  min-height: 40px;
  padding: 0 var(--space-5);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition);
}

.btn-pagar {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: 1px solid var(--color-primary);
}

.btn-pagar:hover {
  background: var(--color-primary-hover);
}

.btn-regresar {
  order: -1;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-strong);
}

.btn-regresar:hover {
  background: var(--color-surface-hover);
}

.modal-note {
  margin-top: var(--space-5);
  font-size: var(--text-xs);
  color: var(--color-text-muted);
  text-align: center;
}

.qr-modal-body {
  text-align: center;
}

.qr-modal-body .modal-actions {
  justify-content: center;
}

.qr-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: var(--space-4);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.items-sidebar {
  display: flex;
  flex-direction: column;
  width: 300px;
  min-width: 300px;
  overflow: hidden;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xs);
}

.items-sidebar-header {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--color-border);
}

.items-sidebar-title {
  font-size: var(--text-h3);
  font-weight: 600;
  color: var(--color-text);
}

.items-count {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.items-list {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-2) 0;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-5);
  border-bottom: 1px solid var(--color-border);
  transition: background-color var(--transition);
}

.item-row:hover {
  background: var(--color-surface-hover);
}

.item-row:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  flex: 1;
  min-width: 0;
}

.item-name {
  overflow: hidden;
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.item-qty {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.item-price {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
}

.items-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-10) var(--space-5);
}

.items-empty p {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.items-divider {
  height: 1px;
  margin: 0;
  background: var(--color-border);
}

.items-total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-3) var(--space-5) 0;
}

.total-main {
  padding-bottom: var(--space-5);
}

.items-total-label {
  font-size: var(--text-sm);
  color: var(--color-text-muted);
}

.items-total-value {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text-secondary);
}

.total-main .items-total-label {
  font-weight: 600;
  color: var(--color-text);
}

.total-highlight {
  font-size: var(--text-h2);
  font-weight: 700;
  color: var(--color-text);
}

@media (max-width: 1024px) {
  .items-sidebar {
    order: 3;
    width: 100%;
    min-width: 0;
  }

  .main-content {
    flex-basis: 100%;
  }
}

@media (max-width: 768px) {
  .card {
    padding: var(--space-5) var(--space-4);
  }

  .payment-buttons {
    grid-template-columns: 1fr;
  }

  .pay-btn {
    height: 64px;
  }

  .modal {
    max-height: 90vh;
    max-height: 90dvh;
    overflow-y: auto;
  }

  .modal-body {
    padding: var(--space-6) var(--space-4);
  }

  .modal-actions {
    flex-direction: column;
  }

  .modal-actions button {
    width: 100%;
  }

  .btn-regresar {
    order: 0;
  }
}

@media (max-width: 600px) {
  .row-group {
    flex-direction: column;
    gap: 0;
  }

  .row-group .form-group {
    width: 100%;
  }

  .name-row {
    flex-direction: column;
  }

  .expiry-input,
  .security-input,
  .name-input {
    width: 100% !important;
  }

  .expiry-row {
    width: 100%;
  }
}
</style>
