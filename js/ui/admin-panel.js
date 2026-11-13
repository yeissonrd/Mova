/* MOVA — js/ui/admin-panel.js  (CORRECCIONES: panel del administrador)
   Navegación entre las vistas del panel: Resumen, Clientes y Gestión de tickets.
   También tiene la base de los cuadros (modales) que usan las demás vistas.
   No toca navegacion.js: el panel es una sola pantalla ("admin") con varias vistas. */

// Ícono nuevo para "Gestión de tickets" (se agrega al juego de íconos de comun.js).
ICON_PATHS.ticket =
  '<path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4Z" /><path d="M14 5v2M14 11v2M14 17v2" />';

const VISTAS_ADMIN = {
  resumen: "Resumen",
  clientes: "Clientes",
  tickets: "Gestión de tickets",
  configuracion: "Configuración",
  subadmins: "Subadministradores",
};

let vistaAdminActual = "resumen";

// Muestra una vista y oculta las demás. Repinta los datos para que estén al día.
function mostrarVistaAdmin(vista) {
  if (!VISTAS_ADMIN[vista]) return;
  vistaAdminActual = vista;
  document.querySelectorAll("#screen-admin .admin-vista").forEach((el) => {
    el.hidden = el.dataset.vista !== vista;
  });
  document.querySelectorAll("#screen-admin [data-admin-vista]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.adminVista === vista);
  });
  const etiqueta = document.getElementById("admin-breadcrumb-label");
  if (etiqueta) etiqueta.textContent = VISTAS_ADMIN[vista];
  if (typeof cerrarModalAdmin === "function") cerrarModalAdmin();
  if (typeof avisoAdmin === "function") avisoAdmin("");
  if (adminActual) pintarPanelAdmin();
  window.scrollTo({ top: 0 });
}

/* ===================== BASE DE LOS CUADROS (MODALES) ===================== */
// Crea el fondo oscuro con el contenido. Usa el id "admin-modal" para que cerrarModalAdmin() lo cierre.
function abrirModalBaseAdmin(contenidoHtml) {
  if (typeof cerrarModalAdmin === "function") cerrarModalAdmin();
  const fondo = document.createElement("div");
  fondo.id = "admin-modal";
  fondo.className = "admin-modal-fondo";
  fondo.innerHTML = contenidoHtml;
  document.body.appendChild(fondo);
  renderIcons(fondo);
  fondo.addEventListener("click", (e) => {
    if (e.target === fondo || e.target.closest(".admin-modal-cerrar")) cerrarModalAdmin();
  });
  const enfocable = fondo.querySelector("input, select, textarea, button");
  if (enfocable) enfocable.focus();
  return fondo;
}

alIniciar(() => {
  // Menú lateral y barra inferior del celular.
  document.querySelectorAll("#screen-admin [data-admin-vista]").forEach((btn) => {
    btn.addEventListener("click", () => mostrarVistaAdmin(btn.dataset.adminVista));
  });

  // "Salir" de la barra del celular también cierra la sesión del administrador.
  const salirMovil = document.querySelector("#screen-admin .admin-salir-movil");
  if (salirMovil) salirMovil.addEventListener("click", () => { adminActual = null; });

  // Escape cierra el cuadro abierto.
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.getElementById("admin-modal")) cerrarModalAdmin();
  });
});
