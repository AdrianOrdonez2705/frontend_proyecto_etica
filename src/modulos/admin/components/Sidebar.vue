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
          <div class="user-role">Administrador</div>
        </div>
      </div>

      <nav class="menu">
        <router-link
          v-if="tienePermiso('carreras.ver')"
          :to="{ name: 'listarCarreras' }"
          class="menu-item"
          >Carreras</router-link
        >
        <router-link
          v-if="tienePermiso('materias.ver')"
          :to="{ name: 'listarCursos' }"
          class="menu-item"
          >Cursos</router-link
        >
        <router-link
          v-if="tienePermiso('extras.ver')"
          :to="{ name: 'listarExtra' }"
          class="menu-item"
          >Extracurriculares</router-link
        >
        <router-link
          v-if="tienePermiso('aulas.ver')"
          :to="{ name: 'listarAulas' }"
          class="menu-item"
          >Aulas</router-link
        >
        <router-link :to="{ name: 'miCuentaAdmin' }" class="menu-item"
          >Mi cuenta</router-link
        >
      </nav>

      <button class="logout-btn" @click="logoutUsuario">Cerrar Sesión</button>
    </div>
  </aside>
  <div v-if="isMenuOpen" class="overlay" @click="isMenuOpen = false"></div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { ref, onMounted } from "vue";
import { tienePermiso } from "../../seguridad/servicios/AuthServicio";

const router = useRouter();

const nombreUsuario = ref("");
const isMenuOpen = ref(false);

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};
onMounted(() => {
  nombreUsuario.value = localStorage.getItem("nombre") || "Usuario";
});

const logoutUsuario = async () => {
  localStorage.clear();
  router.push({
    name: "login",
  });
};
</script>

<style scoped>
.sidebar-container {
  display: flex;
  width: 280px;
  max-width: 100vw;
  height: 100vh;
  height: 100dvh;
  background-color: #a0dde0;
  transition: transform 0.3s ease;
  z-index: 1000;
}

.sidebar-accent {
  width: 45px;
  background-color: #004d66;
  height: 100%;
}

.sidebar-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 40px 20px;
  align-items: center;
  overflow-y: auto;
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 15px;
  width: 100%;
  margin-bottom: 25px;
}

.profile-img {
  width: 80px;
  height: 80px;
  background-color: #d9d9d9;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.profile-img img {
  width: 90%;
  object-fit: contain;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.titulo {
  font-size: 3.5vh;
  font-weight: bold;
  color: #004d66;
}

.user-section {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  margin-bottom: 40px;
}

.user-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: #004d66;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 20px;
}

.user-data {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-weight: bold;
  color: #002b3d;
}

.user-role {
  font-size: 0.85rem;
  color: #004d66;
  opacity: 0.8;
}

.menu {
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
  flex-grow: 1;
}

.menu-item {
  text-decoration: none;
  padding: 15px;
  border-radius: 30px;
  background: #7fb6bd;
  color: #002b3d;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;
}

.menu-item.router-link-active {
  background-color: #000066;
  color: white;
}

.menu-item-disabled {
  background: #999 !important;
  color: #666 !important;
  cursor: not-allowed !important;
}

.logout-btn {
  width: 90%;
  padding: 15px;
  border-radius: 30px;
  border: none;
  background-color: #003355;
  color: white;
  font-weight: bolder;
  cursor: pointer;
  margin-top: auto;
}

.logout-btn:hover {
  background-color: #002233;
}

.user-icon {
  width: 45px;
  height: 45px;
  border-radius: 50%;
  background-color: #004d66;
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
  top: 20px;
  left: 20px;
  z-index: 1100;
  background: #004d66;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 20px;
  cursor: pointer;
}

@media (max-width: 1024px) {
  .sidebar-container {
    width: 240px;
  }

  .sidebar-accent {
    width: 32px;
  }

  .sidebar-content {
    padding: 28px 14px;
  }

  .profile-img {
    width: 60px;
    height: 60px;
  }

  .titulo {
    font-size: 2rem;
  }
}

@media (max-width: 768px) {
  .menu-toggle {
    display: block;
  }

  .sidebar-container {
    position: fixed;
    top: 0;
    left: 0;
    width: min(280px, 86vw);
    transform: translateX(-100%);
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.2);
  }

  .sidebar-container.is-open {
    transform: translateX(0);
  }

  .sidebar-accent {
    display: none;
  }

  .sidebar-content {
    padding: 24px 16px;
  }

  .overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    z-index: 999;
  }
}
</style>
