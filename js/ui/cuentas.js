/* MOVA — js/ui/cuentas.js  (HU-04 cuenta de ahorros, HU-05 cuenta corriente)
   Pantalla: accounts (Mis cuentas). */

/* ===================== DATOS REALES DEL CLIENTE ===================== */

// Cliente con sesión iniciada (lo crean sistema y clienteActual de HU-02). Si no hay, devuelve null.
function clienteCuentas() {
  const hayDatos = typeof sistema !== "undefined" && typeof clienteActual !== "undefined";
  return hayDatos ? clienteActual : null;
}

// Convierte lo que escribe el usuario ("250.000", "$ 250000") en número.
function leerValor(texto) {
  return Number(String(texto).replace(/\D/g, ""));
}

function cuentasDelCliente(cliente) {
  return cliente.productos.filter((p) => p.codigo === "ahorros" || p.codigo === "corriente");
}

// Nota con la regla de cada tipo de cuenta.
function notaCuentaHtml(p) {
  const texto =
    p.codigo === "ahorros"
      ? "Los retiros aplican un interés del 1,5 %."
      : p.saldo <= 0
        ? "No puedes retirar hasta volver a consignar (tu saldo está en 0 o negativo)."
        : `Sobregiro: puedes retirar hasta ${formatMoney(p.limiteRetiro())} (saldo + 20 %).`;
  return `<div class="rule-note"><i data-icon="shield" data-size="17"></i> ${texto}</div>`;
}

function cuentaCardHtml(p, destacada) {
  return `
    <section class="panel account-detail${destacada ? " featured" : ""}">
      <div class="account-detail-top"><i data-icon="wallet"></i><span>${p.tipo}</span><small>ACTIVA</small></div>
      <p>Saldo disponible</p>
            <h2${p.saldo < 0 ? ' style="color:var(--red)"' : ""}>${formatMoney(p.saldo)}</h2>
      <div class="account-number"><span>Número de cuenta</span><b>${p.numero}</b></div>
      <label class="field" style="margin:16px 0 0"><span>Valor</span>
        <div class="field-control"><input id="cuenta-valor-${p.numero}" inputmode="numeric" placeholder="$ 250.000" /></div>
      </label>
      <div class="account-buttons">
        <button class="btn btn-primary" data-op="consignar" data-numero="${p.numero}"><i data-icon="plus" data-size="18"></i><span>Consignar</span></button>
        <button class="btn btn-secondary" data-op="retirar" data-numero="${p.numero}"><i data-icon="minus" data-size="18"></i><span>Retirar</span></button>
      </div>
      ${notaCuentaHtml(p)}
    </section>`;
}

// Movimientos de las cuentas (ahorros y corriente), del más reciente al más antiguo.
function movimientosCuentasHtml(cuentas) {
  const items = cuentas
    .flatMap((p) => p.historial())
    .sort((a, b) => b.fecha - a.fecha)
    .slice(0, 8);
  if (items.length === 0) return `<p class="empty">Aún no tienes movimientos.</p>`;
  return `<div class="movement-list">${items
    .map(
      (m) => `
    <div class="movement">
      <i class="${m.esIngreso ? "green" : "red"}" data-icon="${m.esIngreso ? "plus" : "minus"}" data-size="18"></i>
      <div><b>${m.tipo}</b><small>${m.fecha.toLocaleString("es-CO", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</small></div>
      <strong class="${m.esIngreso ? "positive" : ""}">${m.esIngreso ? "+" : "−"} ${formatMoney(Math.abs(m.monto))}</strong>
    </div>`,
    )
    .join("")}</div>`;
}

/* ===================== MIS CUENTAS ===================== */
function accountsHtml() {
  const cliente = clienteCuentas();
  const cuentas = cuentasDelCliente(cliente);
  const tieneAhorros = cuentas.some((p) => p.codigo === "ahorros");
  const tieneCorriente = cuentas.some((p) => p.codigo === "corriente");
  return `
  <div class="page-heading">
    <div>
      <div class="eyebrow"><span></span> Tus productos</div>
      <h1>Mis cuentas</h1>
      <p>Consulta saldos, movimientos y acciones disponibles.</p>
    </div>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
      ${tieneAhorros ? "" : `<button class="btn btn-primary" id="abrir-ahorros"><span>Abrir cuenta de ahorros</span></button>`}
      ${tieneCorriente ? "" : `<button class="btn btn-primary" id="abrir-corriente"><span>Abrir cuenta corriente</span></button>`}
    </div>
  </div>
  <div id="accounts-notice"></div>
  <div class="account-detail-grid">
    ${cuentas.map((p, i) => cuentaCardHtml(p, i === 0)).join("") || `<p class="empty">Aún no tienes cuentas.</p>`}
  </div>
  <section class="panel spaced">
    <div class="panel-title">
      <div><h2>Movimientos de cuentas</h2><p>Ordenados del más reciente al más antiguo</p></div>
      <button data-go="movements">Ver historial completo</button>
    </div>
    ${movimientosCuentasHtml(cuentas)}
  </section>`;
}

// Muestra un aviso verde (ok = true) o rojo (ok = false) arriba de las cuentas.
function mostrarAvisoCuentas(titulo, mensaje, ok) {
  const estilo = ok ? "" : ` style="color:var(--red);background:#fdeeee;border:1px solid #f3c4c4"`;
  const caja = document.getElementById("accounts-notice");
  caja.innerHTML = `
    <div class="notice success"${estilo}>
      <i data-icon="${ok ? "check" : "shield"}"></i>
      <div><b>${titulo}</b><span>${mensaje}</span></div>
      <button id="accounts-notice-close">×</button>
    </div>`;
  renderIcons(caja);
  document.getElementById("accounts-notice-close").addEventListener("click", () => {
    caja.innerHTML = "";
  });
}

// Consignar o retirar usando Sistema (que valida, aplica el interés y guarda).
function operarCuenta(operacion, numero) {
  const valor = leerValor(document.getElementById(`cuenta-valor-${numero}`).value);
  try {
    const movimiento =
      operacion === "consignar"
        ? sistema.consignar(clienteActual, numero, valor)
        : sistema.retirar(clienteActual, numero, valor);

    let mensaje = `${operacion === "consignar" ? "Consignaste" : "Retiraste"} ${formatMoney(valor)}.`;
    if (movimiento.detalle && movimiento.detalle.interes) {
      mensaje += ` Se cobró un interés de ${formatMoney(movimiento.detalle.interes)}.`;
    }
    mensaje += ` Nuevo saldo: ${formatMoney(clienteActual.buscarProducto(numero).saldo)}.`;

    renderClientScreen("accounts"); // vuelve a dibujar con los saldos nuevos
    mostrarAvisoCuentas("Operación exitosa", mensaje, true);
  } catch (error) {
    mostrarAvisoCuentas("No se pudo completar", error.message, false);
  }
}

function wireAccounts() {
  document.querySelectorAll("#client-content [data-op]").forEach((btn) => {
    btn.addEventListener("click", () => operarCuenta(btn.dataset.op, btn.dataset.numero));
  });

  const abrir = document.getElementById("abrir-ahorros");
  if (abrir) {
    abrir.addEventListener("click", () => {
      sistema.abrirProducto(clienteActual, "ahorros");
      renderClientScreen("accounts");
    });
  }
    const abrirCorriente = document.getElementById("abrir-corriente");
  if (abrirCorriente) {
    abrirCorriente.addEventListener("click", () => {
      sistema.abrirProducto(clienteActual, "corriente");
      renderClientScreen("accounts");
    });
  }
}

registrarPantalla("accounts", accountsHtml, wireAccounts);
