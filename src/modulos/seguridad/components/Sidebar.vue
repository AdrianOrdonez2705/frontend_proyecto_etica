<template>
  <button class="menu-toggle" @click="toggleMenu">☰</button>
  <aside class="sidebar-container" :class="{ 'is-open': isMenuOpen }">
    <div class="sidebar-accent"></div>

    <div class="sidebar-content">
      <div class="profile-section">
        <div class="profile-img">
          <img src="/src/assets/logo.png" alt="Logo" />
        </div>
        <div class="profile-info">
          <div class="titulo">SixSeven</div>
          <div class="titulo">Academy</div>
        </div>
      </div>

      <div class="user-section">
        <div class="user-icon">
          <img
            src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
            alt="Usuario"
          />
        </div>
        <div class="user-data">
          <div class="user-name">{{ nombreUsuario }}</div>
          <div class="user-role">Seguridad</div>
        </div>
      </div>

      <nav class="menu">
        <router-link
          v-if="tienePermiso('usuarios.listar')"
          :to="{ name: 'gestionUsuarios' }"
          class="menu-item"
        >
          Usuarios
        </router-link>
        <router-link
          v-if="tienePermiso('usuarios.crear')"
          :to="{ name: 'crearUsuario' }"
          class="menu-item"
        >
          Crear usuario
        </router-link>
        <router-link
          v-if="tienePermiso('roles.listar')"
          :to="{ name: 'gestionRoles' }"
          class="menu-item"
        >
          Roles
        </router-link>
        <router-link
          v-if="tienePermiso('roles.crear')"
          :to="{ name: 'crearRol' }"
          class="menu-item"
        >
          Crear rol
        </router-link>
        <router-link
          v-if="tienePermiso('permisos.listar')"
          :to="{ name: 'permisos' }"
          class="menu-item"
        >
          Permisos
        </router-link>
        <router-link
          v-if="tienePermiso('seguridad.configurar')"
          :to="{ name: 'configuracionSeguridad' }"
          class="menu-item"
        >
          Configuración de seguridad
        </router-link>
        <router-link :to="{ name: 'miCuentaSeguridad' }" class="menu-item">
          Mi cuenta
        </router-link>
      </nav>

      <button class="logout-btn" @click="logoutUsuario">Cerrar Sesión</button>
    </div>
  </aside>
  <div v-if="isMenuOpen" class="overlay" @click="isMenuOpen = false"></div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { logout } from "../servicios/seguridadService";
import { tienePermiso } from "../servicios/AuthServicio";

const router = useRouter();

const nombreUsuario = ref("");
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
onMounted(() => {
  nombreUsuario.value = localStorage.getItem("nombre");
});

const logoutUsuario = async () => {
  await logout();
  localStorage.clear();
  router.push("/login");
};
</script>

<style scoped>
.sidebar-container {
  display: flex;
  flex-shrink: 0;
  width: var(--sidebar-width);
  max-width: 100vw;
  height: 100vh;
  height: 100dvh;
  background-color: var(--color-surface);
  border-right: 1px solid var(--color-border);
  transition: transform var(--transition);
  z-index: 1000;
}

.sidebar-accent {
  display: none;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: var(--space-6) var(--space-4);
  overflow-y: auto;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: 0 var(--space-2);
  margin-bottom: var(--space-6);
}

.profile-img {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background-color: var(--color-primary-soft);
  border-radius: var(--radius-md);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.profile-img img {
  width: 80%;
  object-fit: contain;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.titulo {
  font-size: var(--text-body);
  font-weight: 700;
  line-height: 1.2;
  color: var(--color-text);
}

.titulo + .titulo {
  font-size: var(--text-xs);
  font-weight: 500;
  color: var(--color-text-muted);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.user-section {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  width: 100%;
  padding: var(--space-3);
  margin-bottom: var(--space-6);
  background: var(--color-surface-muted);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
}

.user-data {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.user-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-text);
  line-height: 1.3;
}

.user-role {
  font-size: var(--text-xs);
  color: var(--color-text-muted);
}

.menu {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  width: 100%;
  flex-grow: 1;
}

.menu-item {
  display: flex;
  align-items: center;
  min-height: 40px;
  text-decoration: none;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  text-align: left;
  transition: background-color var(--transition), color var(--transition);
}

.menu-item:hover {
  background: var(--color-surface-hover);
  color: var(--color-text);
}

.menu-item.router-link-active {
  background-color: var(--color-primary-soft);
  color: var(--color-primary);
  font-weight: 600;
}

.menu-item-disabled {
  background: transparent !important;
  color: var(--color-text-disabled) !important;
  cursor: not-allowed !important;
}

.logout-btn {
  width: 100%;
  min-height: 40px;
  padding: 0 var(--space-4);
  margin-top: var(--space-6);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-strong);
  background-color: var(--color-surface);
  color: var(--color-text-secondary);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: background-color var(--transition), color var(--transition),
    border-color var(--transition);
}

.logout-btn:hover {
  background-color: var(--color-danger-soft);
  border-color: var(--color-danger-border);
  color: var(--color-danger);
}

.user-icon {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: var(--radius-full);
  background-color: var(--color-primary-soft);
  border: 1px solid var(--color-primary-border);
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.user-icon img {
  width: 70%;
  height: 70%;
  object-fit: contain;
}

.menu-toggle {
  display: none;
  position: fixed;
  top: var(--space-4);
  left: var(--space-4);
  z-index: 1100;
  width: 40px;
  height: 40px;
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border-strong);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-xs);
  font-size: 18px;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .sidebar-container {
    width: 232px;
  }

  .sidebar-content {
    padding: var(--space-5) var(--space-3);
  }
}

@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .sidebar-container {
    position: fixed;
    top: 0;
    left: 0;
    width: min(280px, 86vw);
    transform: translateX(-100%);
    box-shadow: var(--shadow-lg);
  }

  .sidebar-container.is-open {
    transform: translateX(0);
  }

  .sidebar-content {
    padding: var(--space-6) var(--space-4);
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: var(--color-overlay);
    z-index: 999;
  }
}
</style>
