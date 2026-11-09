/* MOVA — js/ui/admin-tickets.js  (CORRECCIONES: gestión de tickets)
   Vista "Gestión de tickets" del panel: todos los tickets del centro de ayuda,
   filtro por estado, búsqueda y el cuadro para cambiar el estado y responder.
   Los tickets los guarda CentroAyuda (ayuda.js) en localStorage ("mova.tickets"). */

let filtroEstadoTickets = "Todos";

function textoBuscadorTickets() {
  const campo = document.getElementById("tickets-buscar");
  return campo ? Sistema.normalizar(campo.value) : "";
}

// Busca al cliente que creó el ticket por su identificación (puede haber sido eliminado).
function clienteDelTicket(ticket) {
  return sistema.clientes.find((c) => c.identificacion === ticket.identificacion) || null;
}

function avisoTickets(mensaje, ok) {
  const caja = document.getElementById("tickets-aviso");
  if (!caja) return;
  caja.textContent = mensaje || "";
  caja.className = "admin-aviso " + (ok ? "ok" : "error");
  caja.hidden = !mensaje;
}

function filaTicketHtml(t) {
  const cliente = clienteDelTicket(t);
  const nombre = cliente ? cliente.nombre : "Cliente eliminado";
  return `
    <div class="ticket-row">
      <div><b>${escaparHtml(t.numero)}</b><small>${escaparHtml(t.asunto)}</small></div>
      <span>${escaparHtml(nombre)}<small>${escaparHtml(t.identificacion)}</small></span>
      <span>${escaparHtml(t.categoria)}</span>
      <span>${fechaCortaAdmin(t.fecha)}</span>
      <span><em class="ticket-estado ${ayudaClaseEstado(t.estado)}">${escaparHtml(t.estado)}</em></span>
      <div class="row-actions">
        <button class="revisar" title="Gestionar ticket" data-ticket="${escaparHtml(t.numero)}"><i data-icon="eye" data-size="17"></i><span>Gestionar</span></button>
      </div>
    </div>`;
}

// Dibuja la vista completa: contadores, filtros y tabla.
function pintarTicketsAdmin() {
  const zona = document.getElementById("admin-tickets");
  if (!zona) return;
  const todos = centroAyuda.todos();
  const contar = (estado) => todos.filter((t) => t.estado === estado).length;

  // La estructura se crea una sola vez; después solo se cambian números y filas.
  if (!document.getElementById("tickets-filas")) {
    zona.innerHTML = `
      <div class="admin-metrics tickets-metrics">
        <div><i data-icon="ticket" data-size="20"></i><span><small>Abiertos</small><b id="tk-abiertos">0</b><em>sin atender</em></span></div>
        <div><i data-icon="history" data-size="20"></i><span><small>En revisión</small><b id="tk-revision">0</b><em>en proceso</em></span></div>
        <div><i data-icon="check" data-size="20"></i><span><small>Resueltos</small><b id="tk-resueltos">0</b><em>con respuesta</em></span></div>
      </div>
      <p class="admin-aviso" id="tickets-aviso" hidden></p>
      <section class="panel tickets-tabla">
        <div class="panel-title">
          <div><h2>Tickets de soporte</h2><p>Del más reciente al más antiguo</p></div>
          <div class="tickets-filtros">
            <div class="field-control"><select id="tickets-estado" aria-label="Filtrar por estado">
              <option>Todos</option>${Ticket.ESTADOS.map((e) => `<option>${e}</option>`).join("")}
            </select></div>
            <div class="field-control buscar"><i data-icon="search" data-size="18"></i><input id="tickets-buscar" placeholder="Buscar ticket o cliente..." /></div>
          </div>
        </div>
        <div class="ticket-head"><span>TICKET</span><span>CLIENTE</span><span>CATEGORÍA</span><span>FECHA</span><span>ESTADO</span><span>ACCIONES</span></div>
        <div id="tickets-filas"></div>
      </section>`;
    renderIcons(zona);
    document.getElementById("tickets-estado").addEventListener("change", (e) => {
      filtroEstadoTickets = e.target.value;
      pintarTicketsAdmin();
    });
    document.getElementById("tickets-buscar").addEventListener("input", pintarTicketsAdmin);
  }

  ponerTextoAdmin("tk-abiertos", contar("Abierto"));
  ponerTextoAdmin("tk-revision", contar("En revisión"));
  ponerTextoAdmin("tk-resueltos", contar("Resuelto"));

  const buscado = textoBuscadorTickets();
  const lista = todos.filter((t) => {
    if (filtroEstadoTickets !== "Todos" && t.estado !== filtroEstadoTickets) return false;
    if (!buscado) return true;
    const cliente = clienteDelTicket(t);
    return [t.numero, t.asunto, t.categoria, t.identificacion, cliente ? cliente.nombre : ""].some((campo) =>
      Sistema.normalizar(campo).includes(buscado)
    );
  });

  const filas = document.getElementById("tickets-filas");
  if (lista.length === 0) {
    filas.innerHTML = `<p class="empty">${todos.length === 0 ? "Todavía no hay tickets. Los clientes los crean desde el Centro de ayuda." : "No hay tickets con ese filtro."}</p>`;
    return;
  }
  filas.innerHTML = lista.map(filaTicketHtml).join("");
  renderIcons(filas);
  filas.querySelectorAll("[data-ticket]").forEach((btn) => {
    btn.addEventListener("click", () => abrirTicketAdmin(btn.dataset.ticket));
  });
}

