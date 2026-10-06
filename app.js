/* MOVA — lógica de interfaz (navegación entre pantallas, datos de ejemplo e interacciones)
   Puerto del prototipo visual (React) a JavaScript plano, hecho a mano, sin frameworks. */

/* ===================== ÍCONOS ===================== */
const ICON_PATHS = {
  home: '<path d="m3 10 9-7 9 7" /><path d="M5 9v11h14V9M9 20v-6h6v6" />',
  wallet: '<path d="M4 6.5h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a3 3 0 0 1-3-3v-11a3 3 0 0 1 3-3h12v4" /><path d="M15 12h5M16.5 12h.1" />',
  card: '<rect x="2" y="4" width="20" height="16" rx="3" /><path d="M2 9h20M6 15h4" />',
  send: '<path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" />',
  history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5M12 7v5l3 2" />',
  user: '<circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" />',
  shield: '<path d="M12 2 4 5v6c0 5.2 3.3 9.3 8 11 4.7-1.7 8-5.8 8-11V5Z" /><path d="m9 12 2 2 4-5" />',
  eye: '<path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" />',
  plus: '<path d="M12 5v14M5 12h14" />',
  minus: '<path d="M5 12h14" />',
  arrow: '<path d="M5 12h14M14 7l5 5-5 5" />',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" />',
  search: '<circle cx="10.5" cy="10.5" r="7.5" /><path d="m16 16 5 5" />',
  users: '<circle cx="9" cy="8" r="4" /><path d="M2 21a7 7 0 0 1 14 0M16 5a4 4 0 0 1 0 7M18 15a6 6 0 0 1 4 6" />',
  settings: '<circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z" />',
  lock: '<rect x="4" y="10" width="16" height="12" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3M12 15v3" />',
  check: '<path d="m5 12 4 4L19 6" />',
  download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16" />',
  chevron: '<path d="m9 18 6-6-6-6" />',
  logout: '<path d="M10 17l5-5-5-5M15 12H3M14 3h6a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-6" />',
};

