/* MOVA — js/ui/tarjeta.js (HU-06: tarjeta de crédito)
   Pantalla: card (Tarjeta de crédito). */

let cardNotice = null;

function escapeCardHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (caracter) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[caracter]);
}

function tarjetaActual() {
  return clienteActual?.buscarProductoPorCodigo("tarjeta") || null;
}

function cardNoticeHtml() {
  if (!cardNotice) return "";
  const clase = cardNotice.tipo === "success" ? "success" : "error";
  const titulo = cardNotice.tipo === "success" ? "Operación exitosa" : "No se pudo completar";
  return `<div class="notice ${clase}" role="status" aria-live="polite">
    <i data-icon="${cardNotice.tipo === "success" ? "check" : "shield"}"></i>
    <div><b>${titulo}</b><span>${escapeCardHtml(cardNotice.mensaje)}</span></div>
    <button type="button" id="card-notice-close" aria-label="Cerrar">×</button>
  </div>`;
}

function cardHtml() {
  const tarjeta = tarjetaActual();
  if (!tarjeta) {
    return `
      <div class="page-heading"><div>
        <div class="eyebrow"><span></span> Crédito inteligente</div>
        <h1>Mi tarjeta</h1>
        <p>Aún no tienes una tarjeta de crédito asociada.</p>
      </div></div>
      <div id="card-notice">${cardNoticeHtml()}</div>
      <section class="panel transfer-success">
        <i data-icon="card" data-size="34"></i>
        <h2>Solicita tu tarjeta</h2>
        <p>Al abrirla podrás consultar tu cupo, hacer compras a cuotas y pagar tu deuda.</p>
        <button class="btn btn-primary" id="card-open-btn"><span>Abrir tarjeta de crédito</span></button>
      </section>`;
  }

  const porcentajeUso = tarjeta.cupoTotal > 0 ? Math.min(100, Math.max(0, tarjeta.capitalUtilizado / tarjeta.cupoTotal * 100)) : 0;
  const compras = tarjeta.historial().filter((movimiento) => movimiento.tipo === "Compra en cuotas");
  const planes = tarjeta.planesPago;
  const abonos = tarjeta.abonos;
  const totalAbonado = abonos.reduce((suma, movimiento) => suma + (movimiento.detalle.valorPagado ?? movimiento.monto), 0);
  const ultimosDigitos = escapeCardHtml(tarjeta.numero.slice(-4));
  const nombre = escapeCardHtml(clienteActual.nombre);

  return `
  <div class="page-heading">
    <div><div class="eyebrow"><span></span> Crédito inteligente</div><h1>Mi tarjeta</h1><p>Controla tu cupo, deuda y compras en un mismo lugar.</p></div>
    <button class="btn btn-primary" type="button" data-card-scroll="card-purchase-form"><span>Realizar compra</span></button>
  </div>
  <div id="card-notice">${cardNoticeHtml()}</div>
  <div class="card-layout">
    <div class="credit-card-large">
      <div><div class="logo"><svg viewBox="0 0 40 32" aria-hidden="true"><path d="M3 26 13 7l7 12L27 6l10 20h-8l-3-6-6 10-7-11-4 7Z" /></svg></div><span>MOVA</span></div>
      <p>•••• •••• •••• ${ultimosDigitos}</p><small>${nombre} <b>CRÉDITO</b></small>
    </div>
    <section class="panel credit-stats" aria-label="Resumen de tarjeta">
      <div><span>Cupo total</span><strong>${formatMoney(tarjeta.cupoTotal)}</strong></div>
      <div><span>Cupo disponible</span><strong class="teal">${formatMoney(tarjeta.cupoDisponible)}</strong></div>
      <div><span>Deuda actual</span><strong>${formatMoney(tarjeta.deuda)}</strong></div>
      <div class="usage"><span>Utilización del cupo <b>${porcentajeUso.toFixed(1)} %</b></span><i><em style="width: ${porcentajeUso}%"></em></i><small>${porcentajeUso < 30 ? "Tu nivel de uso es saludable" : "Porcentaje del cupo utilizado"}</small></div>
    </section>
  </div>
  <div class="dashboard-grid">
    <section class="panel" id="card-purchase-form">
      <div class="panel-title"><div><h2>Realizar compra</h2><p>Simula tus cuotas antes de confirmar.</p></div></div>
      <form id="card-buy-form">
        <label class="field" for="card-buy-value"><span>Valor de la compra</span><div class="field-control"><input id="card-buy-value" name="valor" type="number" min="1" step="1" required inputmode="numeric" placeholder="250000" /></div></label>
        <label class="field" for="card-buy-installments"><span>Número de cuotas (1–36)</span><div class="field-control"><input id="card-buy-installments" name="cuotas" type="number" min="1" max="36" step="1" required value="1" inputmode="numeric" /></div></label>
        <label class="field" for="card-buy-description"><span>Descripción</span><div class="field-control"><input id="card-buy-description" name="descripcion" type="text" maxlength="100" placeholder="Ej. Compra de mercado" /></div></label>
        <div class="info-note" id="card-buy-preview" aria-live="polite">Ingresa el valor para ver tu cuota y el total.</div>
        <button class="btn btn-primary full" type="submit"><span>Comprar</span></button>
      </form>
    </section>
    <section class="panel installment">
      <div class="panel-title"><div><h2>Pagar tarjeta</h2><p>Deuda actual: ${formatMoney(tarjeta.deuda)}</p></div></div>
      <form id="card-pay-form">
        <label class="field" for="card-pay-value"><span>Valor del pago</span><div class="field-control"><input id="card-pay-value" name="valor" type="number" min="1" max="${Math.max(0, tarjeta.deuda)}" step="1" required inputmode="numeric" placeholder="250000" ${tarjeta.deuda <= 0 ? "disabled" : ""} /></div></label>
        <button class="btn btn-primary full" type="submit" ${tarjeta.deuda <= 0 ? "disabled" : ""}><span>Pagar tarjeta</span></button>
      </form>
      <div class="rates">
        <b>Próximo pago estimado</b>
        <strong>${tarjeta.proximoPagoEstimado > 0 ? formatMoney(tarjeta.proximoPagoEstimado) : "No tienes pagos pendientes"}</strong>
        ${tarjeta.proximoPagoEstimado > 0 ? "<span>Suma de la siguiente cuota de cada compra activa</span>" : ""}
        <hr /><b>Tasas por número de cuotas</b><span>1–2 cuotas <em>0 %</em></span><span>3–6 cuotas <em>1,9 % mensual</em></span><span>7–36 cuotas <em>2,3 % mensual</em></span>
      </div>
    </section>
  </div>
  <section class="panel spaced">
    <div class="panel-title"><div><h2>Planes de pago activos</h2><p>Cuotas pendientes por compra</p></div></div>
    ${planes.length ? `<div class="movement-list">${planes.map((plan) => {
      const fecha = plan.fecha instanceof Date ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(plan.fecha) : "";
      return `<div class="movement"><i class="purple" data-icon="card" data-size="18"></i><div><b>${escapeCardHtml(plan.descripcion)}</b><small>${fecha} · ${plan.cuotasPendientes} de ${plan.cuotasTotales} cuotas pendientes · Próxima: ${formatMoney(plan.proximaCuota)}</small></div><strong>${formatMoney(plan.saldoPendiente)}</strong></div>`;
    }).join("")}</div>` : "<p>No tienes planes de pago pendientes.</p>"}
  </section>
  <section class="panel spaced">
    <div class="panel-title"><div><h2>Abonos realizados</h2><p>${abonos.length} pagos · Total abonado: ${formatMoney(totalAbonado)}</p></div></div>
    ${abonos.length ? `<div class="movement-list">${abonos.slice(0, 5).map((movimiento) => {
      const fecha = movimiento.fecha instanceof Date ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(movimiento.fecha) : "";
      const valor = movimiento.detalle.valorPagado ?? movimiento.monto;
      return `<div class="movement"><i class="green" data-icon="check" data-size="18"></i><div><b>Abono a tarjeta</b><small>${fecha} · Capital: ${formatMoney(movimiento.detalle.capitalAbonado ?? movimiento.monto)} · Intereses: ${formatMoney(movimiento.detalle.interesesAbonados || 0)}</small></div><strong>${formatMoney(valor)}</strong></div>`;
    }).join("")}</div>` : "<p>Aún no has realizado abonos.</p>"}
  </section>
  <section class="panel spaced">
    <div class="panel-title"><div><h2>Compras recientes</h2><p>Compras en cuotas registradas en tu tarjeta</p></div></div>
    ${compras.length ? `<div class="movement-list">${compras.slice(0, 5).map((movimiento) => {
      const detalle = movimiento.detalle || {};
      const cuotas = Number(detalle.cuotas) || 1;
      const tasa = (Number(detalle.tasaMensual) || 0) * 100;
      const fecha = movimiento.fecha instanceof Date ? new Intl.DateTimeFormat("es-CO", { dateStyle: "medium" }).format(movimiento.fecha) : "";
      return `<div class="movement"><i class="purple" data-icon="card" data-size="18"></i><div><b>${escapeCardHtml(detalle.descripcion || "Compra")}</b><small>${fecha} · ${cuotas} cuotas · ${tasa.toLocaleString("es-CO", { maximumFractionDigits: 1 })} % mensual · Cuota: ${formatMoney(Number(detalle.cuotaMensual) || 0)}</small></div><strong>${formatMoney(Math.abs(movimiento.monto))}</strong></div>`;
    }).join("")}</div>` : "<p>Todavía no tienes compras con esta tarjeta.</p>"}
  </section>`;
}

