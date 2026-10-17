/* MOVA — js/ui/navegacion.js
   Navegación entre pantallas y registro de pantallas del cliente.
   NO se edita al desarrollar una HU: cada pantalla se registra sola con
   registrarPantalla() desde su propio archivo, y las acciones de arranque con alIniciar(). */

const CLIENT_NAV = [
  { screen: "dashboard", label: "Inicio", icon: "home" },
  { screen: "accounts", label: "Mis cuentas", icon: "wallet" },
  { screen: "card", label: "Mi tarjeta", icon: "card" },
  { screen: "transfer", label: "Transferir", icon: "send" },
  { screen: "movements", label: "Movimientos", icon: "history" },
  { screen: "profile", label: "Perfil y seguridad", icon: "user" },
];

/* ===================== REGISTRO DE PANTALLAS ===================== */
const PANTALLAS_CLIENTE = {};
const INICIADORES = [];

/* nombre: id de pantalla (coincide con data-go). html: función que devuelve el HTML.
   alMostrar: función opcional que conecta eventos después de pintar el HTML. */
function registrarPantalla(nombre, html, alMostrar) {
  PANTALLAS_CLIENTE[nombre] = { html, alMostrar };
}

/* Funciones que se ejecutan una vez cuando el DOM está listo (en orden de registro). */
function alIniciar(fn) {
  INICIADORES.push(fn);
}

/* ===================== NAVEGACIÓN ===================== */
let currentScreen = "landing";

function go(screen) {
  currentScreen = screen;
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));

  if (PANTALLAS_CLIENTE[screen]) {
    document.getElementById("screen-client").classList.add("active");
    renderClientScreen(screen);
  } else {
    const el = document.getElementById("screen-" + screen);
    if (el) el.classList.add("active");
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderClientScreen(screen) {
  const content = document.getElementById("client-content");
  content.innerHTML = PANTALLAS_CLIENTE[screen].html();
  renderIcons(content);
  wireClientScreenEvents(screen);

  // Sidebar + mobile nav active state and breadcrumb
  const navItem = CLIENT_NAV.find((i) => i.screen === screen);
  document.querySelectorAll("#client-sidebar-nav button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.go === screen);
  });
  document.querySelectorAll("#client-mobile-nav button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.go === screen);
  });
  document.getElementById("client-breadcrumb-label").textContent = navItem ? navItem.label : "";
}

function wireClientScreenEvents(screen) {
  // Botones data-go dentro del contenido que se acaba de pintar
  document.querySelectorAll("#client-content [data-go]").forEach((el) => {
    el.addEventListener("click", () => go(el.dataset.go));
  });

  // Eventos propios de la pantalla (los define su archivo)
  const pantalla = PANTALLAS_CLIENTE[screen];
  if (pantalla && pantalla.alMostrar) pantalla.alMostrar();
}

/* ===================== INICIALIZACIÓN ===================== */
document.addEventListener("DOMContentLoaded", () => {
  renderIcons(document);

  // Botones estáticos con navegación (fuera del contenido dinámico del cliente)
  document.querySelectorAll("[data-go]").forEach((el) => {
    el.addEventListener("click", () => go(el.dataset.go));
  });

  INICIADORES.forEach((fn) => fn());
});
