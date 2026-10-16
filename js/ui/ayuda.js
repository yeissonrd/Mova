/* MOVA — js/ui/ayuda.js  (CORRECCIONES: centro de ayuda)
   Pantalla: help (Centro de ayuda) = preguntas frecuentes + tickets de soporte.
   Los tickets se guardan en localStorage ("mova.tickets"), aparte de los datos del banco. */

/* ===================== CLASE: Ticket ===================== */
class Ticket {
  static CATEGORIAS = [
    "Cuentas y movimientos",
    "Tarjeta de crédito",
    "Transferencias",
    "Clave y seguridad",
    "Otro",
  ];
  static ASUNTO_MIN = 5;
  static ASUNTO_MAX = 80;
  static DESCRIPCION_MIN = 20;
  static DESCRIPCION_MAX = 500;

  #numero;
  #identificacion; // del cliente que lo creó
  #categoria;
  #producto; // texto del producto relacionado ("" si ninguno)
  #asunto;
  #descripcion;
  #estado;
  #fecha;

  constructor({ numero, identificacion, categoria, producto = "", asunto, descripcion, estado = "Abierto", fecha = new Date() }) {
    this.#numero = numero;
    this.#identificacion = identificacion;
    this.#categoria = categoria;
    this.#producto = producto;
    this.#asunto = asunto;
    this.#descripcion = descripcion;
    this.#estado = estado;
    this.#fecha = fecha;
  }

