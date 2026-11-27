<template>
  <div class="cart-overlay" @click.self="$emit('cerrar')">
    <div class="cart-sidebar">
      <div class="cart-header">
        <h2>Carrito de cursos</h2>
        <Icon icon-name="shopping_cart" icon-color="var(--color-primary)" />
        <button class="close" @click="$emit('cerrar')">✖</button>
      </div>

      <div v-if="carrito.cursos.length === 0" class="empty">
        No hay cursos en el carrito
      </div>

      <div v-else class="content">
        <div
          v-for="curso in carrito.cursos"
          :key="curso.id_materia"
          class="cart-item"
        >
          <span class="codigo">{{ curso.id_materia }}</span>
          <span class="nombre">{{ curso.nombre }}</span>
          <span class="monto">Bs {{ curso.monto }}</span>
          <button class="delete" @click="eliminar(curso.id_materia)">
            <Icon iconName="trash" icon-color="var(--color-danger)" />
          </button>
        </div>
      </div>
      <div class="cart-bottom">
        <div class="total">
          <strong>Total:</strong>
          <span>Bs {{ carrito.total }}</span>
        </div>

        <button class="clear" @click="vaciar">Vaciar carrito</button>

        <button
          class="pay"
          @click="pagar"
          :disabled="carrito.cursos.length === 0"
        >
          {{
            carrito.cursos.length === 0
              ? "No hay cursos en el carrito"
              : "Realizar el pago"
          }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usarCarrito } from "../../../store/carrito";
import Icon from "../../seguridad/components/Icon.vue";
import { useRouter } from "vue-router";
const carrito = usarCarrito();
const router = useRouter();
const eliminar = (id_materia) => {
  carrito.eliminarCurso(id_materia);
};

const vaciar = () => {
  carrito.vaciarCarrito();
};

const pagar = () => {
  router.push({ name: "pagarCarrito" });
};
</script>
<style scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  background: var(--color-overlay);
  display: flex;
  justify-content: flex-end;
  z-index: 1000;
}

.cart-sidebar {
  width: 100%;
  max-width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--color-surface);
  border-left: 1px solid var(--color-border);
  box-shadow: var(--shadow-lg);
  animation: slideIn 200ms ease-out;
}

.cart-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-5) var(--space-6);
  background-color: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.cart-header h2 {
  order: 1;
  flex: 1;
  margin: 0;
  font-size: var(--text-h2);
  font-weight: 600;
  color: var(--color-text);
}

.cart-header > :nth-child(2) {
  order: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  background: var(--color-primary-soft);
}

.cart-header :deep(svg) {
  width: 20px;
  height: 20px;
  display: block;
}

.close {
  order: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition);
}

.close:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-4) var(--space-6);
  background: var(--color-bg);
}

.empty {
  flex: 1;
  padding: var(--space-10) var(--space-6);
  text-align: center;
  font-size: var(--text-sm);
  color: var(--color-text-muted);
  background: var(--color-bg);
}

.cart-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  margin-bottom: var(--space-2);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
}

.codigo {
  padding: 2px var(--space-2);
  background: var(--color-primary-soft);
  color: var(--color-primary);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  font-weight: 600;
}

.nombre {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--color-text);
}

.monto {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
}

.delete {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: none;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color var(--transition);
}

.delete:hover {
  background: var(--color-danger-soft);
}

.delete :deep(svg) {
  width: 18px;
  height: 18px;
}

.cart-bottom {
  padding: var(--space-5) var(--space-6);
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
}

.total {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: var(--space-5);
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
}

.total strong {
  font-weight: 500;
}

.total span {
  font-size: var(--text-h2);
  font-weight: 700;
  color: var(--color-text);
}

.clear,
.pay {
  width: 100%;
  min-height: 40px;
  padding: 0 var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition), opacity var(--transition);
}

.clear {
  margin-bottom: var(--space-3);
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border-strong);
}

.clear:hover {
  background: var(--color-surface-hover);
}

.pay {
  background: var(--color-primary);
  color: var(--color-text-inverse);
  border: none;
}

.pay:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

.pay:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (min-width: 600px) {
  .cart-sidebar {
    width: 420px;
  }
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }

  to {
    transform: translateX(0);
  }
}
</style>
