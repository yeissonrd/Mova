/* MOVA — js/ui/admin.js  (HU-01: administrador gestiona clientes)
   Panel del administrador: lista de clientes reales, búsqueda y bloqueo. */

// Evita que un nombre con símbolos rompa el HTML de la tabla.
function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inicialesDe(nombre) {
  const palabras = String(nombre).split(/\s+/).filter(Boolean);
  let iniciales = palabras[0] ? palabras[0][0] : "";
  if (palabras.length > 1) iniciales += palabras[palabras.length - 1][0];
  return iniciales.toUpperCase();
}

// Texto escrito en el buscador del panel.
function textoBuscadorAdmin() {
  const campo = document.querySelector("#screen-admin .search input");
  return campo ? campo.value : "";
}

// Mensaje arriba de la tabla: verde si ok es true, rojo si es false. Sin mensaje, se oculta.
function avisoAdmin(mensaje, ok) {
  let caja = document.getElementById("admin-aviso");
  if (!caja) {
    caja = document.createElement("p");
    caja.id = "admin-aviso";
    caja.style.margin = "0 0 12px";
    caja.style.padding = "10px 14px";
    caja.style.borderRadius = "10px";
    const tabla = document.querySelector("#screen-admin .client-table");
    tabla.parentNode.insertBefore(caja, tabla);
  }
  if (!mensaje) {
    caja.style.display = "none";
    return;
  }
  caja.textContent = mensaje;
  caja.style.display = "block";
  caja.style.color = ok ? "#0f6b57" : "#d93025";
  caja.style.background = ok ? "#e6f6f1" : "#fdeeee";
}

// Métricas del panel, calculadas desde sistema.clientes.
function pintarMetricasAdmin() {
  const clientes = sistema.clientes;
  const productos = clientes.reduce((suma, c) => suma + c.productos.length, 0);
  const bloqueados = clientes.filter((c) => c.estaBloqueado()).length;
  const numeros = document.querySelectorAll("#screen-admin .admin-metrics b");
  const notas = document.querySelectorAll("#screen-admin .admin-metrics em");
  if (numeros.length >= 3) {
    numeros[0].textContent = clientes.length;
    numeros[1].textContent = productos;
    numeros[2].textContent = bloqueados;
  }
  if (notas.length >= 3) {
    notas[0].textContent = "clientes registrados";
    notas[1].textContent = "productos abiertos";
    notas[2].textContent = bloqueados > 0 ? "Requieren revisión" : "Ninguno bloqueado";
  }
}

// Tabla de clientes reales (filtrada por el buscador).
function pintarFilasAdmin() {
  const wrap = document.getElementById("admin-client-rows");
  const clientes = sistema.buscarClientes(textoBuscadorAdmin());
  if (clientes.length === 0) {
    wrap.innerHTML = `<p class="empty">No hay clientes para mostrar.</p>`;
    return;
  }
  wrap.innerHTML = clientes
    .map((c) => {
      const bloqueado = c.estaBloqueado();
      const n = c.productos.length;
      return `
    <div class="client-row">
      <div><i>${inicialesDe(c.nombre)}</i><span><b>${escaparHtml(c.nombre)}</b><small>${escaparHtml(c.correo)}</small></span></div>
      <span>${escaparHtml(c.identificacion)}</span>
      <span>${n} ${n === 1 ? "producto" : "productos"}</span>
      <span><em class="${bloqueado ? "blocked" : "active"}">${bloqueado ? "Bloqueado" : "Activo"}</em></span>
      <div class="row-actions">
        <button title="Ver productos"><i data-icon="eye" data-size="17"></i></button>
        <button title="Editar"><i data-icon="settings" data-size="17"></i></button>
        <button title="${bloqueado ? "Desbloquear" : "Bloquear"}" data-toggle-block="${escaparHtml(c.userName)}"><i data-icon="${bloqueado ? "check" : "lock"}" data-size="17"></i></button>
      </div>
    </div>`;
    })
    .join("");
  renderIcons(wrap);
  wrap.querySelectorAll("[data-toggle-block]").forEach((btn) => {
    btn.addEventListener("click", () => alternarBloqueoAdmin(btn.dataset.toggleBlock));
  });
}

// Bloquea o desbloquea al cliente usando el administrador (el Sistema guarda).
function alternarBloqueoAdmin(userName) {
  try {
    const cliente = sistema.buscarCliente(userName);
    if (cliente.estaBloqueado()) {
      adminActual.desbloquearCliente(userName);
      avisoAdmin(`Cliente ${cliente.nombre} desbloqueado.`, true);
    } else {
      adminActual.bloquearCliente(userName);
      avisoAdmin(`Cliente ${cliente.nombre} bloqueado.`, true);
    }
  } catch (error) {
    avisoAdmin(error.message, false);
  }
  pintarPanelAdmin();
}

// Dibuja todo el panel. Se llama al entrar como administrador y después de cada cambio.
function pintarPanelAdmin() {
  pintarMetricasAdmin();
  pintarFilasAdmin();
}

alIniciar(() => {
  const buscador = document.querySelector("#screen-admin .search input");
  if (buscador) buscador.addEventListener("input", pintarFilasAdmin);
});