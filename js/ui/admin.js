/* MOVA — js/ui/admin.js  (HU-01: administrador gestiona clientes)
   Pantalla estática screen-admin: lista de clientes, bloquear / desbloquear. */

const CLIENTS = [
  { initials: "JG", name: "Juan Gómez", email: "juan.gomez@correo.com", id: "1.234.567.890", products: 3, status: "Activo" },
  { initials: "MR", name: "María Rodríguez", email: "maria.r@correo.com", id: "52.481.230", products: 2, status: "Activo" },
  { initials: "CS", name: "Carlos Sánchez", email: "carlos.s@correo.com", id: "79.345.120", products: 1, status: "Bloqueado" },
  { initials: "AV", name: "Ana Valencia", email: "ana.valencia@correo.com", id: "43.907.621", products: 2, status: "Activo" },
];
let blockedClients = ["CS"];

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

alIniciar(renderAdminClientRows);
