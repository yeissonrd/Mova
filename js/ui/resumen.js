/* MOVA — js/ui/resumen.js  (HU-03: resumen de cuentas y movimientos)
   Pantallas: dashboard (Resumen) y movements (Movimientos). */

function dashboardHtml() {
  return `
  <div class="page-heading">
    <div>
      <div class="eyebrow"><span></span> Mi panorama financiero</div>
      <h1>Hola, Juan. Todo bajo control.</h1>
      <p>Este es el resumen de tus finanzas hoy, 14 de junio.</p>
    </div>
    <button class="btn btn-secondary"><i data-icon="download" data-size="18"></i><span>Descargar extracto</span></button>
  </div>
  <section class="balance-hero">
    <div>
      <span>Saldo total disponible <i data-icon="eye" data-size="17"></i></span>
      <strong>${formatMoney(4970500)}</strong>
      <small><i>↑ 8,4 %</i> frente al mes pasado</small>
    </div>
    <div class="balance-chart">
      <span style="height:35%"></span><span style="height:52%"></span><span style="height:45%"></span>
      <span style="height:72%"></span><span style="height:61%"></span><span style="height:90%"></span>
      <small>Abr</small><small>May</small><small>Jun</small>
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
        <div><h2>Tus productos</h2><p>3 productos activos</p></div>
        <button data-go="accounts">Ver todos</button>
      </div>
      <div class="account-row" data-go="accounts">
        <i class="mint-bg" data-icon="wallet"></i>
        <div><b>Cuenta de ahorros</b><small>•••• 4832</small></div>
        <span><small>Saldo disponible</small><strong>${formatMoney(3250000)}</strong></span>
        <i data-icon="chevron" data-size="18"></i>
      </div>
      <div class="account-row" data-go="accounts">
        <i class="blue-bg" data-icon="wallet"></i>
        <div><b>Cuenta corriente</b><small>•••• 9104</small></div>
        <span><small>Saldo disponible</small><strong>${formatMoney(1720500)}</strong></span>
        <i data-icon="chevron" data-size="18"></i>
      </div>
      <div class="credit-mini" data-go="card">
        <div><div class="logo"><svg viewBox="0 0 40 32" aria-hidden="true"><path d="M3 26 13 7l7 12L27 6l10 20h-8l-3-6-6 10-7-11-4 7Z" /></svg></div><span>CRÉDITO</span></div>
        <b>•••• •••• •••• 2749</b>
        <small>JUAN GÓMEZ <em>VISA</em></small>
      </div>
    </section>
    <section class="panel">
      <div class="panel-title">
        <div><h2>Últimos movimientos</h2><p>Actividad reciente</p></div>
        <button data-go="movements">Ver todos</button>
      </div>
      ${movementListHtml(4)}
    </section>
  </div>`;
}

function movementsHtml() {
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
      <div class="search"><i data-icon="search" data-size="18"></i><input placeholder="Buscar movimiento" /></div>
      <select><option>Todos los productos</option><option>Cuenta de ahorros</option><option>Cuenta corriente</option></select>
      <select><option>Últimos 30 días</option><option>Últimos 3 meses</option></select>
    </div>
    <div class="date-label">HOY · 14 DE JUNIO</div>
    ${movementListHtml(2)}
    <div class="date-label">ESTA SEMANA</div>
    ${movementListHtml()}
  </section>`;
}

registrarPantalla("dashboard", dashboardHtml);
registrarPantalla("movements", movementsHtml);