function actualizarVistaPreviaCompra() {
  const valor = Number(document.getElementById("card-buy-value")?.value);
  const cuotas = Number(document.getElementById("card-buy-installments")?.value);
  const vista = document.getElementById("card-buy-preview");
  if (!vista) return;
  if (!Number.isFinite(valor) || valor <= 0 || !Number.isInteger(valor) || !Number.isInteger(cuotas) || cuotas < 1 || cuotas > 36) {
    vista.textContent = "Ingresa un valor mayor a cero y entre 1 y 36 cuotas.";
    return;
  }
  const tasa = TarjetaCredito.tasaPorCuotas(cuotas);
  const cuota = TarjetaCredito.calcularCuota(valor, cuotas);
  vista.textContent = `Tasa: ${(tasa * 100).toLocaleString("es-CO", { maximumFractionDigits: 1 })} % mensual · Cuota mensual: ${formatMoney(cuota)} · Total: ${formatMoney(TarjetaCredito.calcularTotal(valor, cuotas))}`;
}

function mostrarAvisoTarjeta(tipo, mensaje) {
  cardNotice = { tipo, mensaje };
  renderClientScreen("card");
  document.getElementById("card-notice-close")?.addEventListener("click", () => {
    cardNotice = null;
    const aviso = document.getElementById("card-notice");
    if (aviso) aviso.innerHTML = "";
  });
}

