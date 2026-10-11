import { createRouter, createWebHistory } from "vue-router";
import SeguridadLayout from "../layouts/SeguridadLayout.vue";
import GestionUsuarios from "../modulos/seguridad/views/GestionUsuarios.vue";
import CrearUsuario from "../modulos/seguridad/views/CrearUsuario.vue";
import DetalleUsuario from "../modulos/seguridad/views/DetalleUsuario.vue";
import GestionRoles from "../modulos/seguridad/views/GestionRoles.vue";
import CrearRol from "../modulos/seguridad/views/CrearRol.vue";
import DetalleRol from "../modulos/seguridad/views/DetalleRol.vue";
import Permisos from "../modulos/seguridad/views/Permisos.vue";
import MiCuenta from "../modulos/seguridad/views/MiCuenta.vue";
import SinAcceso from "../modulos/seguridad/views/SinAcceso.vue";

import AdminLayout from "../layouts/AdminLayout.vue";
import ListarCarreras from "../modulos/admin/views/ListarCarreras.vue";
import RegistrarCarrera from "../modulos/admin/views/RegistrarCarrera.vue";
import VerCarrera from "../modulos/admin/views/VerCarrera.vue";

import DocenteLayout from "../layouts/DocenteLayout.vue";

import EstudianteLayout from "../layouts/EstudianteLayout.vue";
import Login from "../modulos/seguridad/views/Login.vue";

import RegistrarCursos from "../modulos/admin/views/RegistrarCursos.vue";
import RegistrarCursosExtra from "../modulos/admin/views/RegistrarCursosExtra.vue";
import ListarCursos from "../modulos/admin/views/ListarCursos.vue";
import ListarExtra from "../modulos/admin/views/ListarExtra.vue";
import InfoCurso from "../modulos/admin/views/InfoCurso.vue";

import OfertaAcademica from "../modulos/estudiantes/views/OfertaAcademica.vue";
import MiCarrera from "../modulos/estudiantes/views/miCarrera.vue";
import MisMaterias from "../modulos/estudiantes/views/MisMaterias.vue";
import Pagos from "../modulos/pagos/components/Pagos.vue";
import MiPerfil from "../modulos/estudiantes/views/MiPerfil.vue";
import EstadoAcademico from "../modulos/estudiantes/views/EstadoAcademico.vue";
import MiProgreso from "../modulos/estudiantes/views/MiProgreso.vue";

import MateriasDocente from "../modulos/docentes/views/MateriasDocente.vue";
import NotasMateria from "../modulos/docentes/views/NotasMateria.vue";
import AsistenciaMateria from "../modulos/docentes/views/AsistenciaMateria.vue";
import ListarAulas from "../modulos/admin/views/ListarAulas.vue";

import { tienePermiso } from "../modulos/seguridad/servicios/AuthServicio";

