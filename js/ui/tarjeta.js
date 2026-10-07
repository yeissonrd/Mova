/* MOVA — js/ui/tarjeta.js  (HU-06: tarjeta de crédito)
   Pantalla: card (Tarjeta de crédito). */

function cardHtml() {
  return `
  <div class="page-heading">
    <div>
      <div class="eyebrow"><span></span> Crédito inteligente</div>
      <h1>Mi tarjeta</h1>
      <p>Controla tu cupo, deuda y compras en un mismo lugar.</p>
    </div>
    <button class="btn btn-primary"><span>Realizar compra</span></button>
  </div>
  <div class="card-layout">
    <div class="credit-card-large">
      <div><div class="logo"><svg viewBox="0 0 40 32" aria-hidden="true"><path d="M3 26 13 7l7 12L27 6l10 20h-8l-3-6-6 10-7-11-4 7Z" /></svg></div><span>PLATINUM</span></div>
      <p>•••• •••• •••• 2749</p>
      <small>JUAN GÓMEZ <b>VISA</b></small>
    </div>
    <section class="panel credit-stats">
      <div><span>Cupo total</span><strong>${formatMoney(6000000)}</strong></div>
      <div><span>Cupo disponible</span><strong class="teal">${formatMoney(4320000)}</strong></div>
      <div><span>Deuda actual</span><strong>${formatMoney(1680000)}</strong></div>
      <div class="usage">
        <span>Utilización del cupo <b>28 %</b></span>
        <i><em></em></i>
        <small>Tu nivel de uso es saludable</small>
      </div>
    </section>
  </div>
  <div class="dashboard-grid">
    <section class="panel">
      <div class="panel-title"><div><h2>Compras recientes</h2><p>Consumos con tu tarjeta</p></div></div>
      ${movementListHtml(3)}
    </section>
    <section class="panel installment">
      <div class="panel-title"><div><h2>Próximo pago</h2><p>Fecha límite: 28 de junio</p></div></div>
      <strong>${formatMoney(384200)}</strong>
      <span>Cuota mensual estimada</span>
      <button class="btn btn-primary full">Pagar tarjeta</button>
      <div class="rates">
        <b>Tasas por número de cuotas</b>
        <span>1–2 cuotas <em>0 %</em></span>
        <span>3–6 cuotas <em>1,9 % mensual</em></span>
        <span>7+ cuotas <em>2,3 % mensual</em></span>
      </div>
    </section>
  </div>`;
}

registrarPantalla("card", cardHtml);
