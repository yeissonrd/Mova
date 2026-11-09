/* MOVA — js/ui/encabezado.js  (CORRECCIONES: encabezado del cliente)
   - Campana de notificaciones con insignia de pendientes.
   - El menú de cuenta ofrece acceso a Perfil y seguridad y cierre de sesión.
   Las notificaciones salen de los movimientos reales del cliente: no se guarda nada
   nuevo en los modelos. Solo se recuerda en el navegador cuándo las vio por última vez. */

/* ===================== CLASE: Notificaciones ===================== */
class Notificaciones {
  static MAXIMO = 10; // cuántas se muestran en el panel

  #cliente;
  #respaldo = null; // solo se usa si el navegador bloquea localStorage

  constructor(cliente) {
    this.#cliente = cliente;
  }

  // Clave de localStorage donde se guarda la última vez que el cliente abrió la campana.
  get #clave() {
    return "mova.notif." + this.#cliente.identificacion;
  }

  // Fecha de la última lectura (null si nunca la abrió).
  ultimaLectura() {
    try {
      const valor = localStorage.getItem(this.#clave);
      return valor ? new Date(valor) : null;
    } catch (error) {
      return this.#respaldo ?? null; // localStorage bloqueado
    }
  }

  // Todos los movimientos de todos los productos, del más reciente al más antiguo.
  #movimientos() {
    return this.#cliente.productos
      .flatMap((producto) => producto.historial().map((movimiento) => ({ movimiento, producto })))
      .sort((a, b) => b.movimiento.fecha - a.movimiento.fecha);
  }

  // Lista para mostrar en el panel. "nueva" es true si ocurrió después de la última lectura.
  lista() {
    const lectura = this.ultimaLectura();
    return this.#movimientos()
      .slice(0, Notificaciones.MAXIMO)
      .map(({ movimiento, producto }) => ({
        titulo: movimiento.tipo,
        detalle: `${estiloMovimiento(movimiento).valor} · ${producto.tipo} •••• ${String(producto.numero).slice(-4)}`,
        fecha: movimiento.fecha,
        esIngreso: movimiento.esIngreso,
        estilo: estiloMovimiento(movimiento),
        nueva: !lectura || movimiento.fecha > lectura,
      }));
  }

  // Cuántos movimientos no ha visto todavía.
  pendientes() {
    const lectura = this.ultimaLectura();
    return this.#movimientos().filter(({ movimiento }) => !lectura || movimiento.fecha > lectura).length;
  }

  marcarLeidas() {
    const ahora = new Date();
    this.#respaldo = ahora;
    try {
      localStorage.setItem(this.#clave, ahora.toISOString());
    } catch (error) {
      // Si el navegador bloquea localStorage, queda solo en memoria.
    }
  }
}

/* ===================== PANEL DE LA CAMPANA ===================== */
let notificacionesActuales = null;

function campanaBoton() {
  return document.querySelector("#screen-client .user-tools .icon-button");
}

function panelNotificaciones() {
  return document.getElementById("panel-notificaciones");
}