function iconSvg(name, size = 20) {
  const inner = ICON_PATHS[name] || "";
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

function renderIcons(root = document) {
  root.querySelectorAll("[data-icon]").forEach((el) => {
    const name = el.getAttribute("data-icon");
    const size = el.getAttribute("data-size") || 20;
    el.innerHTML = iconSvg(name, size);
  });
}

/* ===================== DATOS DE EJEMPLO ===================== */
const formatMoney = (value) =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

const MOVEMENTS = [
  { icon: "send", title: "Transferencia recibida", meta: "Hoy · 09:42 a. m.", amount: 320000, color: "blue" },
  { icon: "plus", title: "Consignación", meta: "12 jun · 04:18 p. m.", amount: 150000, color: "green" },
  { icon: "card", title: "Compra · Café Pergamino", meta: "11 jun · 10:06 a. m.", amount: -28500, color: "purple" },
  { icon: "minus", title: "Retiro en cajero", meta: "10 jun · 11:30 a. m.", amount: -200000, color: "red" },
];

const CLIENTS = [
  { initials: "JG", name: "Juan Gómez", email: "juan.gomez@correo.com", id: "1.234.567.890", products: 3, status: "Activo" },
  { initials: "MR", name: "María Rodríguez", email: "maria.r@correo.com", id: "52.481.230", products: 2, status: "Activo" },
  { initials: "CS", name: "Carlos Sánchez", email: "carlos.s@correo.com", id: "79.345.120", products: 1, status: "Bloqueado" },
  { initials: "AV", name: "Ana Valencia", email: "ana.valencia@correo.com", id: "43.907.621", products: 2, status: "Activo" },
];
let blockedClients = ["CS"];

const CLIENT_NAV = [
  { screen: "dashboard", label: "Inicio", icon: "home" },
  { screen: "accounts", label: "Mis cuentas", icon: "wallet" },
  { screen: "card", label: "Mi tarjeta", icon: "card" },
  { screen: "transfer", label: "Transferir", icon: "send" },
  { screen: "movements", label: "Movimientos", icon: "history" },
  { screen: "profile", label: "Perfil y seguridad", icon: "user" },
];

/* ===================== MOVEMENT LIST (fragmento reutilizable) ===================== */
function movementListHtml(limit) {
  const list = typeof limit === "number" ? MOVEMENTS.slice(0, limit) : MOVEMENTS;
  return `<div class="movement-list">${list
    .map(
      (m) => `
    <div class="movement">
      <i class="${m.color}" data-icon="${m.icon}" data-size="18"></i>
      <div><b>${m.title}</b><small>${m.meta}</small></div>
      <strong class="${m.amount > 0 ? "positive" : ""}">${m.amount > 0 ? "+" : "−"} ${formatMoney(Math.abs(m.amount))}</strong>
    </div>`,
    )
    .join("")}</div>`;
}

/* ===================== CONTENIDO DE CADA PANTALLA DEL CLIENTE ===================== */
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

function profileHtml() {
  return `
  <div class="page-heading">
    <div>
      <div class="eyebrow"><span></span> Tu información</div>
      <h1>Perfil y seguridad</h1>
      <p>Mantén tus datos actualizados y tu cuenta protegida.</p>
    </div>
  </div>
  <div id="profile-notice"></div>
  <div class="profile-grid">
    <aside class="panel profile-card">
      <div class="profile-avatar">JG</div>
      <h2>Juan Gómez</h2>
      <p>juan.gomez@correo.com</p>
      <span><i></i> Cliente activo</span>
      <hr />
      <small>Miembro desde</small>
      <b>Marzo de 2024</b>
    </aside>
    <div>
      <section class="panel form-panel">
        <div class="panel-title"><div><h2>Información personal</h2><p>Datos asociados a tu cuenta MOVA</p></div></div>
        <div class="form-grid">
          <label class="field"><span>Nombre completo</span><div class="field-control"><input placeholder="Juan Esteban Gómez" /></div></label>
          <label class="field"><span>Identificación</span><div class="field-control"><input placeholder="1.234.567.890" /></div></label>
          <label class="field"><span>Celular</span><div class="field-control"><input placeholder="+57 300 123 4567" /></div></label>
          <label class="field"><span>Correo electrónico</span><div class="field-control"><input placeholder="juan.gomez@correo.com" /></div></label>
          <label class="field"><span>Nombre de usuario</span><div class="field-control"><input placeholder="juangomez" /></div></label>
        </div>
        <button class="btn btn-primary" id="profile-save-btn"><span>Guardar cambios</span></button>
      </section>
      <section class="panel form-panel security-panel">
        <div class="panel-title">
          <div><h2>Contraseña y seguridad</h2><p>Te recomendamos actualizarla periódicamente</p></div>
          <i data-icon="lock"></i>
        </div>
        <div class="form-grid">
          <label class="field"><span>Contraseña actual</span><div class="field-control"><input type="password" placeholder="••••••••" /><i data-icon="eye" data-size="17"></i></div></label>
          <label class="field"><span>Nueva contraseña</span><div class="field-control"><input type="password" placeholder="Mínimo 8 caracteres" /><i data-icon="eye" data-size="17"></i></div></label>
        </div>
        <button class="btn btn-secondary"><span>Cambiar contraseña</span></button>
      </section>
    </div>
  </div>`;
}

function transferStepFieldsHtml() {
  return `
  <div class="transfer-fields">
    <label class="field"><span>Cuenta de origen</span>
      <div class="select-card"><i data-icon="wallet"></i><div><b>Ahorros •••• 4832</b><small>Disponible: ${formatMoney(3250000)}</small></div><i data-icon="chevron" data-size="16"></i></div>
    </label>
    <label class="field"><span>Beneficiario</span>
      <div class="select-card"><div class="avatar">MR</div><div><b>María Rodríguez</b><small>Cuenta de ahorros •••• 0291</small></div><i data-icon="chevron" data-size="16"></i></div>
    </label>
    <label class="field"><span>Monto a transferir</span><div class="field-control"><input placeholder="$ 250.000" /></div></label>
    <label class="field"><span>Mensaje (opcional)</span><div class="field-control"><input placeholder="Ej. Almuerzo del sábado" /></div></label>
    <div class="info-note"><i data-icon="shield"></i> Las tarjetas de crédito no pueden recibir transferencias.</div>
    <button class="btn btn-primary full" id="transfer-continue-btn"><span>Continuar</span></button>
  </div>`;
}

function transferStepReviewHtml() {
  return `
  <div class="review">
    <h2>Revisa los datos</h2>
    <p>Confirma que todo esté correcto antes de enviar.</p>
    <div><span>Desde</span><b>Cuenta de ahorros •••• 4832</b></div>
    <div><span>Para</span><b>María Rodríguez<br />•••• 0291</b></div>
    <div><span>Monto</span><strong>${formatMoney(250000)}</strong></div>
    <div><span>Costo</span><b>${formatMoney(0)}</b></div>
    <div class="review-actions">
      <button class="btn btn-secondary" id="transfer-back-btn"><span>Volver</span></button>
      <button class="btn btn-primary" id="transfer-confirm-btn"><span>Confirmar transferencia</span></button>
    </div>
  </div>`;
}

function transferStepSuccessHtml() {
  return `
  <section class="panel transfer-success">
    <i data-icon="check" data-size="34"></i>
    <h2>¡Transferencia exitosa!</h2>
    <p>Enviaste <b>${formatMoney(250000)}</b> a María Rodríguez.</p>
    <div><span>Número de comprobante</span><b>MOV-847291</b></div>
    <button class="btn btn-primary" id="transfer-again-btn"><span>Hacer otra transferencia</span></button>
    <button class="btn btn-secondary" data-go="dashboard"><span>Volver al inicio</span></button>
  </section>`;
}

function transferHtml() {
  return `
  <div class="page-heading">
    <div>
      <div class="eyebrow"><span></span> Mueve tu dinero</div>
      <h1>Nueva transferencia</h1>
      <p>Envía dinero de forma rápida y segura.</p>
    </div>
  </div>
  <div id="transfer-body">
    <div class="transfer-layout">
      <section class="panel transfer-form">
        <div class="steps">
          <span class="active" id="transfer-step-1">1 <small>Datos</small></span>
          <i></i>
          <span id="transfer-step-2">2 <small>Revisar</small></span>
          <i></i>
          <span>3 <small>Confirmar</small></span>
        </div>
        <div id="transfer-step-content">${transferStepFieldsHtml()}</div>
      </section>
      <aside class="panel safe-panel" id="transfer-safe-panel">
        <i data-icon="shield"></i>
        <h3>Tu transferencia está protegida</h3>
        <p>Validamos cada movimiento para mantener tu dinero seguro.</p>
        <hr />
        <b>Antes de confirmar</b>
        <span><i data-icon="check" data-size="16"></i> Verifica el beneficiario</span>
        <span><i data-icon="check" data-size="16"></i> Confirma el monto</span>
      </aside>
    </div>
  </div>`;
}

const CLIENT_SCREENS = {
  dashboard: dashboardHtml,
  accounts: accountsHtml,
  card: cardHtml,
  transfer: transferHtml,
  movements: movementsHtml,
  profile: profileHtml,
};

/* ===================== NAVEGACIÓN ===================== */
let currentScreen = "landing";

function go(screen) {
  currentScreen = screen;
  document.querySelectorAll(".screen").forEach((el) => el.classList.remove("active"));

  if (["dashboard", "accounts", "card", "transfer", "movements", "profile"].includes(screen)) {
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
  content.innerHTML = CLIENT_SCREENS[screen]();
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
  // Generic data-go buttons rendered inside the swapped content
  document.querySelectorAll("#client-content [data-go]").forEach((el) => {
    el.addEventListener("click", () => go(el.dataset.go));
  });

  if (screen === "accounts") {
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

  if (screen === "profile") {
    document.getElementById("profile-save-btn").addEventListener("click", () => {
      document.getElementById("profile-notice").innerHTML = `
        <div class="notice success">
          <i data-icon="check"></i>
          <div><b>Cambios guardados</b><span>Tu información se actualizó correctamente.</span></div>
          <button id="profile-notice-close">×</button>
        </div>`;
      renderIcons(document.getElementById("profile-notice"));
      document.getElementById("profile-notice-close").addEventListener("click", () => {
        document.getElementById("profile-notice").innerHTML = "";
      });
    });
  }

  if (screen === "transfer") {
    wireTransferStep("fields");
  }
}

function wireTransferStep(step) {
  const stepContent = document.getElementById("transfer-step-content");
  const body = document.getElementById("transfer-body");

  if (step === "fields") {
    document.getElementById("transfer-step-1").classList.add("active");
    document.getElementById("transfer-step-2").classList.remove("active");
    stepContent.innerHTML = transferStepFieldsHtml();
    renderIcons(stepContent);
    document.getElementById("transfer-continue-btn").addEventListener("click", () => wireTransferStep("review"));
  } else if (step === "review") {
    document.getElementById("transfer-step-2").classList.add("active");
    stepContent.innerHTML = transferStepReviewHtml();
    renderIcons(stepContent);
    document.getElementById("transfer-back-btn").addEventListener("click", () => wireTransferStep("fields"));
    document.getElementById("transfer-confirm-btn").addEventListener("click", () => wireTransferStep("done"));
  } else if (step === "done") {
    body.innerHTML = transferStepSuccessHtml();
    renderIcons(body);
    document.getElementById("transfer-again-btn").addEventListener("click", () => renderClientScreen("transfer"));
    document.querySelectorAll("#transfer-body [data-go]").forEach((el) => {
      el.addEventListener("click", () => go(el.dataset.go));
    });
  }
}

/* ===================== ADMIN: bloquear / desbloquear clientes ===================== */
function renderAdminClientRows() {
  const wrap = document.getElementById("admin-client-rows");
  wrap.innerHTML = CLIENTS.map((client) => {
    const isBlocked = blockedClients.includes(client.initials);
    return `
    <div class="client-row">
      <div><i>${client.initials}</i><span><b>${client.name}</b><small>${client.email}</small></span></div>
      <span>${client.id}</span>
      <span>${client.products} productos</span>
      <span><em class="${isBlocked ? "blocked" : "active"}">${isBlocked ? "Bloqueado" : "Activo"}</em></span>
      <div class="row-actions">
        <button title="Ver productos"><i data-icon="eye" data-size="17"></i></button>
        <button title="Editar"><i data-icon="settings" data-size="17"></i></button>
        <button title="${isBlocked ? "Desbloquear" : "Bloquear"}" data-toggle-block="${client.initials}"><i data-icon="${isBlocked ? "check" : "lock"}" data-size="17"></i></button>
      </div>
    </div>`;
  }).join("");
  renderIcons(wrap);
  wrap.querySelectorAll("[data-toggle-block]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.toggleBlock;
      blockedClients = blockedClients.includes(id) ? blockedClients.filter((x) => x !== id) : [...blockedClients, id];
      renderAdminClientRows();
    });
  });
}

/* ===================== INICIALIZACIÓN ===================== */
document.addEventListener("DOMContentLoaded", () => {
  renderIcons(document);
  renderAdminClientRows();

  // Botones estáticos con navegación (fuera del contenido dinámico del cliente)
  document.querySelectorAll("[data-go]").forEach((el) => {
    el.addEventListener("click", () => go(el.dataset.go));
  });

  // Formularios de login / registro: por ahora solo simulan el ingreso
  const loginForm = document.getElementById("login-form");
  if (loginForm) loginForm.addEventListener("submit", (e) => { e.preventDefault(); go("dashboard"); });

  const registerForm = document.getElementById("register-form");
  if (registerForm) registerForm.addEventListener("submit", (e) => { e.preventDefault(); go("dashboard"); });

  go("landing");
});
