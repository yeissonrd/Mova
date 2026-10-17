/* MOVA — js/ui/resumen.js  (HU-03: resumen de cuentas y movimientos)
   Pantallas: dashboard (Resumen) y movements (Movimientos). */

/* ===================== DATOS REALES DEL CLIENTE ===================== */

// Cliente que inició sesión (lo crea HU-02). Si todavía no existe, devuelve null.
function clienteResumen() {
  return typeof clienteActual !== "undefined" ? clienteActual : null;
}

// Todos los movimientos de todos los productos, del más reciente al más antiguo.
function movimientosDelCliente(cliente) {
  return cliente.productos
    .flatMap((p) => p.historial().map((m) => ({ m, producto: p })))
    .sort((a, b) => b.m.fecha - a.m.fecha);
}

function ultimos4(numero) {
  return String(numero).slice(-4);
}

function listaMovimientosHtml(items) {
  if (items.length === 0) {
    return `<p class="empty">Aún no tienes movimientos.</p>`;
  }
  return `<div class="movement-list">${items
    .map(
      ({ m }) => `
    <div class="movement">
      <i class="${m.esIngreso ? "green" : "red"}" data-icon="${m.esIngreso ? "plus" : "minus"}" data-size="18"></i>
      <div><b>${m.tipo}</b><small>${m.fecha.toLocaleString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</small></div>
      <strong class="${m.esIngreso ? "positive" : ""}">${m.esIngreso ? "+" : "−"} ${formatMoney(Math.abs(m.monto))}</strong>
    </div>`,
    )
    .join("")}</div>`;
}

function productoFilaHtml(p, color) {
  return `
      <div class="account-row" data-go="accounts">
        <i class="${color}" data-icon="wallet"></i>
        <div><b>${p.tipo}</b><small>•••• ${ultimos4(p.numero)}</small></div>
        <span><small>Saldo disponible</small><strong>${formatMoney(p.saldo)}</strong></span>
        <i data-icon="chevron" data-size="18"></i>
      </div>`;
}

function tarjetaMiniHtml(p, nombre) {
  return `
      <div class="credit-mini" data-go="card">
        <div><div class="logo"><svg viewBox="0 0 40 32" aria-hidden="true"><path d="M3 26 13 7l7 12L27 6l10 20h-8l-3-6-6 10-7-11-4 7Z" /></svg></div><span>CRÉDITO</span></div>
        <b>•••• •••• •••• ${ultimos4(p.numero)}</b>
        <small>${nombre.toUpperCase()} <em>VISA</em></small>
      </div>`;
}

/* ===================== RESUMEN (dashboard) ===================== */
function dashboardHtml() {
  const cliente = clienteResumen();
  const productos = cliente.productos;
  const colores = ["mint-bg", "blue-bg"];
  const filas = productos
    .filter((p) => p.codigo !== "tarjeta")
    .map((p, i) => productoFilaHtml(p, colores[i % colores.length]))
    .join("");
  const tarjeta = productos.find((p) => p.codigo === "tarjeta");

  return `
  <div class="page-heading">
    <div>
      <div class="eyebrow"><span></span> Mi panorama financiero</div>
      <h1>Hola, ${cliente.nombre.split(" ")[0]}. Todo bajo control.</h1>
      <p>Este es el resumen de tus finanzas de hoy.</p>
    </div>
    <button class="btn btn-secondary" id="btn-extracto"><i data-icon="download" data-size="18"></i><span>Descargar extracto</span></button>
  </div>
  <section class="balance-hero">
    <div>
      <span>Saldo total disponible <i data-icon="eye" data-size="17"></i></span>
      <strong>${formatMoney(cliente.saldoTotal)}</strong>
    </div>
  </section>
  <div class="quick-actions">
    <button data-go="transfer"><i data-icon="send"></i><span><b>Transferir</b><small>A otra cuenta</small></span><i data-icon="chevron" data-size="17"></i></button>
    <button data-go="accounts"><i data-icon="plus"></i><span><b>Consignar</b><small>Agregar dinero</small></span><i data-icon="chevron" data-size="17"></i></button>
    <button data-go="accounts"><i data-icon="minus"></i><span><b>Retirar</b><small>Desde tus cuentas</small></span><i data-icon="chevron" data-size="17"></i></button>
  </div>
  <div class="dashboard-grid">
    <section class="panel products-panel">
      <div class="panel-title">
        <div><h2>Tus productos</h2><p>${productos.length} ${productos.length === 1 ? "producto activo" : "productos activos"}</p></div>
        <button data-go="accounts">Ver todos</button>
      </div>
      ${filas}${tarjeta ? tarjetaMiniHtml(tarjeta, cliente.nombre) : ""}
    </section>
    <section class="panel">
      <div class="panel-title">
        <div><h2>Últimos movimientos</h2><p>Actividad reciente</p></div>
        <button data-go="movements">Ver todos</button>
      </div>
      ${listaMovimientosHtml(movimientosDelCliente(cliente).slice(0, 4))}
    </section>
  </div>`;
}

/* ===================== MOVIMIENTOS ===================== */
function movementsHtml() {
  const cliente = clienteResumen();
  const opciones = cliente.productos
    .map((p) => `<option value="${p.numero}">${p.tipo} •••• ${ultimos4(p.numero)}</option>`)
    .join("");

  return `
  <div class="page-heading">
    <div>
      <div class="eyebrow"><span></span> Tu actividad</div>
      <h1>Movimientos</h1>
      <p>Consulta y filtra todas tus operaciones.</p>
    </div>
    <button class="btn btn-secondary"><i data-icon="download" data-size="18"></i><span>Descargar</span></button>
  </div>
  <section class="panel history-panel">
    <div class="filters">
      <div class="search"><i data-icon="search" data-size="18"></i><input id="mov-buscar" placeholder="Buscar movimiento" /></div>
      <select id="mov-producto"><option value="">Todos los productos</option>${opciones}</select>
      <select id="mov-tipo"><option value="">Ingresos y egresos</option><option value="ingresos">Solo ingresos</option><option value="egresos">Solo egresos</option></select>
    </div>
    <div id="mov-lista"></div>
  </section>`;
}

// Filtra por texto, producto e ingreso/egreso y vuelve a pintar la lista.
function wireMovimientos() {
  const cliente = clienteResumen();
  if (!cliente) return;
  const lista = document.getElementById("mov-lista");
  const buscar = document.getElementById("mov-buscar");
  const producto = document.getElementById("mov-producto");
  const tipo = document.getElementById("mov-tipo");

  function pintar() {
    const texto = buscar.value.trim().toLowerCase();
    const items = movimientosDelCliente(cliente).filter(({ m, producto: p }) => {
      if (producto.value && String(p.numero) !== producto.value) return false;
      if (tipo.value === "ingresos" && !m.esIngreso) return false;
      if (tipo.value === "egresos" && m.esIngreso) return false;
      return !texto || m.tipo.toLowerCase().includes(texto);
    });
    lista.innerHTML = listaMovimientosHtml(items);
    renderIcons(lista);
  }

  [buscar, producto, tipo].forEach((el) => el.addEventListener("input", pintar));
  pintar();
}

registrarPantalla("dashboard", dashboardHtml);
registrarPantalla("movements", movementsHtml, wireMovimientos);