function wireCardScreen() {
  const tarjeta = tarjetaActual();
  document.querySelectorAll("#client-content [data-card-scroll]").forEach((boton) => boton.addEventListener("click", () => {
    document.getElementById(boton.dataset.cardScroll)?.scrollIntoView({ behavior: "smooth", block: "start" });
    document.getElementById("card-buy-value")?.focus({ preventScroll: true });
  }));

  document.getElementById("card-open-btn")?.addEventListener("click", () => {
    try {
      sistema.abrirProducto(clienteActual, "tarjeta");
      mostrarAvisoTarjeta("success", "Tu tarjeta de crédito quedó abierta.");
    } catch (error) {
      mostrarAvisoTarjeta("error", error.message);
    }
  });
  if (!tarjeta) return;

  document.getElementById("card-buy-value")?.addEventListener("input", actualizarVistaPreviaCompra);
  document.getElementById("card-buy-installments")?.addEventListener("input", actualizarVistaPreviaCompra);
  document.getElementById("card-buy-form")?.addEventListener("submit", (evento) => {
    evento.preventDefault();
    try {
      const valor = Number(document.getElementById("card-buy-value").value);
      const cuotas = Number(document.getElementById("card-buy-installments").value);
      const descripcion = document.getElementById("card-buy-description").value.trim() || "Compra";
      if (!Number.isInteger(cuotas) || cuotas < 1 || cuotas > 36) throw new Error("El número de cuotas debe estar entre 1 y 36.");
      const resultado = sistema.comprarConTarjeta(clienteActual, tarjeta.numero, valor, cuotas, descripcion);
      const tasa = (resultado.tasaMensual * 100).toLocaleString("es-CO", { maximumFractionDigits: 1 });
      mostrarAvisoTarjeta("success", `Compra aprobada. Cuota mensual: ${formatMoney(resultado.cuotaMensual)} por ${resultado.cuotas} cuotas, tasa ${tasa} % mensual, total: ${formatMoney(resultado.totalAPagar)}.`);
    } catch (error) {
      mostrarAvisoTarjeta("error", error.message);
    }
  });
  document.getElementById("card-pay-form")?.addEventListener("submit", (evento) => {
    evento.preventDefault();
    try {
      const valor = Number(document.getElementById("card-pay-value").value);
      sistema.pagarTarjeta(clienteActual, tarjeta.numero, valor);
      mostrarAvisoTarjeta("success", `Pago aplicado por ${formatMoney(valor)}.`);
    } catch (error) {
      mostrarAvisoTarjeta("error", error.message);
    }
  });
}

registrarPantalla("card", cardHtml, wireCardScreen);