// Cuadro del ticket: datos, descripción del cliente, estado y respuesta.
function abrirTicketAdmin(numero) {
  const t = centroAyuda.todos().find((x) => x.numero === numero);
  if (!t) {
    avisoTickets("El ticket no existe.", false);
    return;
  }
  const cliente = clienteDelTicket(t);
  const fondo = abrirModalBaseAdmin(`
    <form class="admin-modal-caja" id="tk-form">
      <div class="detalle-cliente-cabecera">
        <i class="icono-ticket" data-icon="ticket" data-size="20"></i>
        <div>
          <h2>${escaparHtml(t.numero)}</h2>
          <p>${escaparHtml(t.categoria)}${t.producto ? " · " + escaparHtml(t.producto) : ""} · <em class="ticket-estado ${ayudaClaseEstado(t.estado)}">${escaparHtml(t.estado)}</em></p>
        </div>
        <button type="button" class="admin-modal-cerrar" aria-label="Cerrar">×</button>
      </div>
      <dl class="detalle-datos">
        <div><dt>Cliente</dt><dd>${cliente ? escaparHtml(cliente.nombre) : "Cliente eliminado"}</dd></div>
        <div><dt>Identificación</dt><dd>${escaparHtml(t.identificacion)}</dd></div>
        <div><dt>Correo</dt><dd>${cliente ? escaparHtml(cliente.correo) : "—"}</dd></div>
        <div><dt>Creado</dt><dd>${fechaCortaAdmin(t.fecha)}</dd></div>
      </dl>
      <h3>${escaparHtml(t.asunto)}</h3>
      <p class="ticket-descripcion">${escaparHtml(t.descripcion)}</p>
      <div class="ticket-gestion">
        <label class="field"><span>Estado</span>
          <div class="field-control"><select id="tk-estado">${Ticket.ESTADOS.map((e) => `<option ${e === t.estado ? "selected" : ""}>${e}</option>`).join("")}</select></div>
        </label>
        <label class="field"><span>Respuesta para el cliente</span>
          <div class="field-control"><textarea id="tk-respuesta" rows="3" maxlength="${Ticket.RESPUESTA_MAX}" placeholder="El cliente la verá en Mis solicitudes.">${escaparHtml(t.respuesta)}</textarea></div>
        </label>
      </div>
      <p class="admin-modal-error" id="tk-error"></p>
      <div class="admin-modal-botones">
        <button type="button" class="btn btn-secondary admin-modal-cerrar"><span>Cancelar</span></button>
        <button type="submit" class="btn btn-primary"><span>Guardar cambios</span></button>
      </div>
    </form>`);

  fondo.querySelector("#tk-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const error = fondo.querySelector("#tk-error");
    error.style.display = "none";
    try {
      const estado = fondo.querySelector("#tk-estado").value;
      centroAyuda.responderTicket(numero, estado, fondo.querySelector("#tk-respuesta").value);
      cerrarModalAdmin();
      pintarTicketsAdmin();
      avisoTickets(`Ticket ${numero} actualizado: ${estado}.`, true);
    } catch (err) {
      error.textContent = err.message;
      error.style.display = "block";
    }
  });
}