  get numero() { return this.#numero; }
  get identificacion() { return this.#identificacion; }
  get categoria() { return this.#categoria; }
  get producto() { return this.#producto; }
  get asunto() { return this.#asunto; }
  get descripcion() { return this.#descripcion; }
  get estado() { return this.#estado; }
  get fecha() { return this.#fecha; }

  // Lanza un Error con el mensaje para el usuario si los datos no sirven.
  static validar({ categoria, asunto, descripcion }) {
    if (!Ticket.CATEGORIAS.includes(categoria)) {
      throw new Error("Elige una categoría.");
    }
    const a = String(asunto || "").trim();
    if (a.length < Ticket.ASUNTO_MIN) {
      throw new Error(`El asunto debe tener al menos ${Ticket.ASUNTO_MIN} caracteres.`);
    }
    if (a.length > Ticket.ASUNTO_MAX) {
      throw new Error(`El asunto no puede superar ${Ticket.ASUNTO_MAX} caracteres.`);
    }
    const d = String(descripcion || "").trim();
    if (d.length < Ticket.DESCRIPCION_MIN) {
      throw new Error(`Cuéntanos un poco más: la descripción debe tener al menos ${Ticket.DESCRIPCION_MIN} caracteres.`);
    }
    if (d.length > Ticket.DESCRIPCION_MAX) {
      throw new Error(`La descripción no puede superar ${Ticket.DESCRIPCION_MAX} caracteres.`);
    }
  }

  toJSON() {
    return {
      numero: this.#numero,
      identificacion: this.#identificacion,
      categoria: this.#categoria,
      producto: this.#producto,
      asunto: this.#asunto,
      descripcion: this.#descripcion,
      estado: this.#estado,
      fecha: this.#fecha.toISOString(),
    };
  }

  static fromJSON(datos) {
    return new Ticket({ ...datos, fecha: new Date(datos.fecha) });
  }
}

/* ===================== CLASE: CentroAyuda ===================== */
class CentroAyuda {
  static CLAVE_ALMACEN = "mova.tickets";

  static PREGUNTAS = [
    {
      pregunta: "¿Cómo consigno dinero?",
      respuesta: "Entra a Mis cuentas, elige tu cuenta de ahorros o corriente, escribe el valor y pulsa Consignar. El saldo se actualiza al instante y queda registrado en Movimientos.",
    },
    {
      pregunta: "¿Cuánto puedo retirar?",
      respuesta: "En la cuenta de ahorros puedes retirar hasta tu saldo disponible, pero cada retiro cobra un interés del 1,5 % que también se descuenta. En la cuenta corriente puedes retirar hasta tu saldo más un 20 % adicional (sobregiro) y no cobra interés.",
    },
    {
      pregunta: "¿Cómo transfiero a otra persona?",
      respuesta: "Entra a Transferir, elige la cuenta de origen, escribe el número del producto de destino (10 dígitos) y el valor, y confirma. Entre tus propios productos no se puede transferir si son del mismo tipo. La tarjeta de crédito no permite transferencias.",
    },
    {
      pregunta: "¿Cómo funciona la tarjeta de crédito?",
      respuesta: "Tu tarjeta tiene un cupo. Las compras se difieren en cuotas (de 1 a 36) y los pagos que hagas liberan cupo. Todo lo ves en Mi tarjeta.",
    },
    {
      pregunta: "Mi usuario quedó bloqueado, ¿qué hago?",
      respuesta: "Después de 3 intentos fallidos de clave la cuenta se bloquea por 24 horas y luego se libera sola. Si necesitas ayuda antes, crea una solicitud abajo en la categoría Clave y seguridad.",
    },
    {
      pregunta: "¿Cómo cambio mi contraseña o mis datos?",
      respuesta: "En Perfil y seguridad puedes actualizar tu nombre, celular, correo y usuario, y cambiar tu contraseña (mínimo 8 caracteres). La identificación no se puede modificar.",
    },
    {
      pregunta: "¿Dónde veo mis movimientos?",
      respuesta: "En Movimientos tienes todo el historial y puedes filtrar por texto, producto y tipo. En el Inicio ves los últimos cuatro.",
    },
    {
      pregunta: "¿Cuánto tarda en revisarse mi solicitud?",
      respuesta: "Las solicitudes quedan en estado Abierto con un número de seguimiento (MOVA-0001, por ejemplo). Las ves en Mis solicitudes, en esta misma pantalla.",
    },
  ];

  #almacen() {
    try {
      if (typeof localStorage !== "undefined") return localStorage;
    } catch (error) {
      // localStorage bloqueado: se usa el respaldo en memoria
    }
    return null;
  }

  #respaldo = [];

  #leer() {
    const almacen = this.#almacen();
    if (!almacen) return this.#respaldo;
    try {
      const guardado = JSON.parse(almacen.getItem(CentroAyuda.CLAVE_ALMACEN) || "[]");
      return guardado.map((datos) => Ticket.fromJSON(datos));
    } catch (error) {
      return [];
    }
  }

  #guardar(tickets) {
    const almacen = this.#almacen();
    if (!almacen) {
      this.#respaldo = tickets;
      return;
    }
    almacen.setItem(CentroAyuda.CLAVE_ALMACEN, JSON.stringify(tickets.map((t) => t.toJSON())));
  }

  // Crea el ticket con número consecutivo MOVA-0001, MOVA-0002...
  crearTicket(cliente, { categoria, producto, asunto, descripcion }) {
    Ticket.validar({ categoria, asunto, descripcion });
    const tickets = this.#leer();
    const numero = "MOVA-" + String(tickets.length + 1).padStart(4, "0");
    const ticket = new Ticket({
      numero,
      identificacion: cliente.identificacion,
      categoria,
      producto: producto || "",
      asunto: asunto.trim(),
      descripcion: descripcion.trim(),
    });
    tickets.push(ticket);
    this.#guardar(tickets);
    return ticket;
  }

  // Solicitudes de un cliente, la más reciente primero.
  ticketsDe(cliente) {
    return this.#leer()
      .filter((t) => t.identificacion === cliente.identificacion)
      .sort((a, b) => b.fecha - a.fecha);
  }
}

const centroAyuda = new CentroAyuda();

/* ===================== PANTALLA ===================== */
function ayudaEscapar(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function ayudaTicketHtml(t) {
  const fecha = t.fecha.toLocaleString("es-CO", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  return `
    <li class="ticket-item">
      <div class="ticket-cabecera">
        <b>${ayudaEscapar(t.numero)}</b>
        <span class="ticket-estado">${ayudaEscapar(t.estado)}</span>
      </div>
      <p class="ticket-asunto">${ayudaEscapar(t.asunto)}</p>
      <small>${ayudaEscapar(t.categoria)}${t.producto ? " · " + ayudaEscapar(t.producto) : ""} · ${fecha}</small>
    </li>`;
}

function ayudaListaTicketsHtml() {
  const tickets = centroAyuda.ticketsDe(clienteActual);
  if (tickets.length === 0) {
    return `<p class="empty">Aún no has creado solicitudes.</p>`;
  }
  return `<ul class="ticket-lista">${tickets.map(ayudaTicketHtml).join("")}</ul>`;
}

function helpHtml() {
  const productos = clienteActual.productos
    .map((p) => `<option value="${ayudaEscapar(p.tipo)} •••• ${ayudaEscapar(String(p.numero).slice(-4))}">${ayudaEscapar(p.tipo)} •••• ${ayudaEscapar(String(p.numero).slice(-4))}</option>`)
    .join("");
  const categorias = Ticket.CATEGORIAS.map((c) => `<option value="${ayudaEscapar(c)}">${ayudaEscapar(c)}</option>`).join("");
  const preguntas = CentroAyuda.PREGUNTAS
    .map((q) => `<details class="faq"><summary>${ayudaEscapar(q.pregunta)}</summary><p>${ayudaEscapar(q.respuesta)}</p></details>`)
    .join("");

  return `
  <div class="page-heading">
    <div>
      <div class="eyebrow"><span></span> Estamos para ayudarte</div>
      <h1>Centro de ayuda</h1>
      <p>Resuelve tus dudas o cuéntanos tu situación y la revisaremos.</p>
    </div>
  </div>
  <div class="help-grid">
    <section class="panel">
      <div class="panel-title"><div><h2>Preguntas frecuentes</h2><p>Respuestas rápidas a las dudas más comunes</p></div></div>
      <div class="faq-lista">${preguntas}</div>
    </section>
    <div>
      <section class="panel form-panel">
        <div class="panel-title"><div><h2>Crear una solicitud</h2><p>¿No encontraste respuesta? Escríbenos</p></div></div>
        <div id="help-aviso" aria-live="polite"></div>
        <form id="help-form" novalidate>
          <label class="field"><span>Categoría</span><div class="field-control"><select id="help-categoria">${categorias}</select></div></label>
          <label class="field"><span>Producto relacionado (opcional)</span><div class="field-control"><select id="help-producto"><option value="">Ninguno</option>${productos}</select></div></label>
          <label class="field"><span>Asunto</span><div class="field-control"><input id="help-asunto" maxlength="${Ticket.ASUNTO_MAX}" placeholder="Ej: No veo mi consignación" autocomplete="off" /></div></label>
          <label class="field"><span>Descripción</span><div class="field-control"><textarea id="help-descripcion" rows="5" maxlength="${Ticket.DESCRIPCION_MAX}" placeholder="Cuéntanos qué pasó, con el mayor detalle posible"></textarea></div></label>
          <button class="btn btn-primary" type="submit"><span>Enviar solicitud</span></button>
        </form>
      </section>
      <section class="panel">
        <div class="panel-title"><div><h2>Mis solicitudes</h2><p>Seguimiento de lo que has enviado</p></div></div>
        <div id="help-tickets">${ayudaListaTicketsHtml()}</div>
      </section>
    </div>
  </div>`;
}

function ayudaAviso(mensaje, tipo = "success") {
  const contenedor = document.getElementById("help-aviso");
  if (!contenedor) return;
  contenedor.innerHTML = `<div class="notice ${tipo === "error" ? "error" : "success"}"><div>${ayudaEscapar(mensaje)}</div></div>`;
}

function wireHelp() {
  // navegacion.js escribe la ruta DESPUÉS de esta función, por eso se espera un instante
  setTimeout(() => {
    document.getElementById("client-breadcrumb-label").textContent = "Centro de ayuda";
  }, 0);
  const form = document.getElementById("help-form");
  if (!form) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    try {
      const ticket = centroAyuda.crearTicket(clienteActual, {
        categoria: document.getElementById("help-categoria").value,
        producto: document.getElementById("help-producto").value,
        asunto: document.getElementById("help-asunto").value,
        descripcion: document.getElementById("help-descripcion").value,
      });
      form.reset();
      document.getElementById("help-tickets").innerHTML = ayudaListaTicketsHtml();
      ayudaAviso(`Recibimos tu solicitud. Tu número de seguimiento es ${ticket.numero}.`);
    } catch (error) {
      ayudaAviso(error.message, "error");
    }
  });
}

registrarPantalla("help", helpHtml, wireHelp);