const routes = [
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/sin-acceso",
    name: "sinAcceso",
    component: SinAcceso,
  },
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/seguridad",
    component: SeguridadLayout,
    children: [
      {
        path: "",
        redirect: { name: "gestionUsuarios" },
      },
      {
        path: "usuarios",
        name: "gestionUsuarios",
        component: GestionUsuarios,
        meta: { permiso: "usuarios.listar" },
      },
      {
        path: "crearUsuario",
        name: "crearUsuario",
        component: CrearUsuario,
        meta: { permiso: "usuarios.crear" },
      },
      {
        path: "usuarios/:ci",
        name: "detalleUsuario",
        component: DetalleUsuario,
        meta: { permiso: "usuarios.ver" },
      },
      {
        path: "roles",
        name: "gestionRoles",
        component: GestionRoles,
        meta: { permiso: "roles.listar" },
      },
      {
        path: "crearRol",
        name: "crearRol",
        component: CrearRol,
        meta: { permiso: ["roles.crear", "roles.asignar_permisos"] },
      },
      {
        path: "roles/:id",
        name: "detalleRol",
        component: DetalleRol,
        meta: { permiso: "roles.ver" },
      },
      {
        path: "permisos",
        name: "permisos",
        component: Permisos,
        meta: { permiso: "permisos.listar" },
      },
      {
        path: "miCuenta",
        name: "miCuentaSeguridad",
        component: MiCuenta,
      },
    ],
  },
  {
    path: "/administrador",
    component: AdminLayout,
    children: [
      {
        path: "listarCursos",
        name: "listarCursos",
        component: ListarCursos,
        meta: { permiso: "materias.ver" },
      },
      {
        path: "registrarCursos",
        name: "registrarCursos",
        component: RegistrarCursos,
        meta: { permiso: "materias.crear" },
      },
      {
        path: "registrarCursosExtra",
        name: "registrarCursosExtra",
        component: RegistrarCursosExtra,
        meta: { permiso: "extras.crear" },
      },
      {
        path: "listarExtra",
        name: "listarExtra",
        component: ListarExtra,
        meta: { permiso: "extras.ver" },
      },
      {
        path: "listarAulas",
        name: "listarAulas",
        component: ListarAulas,
        meta: { permiso: "aulas.ver" },
      },
      {
        path: "",
        redirect: { name: "listarCarreras" },
      },
      {
        path: "listarCarreras",
        name: "listarCarreras",
        component: ListarCarreras,
        meta: { permiso: "carreras.ver" },
      },
      {
        path: "registrarCarrera",
        name: "registrarCarrera",
        component: RegistrarCarrera,
        meta: { permiso: "carreras.crear" },
      },
      {
        path: "verCarrera/:codigo",
        name: "verCarrera",
        component: VerCarrera,
        meta: { permiso: "carreras.ver" },
      },
      {
        path: "info-curso/:id",
        name: "infoCurso",
        component: InfoCurso,
        meta: { permiso: "materias.ver" },
      },
      {
        path: "miCuenta",
        name: "miCuentaAdmin",
        component: MiCuenta,
      },
    ],
  },
  {
    path: "/docente",
    component: DocenteLayout,
    children: [
      {
        path: "",
        redirect: { name: "MateriasDocente" },
      },
      {
        path: "MateriasDocente",
        name: "MateriasDocente",
        component: MateriasDocente,
        meta: { permiso: "materias.ver" },
      },
      {
        path: "NotasMateria/:id_materia",
        name: "NotasMateria",
        component: NotasMateria,
        meta: { permiso: "notas.ver_materia" },
      },
      {
        path: "AsistenciaMateria/:id_materia",
        name: "AsistenciaMateria",
        component: AsistenciaMateria,
        meta: { permiso: "asistencias.ver_materia" },
      },
      {
        path: "miCuenta",
        name: "miCuentaDocente",
        component: MiCuenta,
      },
    ],
  },
  {
    path: "/estudiante",
    component: EstudianteLayout,
    children: [
      {
        path: "",
        redirect: { name: "ofertaAcademica" },
      },
      {
        path: "ofertaAcademica",
        name: "ofertaAcademica",
        component: OfertaAcademica,
        meta: { permiso: "oferta.ver" },
      },
      {
        path: "miCarrera",
        name: "miCarrera",
        component: MiCarrera,
        meta: { permiso: "carrera.asignar_propia" },
      },
      {
        path: "misMaterias",
        name: "misMaterias",
        component: MisMaterias,
        meta: { permiso: "inscripcion.ver_propias" },
      },
      {
        path: "estadoAcademico",
        name: "estadoAcademico",
        component: EstadoAcademico,
        meta: { permiso: "inscripcion.ver_propias" },
      },
      {
        path: "pagarCarrito",
        name: "pagarCarrito",
        component: Pagos,
        meta: { permiso: "pagos.pagar" },
      },
      {
        path: "miProgreso/:id_materia",
        name: "miProgreso",
        component: MiProgreso,
        meta: { permiso: "notas.ver_propias" },
      },
      {
        path: "miPerfil",
        name: "miPerfil",
        component: MiPerfil,
        meta: { permiso: "perfil.ver_propio" },
      },
      {
        path: "miCuenta",
        name: "miCuentaEstudiante",
        component: MiCuenta,
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  if (to.path !== "/login" && to.name !== "sinAcceso" && !token) {
    return next("/login");
  }

  if (to.meta && to.meta.permiso) {
    const requeridos = Array.isArray(to.meta.permiso)
      ? to.meta.permiso
      : [to.meta.permiso];
    const autorizado = requeridos.some((codigo) => tienePermiso(codigo));
    if (!autorizado) {
      return next({ name: "sinAcceso" });
    }
  }

  next();
});

export default router;
