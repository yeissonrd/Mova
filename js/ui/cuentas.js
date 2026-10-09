/* MOVA — js/ui/cuentas.js  (HU-04 cuenta de ahorros, HU-05 cuenta corriente)
   Pantalla: accounts (Mis cuentas). */

function accountsHtml() {
  return `
  <div class="page-heading">
    <div>
      <div class="eyebrow"><span></span> Tus productos</div>
      <h1>Mis cuentas</h1>
      <p>Consulta saldos, movimientos y acciones disponibles.</p>
    </div>
  </div>
  <div id="accounts-notice"></div>
  <div class="account-detail-grid">
    <section class="panel account-detail featured">
      <div class="account-detail-top"><i data-icon="wallet"></i><span>Cuenta de ahorros</span><small>ACTIVA</small></div>
      <p>Saldo disponible</p>
      <h2>${formatMoney(3250000)}</h2>
      <div class="account-number"><span>Número de cuenta</span><b>0550 4832 91</b></div>
      <div class="account-buttons">
        <button class="btn btn-primary" data-notice="ahorros-consignar"><i data-icon="plus" data-size="18"></i><span>Consignar</span></button>
        <button class="btn btn-secondary" data-notice="ahorros-retirar"><i data-icon="minus" data-size="18"></i><span>Retirar</span></button>
      </div>
      <div class="rule-note"><i data-icon="shield" data-size="17"></i> Los retiros aplican una tasa del 1,5 %.</div>
    </section>
    <section class="panel account-detail">
      <div class="account-detail-top"><i data-icon="wallet"></i><span>Cuenta corriente</span><small>ACTIVA</small></div>
      <p>Saldo disponible</p>
      <h2>${formatMoney(1720500)}</h2>
      <div class="account-number"><span>Número de cuenta</span><b>0550 9104 27</b></div>
      <div class="account-buttons">
        <button class="btn btn-primary" data-notice="corriente-consignar"><i data-icon="plus" data-size="18"></i><span>Consignar</span></button>
        <button class="btn btn-secondary" data-notice="corriente-retirar"><i data-icon="minus" data-size="18"></i><span>Retirar</span></button>
      </div>
      <div class="rule-note"><i data-icon="shield" data-size="17"></i> Sobregiro disponible: hasta 20 % adicional.</div>
    </section>
  </div>
  <section class="panel spaced">
    <div class="panel-title">
      <div><h2>Movimientos de cuentas</h2><p>Ordenados del más reciente al más antiguo</p></div>
      <button data-go="movements">Ver historial completo</button>
    </div>
    ${movementListHtml()}
  </section>`;
}

const ACCOUNTS_NOTICES = {
  "ahorros-consignar": "La consignación se realizó correctamente.",
  "ahorros-retirar": "Retiro aprobado. Se aplicó la tasa del 1,5 %.",
  "corriente-consignar": "La consignación se realizó correctamente.",
  "corriente-retirar": "Retiro aprobado desde tu cuenta corriente.",
};

function wireAccounts() {
  document.querySelectorAll("#client-content [data-notice]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const msg = ACCOUNTS_NOTICES[btn.dataset.notice];
      document.getElementById("accounts-notice").innerHTML = `
        <div class="notice success">
          <i data-icon="check"></i>
          <div><b>Operación exitosa</b><span>${msg}</span></div>
          <button id="accounts-notice-close">×</button>
        </div>`;
      renderIcons(document.getElementById("accounts-notice"));
      document.getElementById("accounts-notice-close").addEventListener("click", () => {
        document.getElementById("accounts-notice").innerHTML = "";
      });
    });
  });
}

registrarPantalla("accounts", accountsHtml, wireAccounts);
