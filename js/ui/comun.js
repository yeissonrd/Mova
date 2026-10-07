/* MOVA — js/ui/comun.js
   Utilidades compartidas por todas las pantallas: íconos, formato de dinero y
   datos de ejemplo de movimientos. Lo usan varias HU: cambios aquí se avisan al equipo. */

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