function escaparNotif(texto) {
  return String(texto).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// Actualiza el distintivo: campana rellena de verde + numerito con los pendientes.
function actualizarCampana() {
  const boton = campanaBoton();
  if (!boton) return;
  const cantidad = clienteActual ? new Notificaciones(clienteActual).pendientes() : 0;
  boton.classList.toggle("tiene-pendientes", cantidad > 0);
  let insignia = boton.querySelector(".insignia");
  if (cantidad > 0) {
    if (!insignia) {
      insignia = document.createElement("span");
      insignia.className = "insignia";
      boton.appendChild(insignia);
    }
    insignia.textContent = cantidad > 9 ? "9+" : String(cantidad);
    boton.setAttribute("aria-label", `Notificaciones: ${cantidad} pendientes`);
  } else {
    if (insignia) insignia.remove();
    boton.setAttribute("aria-label", "Notificaciones");
  }
}

function notificacionHtml(n) {
  const fecha = n.fecha.toLocaleString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  return `
    <li class="notif-item${n.nueva ? " nueva" : ""}">
      <i class="${n.estilo.color}" data-icon="${n.estilo.icono}" data-size="16"></i>
      <div><b>${escaparNotif(n.titulo)}</b><small>${escaparNotif(n.detalle)}</small><small>${fecha}</small></div>
    </li>`;
}

function cerrarPanelNotificaciones() {
  const panel = panelNotificaciones();
  if (panel) panel.remove();
  const boton = campanaBoton();
  if (boton) boton.setAttribute("aria-expanded", "false");
}

function cerrarMenuCuentaCliente() {
  const menu = document.getElementById("client-account-menu");
  const activador = document.getElementById("client-account-trigger");
  if (!menu || !activador) return;
  menu.hidden = true;
  activador.setAttribute("aria-expanded", "false");
}

function abrirPanelNotificaciones() {
  if (!clienteActual) return;
  cerrarMenuCuentaCliente();
  cerrarPanelNotificaciones();
  notificacionesActuales = new Notificaciones(clienteActual);
  const lista = notificacionesActuales.lista();

  const panel = document.createElement("div");
  panel.id = "panel-notificaciones";
  panel.className = "panel-notificaciones";
  panel.innerHTML = `
    <div class="notif-titulo"><b>Notificaciones</b></div>
    ${lista.length === 0
      ? `<p class="notif-vacio">No tienes notificaciones.</p>`
      : `<ul class="notif-lista">${lista.map(notificacionHtml).join("")}</ul>`}`;
  document.querySelector("#screen-client .user-tools").appendChild(panel);
  renderIcons(panel);
  campanaBoton().setAttribute("aria-expanded", "true");

  // Al abrir el panel se consideran vistas: la campana pierde el distintivo.
  notificacionesActuales.marcarLeidas();
  actualizarCampana();
}

/* ===================== INICIO ===================== */
alIniciar(() => {
  const herramientas = document.querySelector("#screen-client .user-tools");
  const boton = campanaBoton();
  if (!herramientas || !boton) return;

  boton.setAttribute("aria-label", "Notificaciones");
  boton.setAttribute("aria-haspopup", "true");
  boton.setAttribute("aria-expanded", "false");

  const menuBoton = document.getElementById("client-account-trigger");
  const menu = document.getElementById("client-account-menu");
  if (menuBoton && menu) {
    menuBoton.addEventListener("click", (e) => {
      e.stopPropagation();
      cerrarPanelNotificaciones();
      menu.hidden = !menu.hidden;
      menuBoton.setAttribute("aria-expanded", String(!menu.hidden));
      if (!menu.hidden) menu.querySelector("button")?.focus();
    });

    menu.addEventListener("keydown", (e) => {
      const opciones = [...menu.querySelectorAll('[role="menuitem"]')];
      const indice = opciones.indexOf(document.activeElement);
      if (!opciones.length) return;
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        const paso = e.key === "ArrowDown" ? 1 : -1;
        opciones[(indice + paso + opciones.length) % opciones.length].focus();
      } else if (e.key === "Home") {
        e.preventDefault();
        opciones[0].focus();
      } else if (e.key === "End") {
        e.preventDefault();
        opciones[opciones.length - 1].focus();
      }
    });

    menu.addEventListener("click", (e) => {
      const opcion = e.target.closest("[data-client-account-action]");
      if (!opcion) return;
      cerrarMenuCuentaCliente();
      if (opcion.dataset.clientAccountAction === "profile") {
        go("profile");
      } else if (opcion.dataset.clientAccountAction === "logout") {
        clienteActual = null;
        go("landing");
      }
    });
  }

  boton.addEventListener("click", (e) => {
    e.stopPropagation();
    if (panelNotificaciones()) cerrarPanelNotificaciones();
    else abrirPanelNotificaciones();
  });

  // Cierra el panel al hacer clic fuera o con Escape
  document.addEventListener("click", (e) => {
    const panel = panelNotificaciones();
    if (panel && !panel.contains(e.target)) cerrarPanelNotificaciones();
    if (menu && !herramientas.contains(e.target)) cerrarMenuCuentaCliente();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    cerrarPanelNotificaciones();
    if (menu && !menu.hidden) {
      cerrarMenuCuentaCliente();
      menuBoton?.focus();
    }
  });

  // La campana se refresca cada vez que cambia el contenido (consignar, transferir, pagar...)
  const contenido = document.getElementById("client-content");
  if (contenido) {
    new MutationObserver(() => actualizarCampana()).observe(contenido, { childList: true, subtree: true });
  }
});


