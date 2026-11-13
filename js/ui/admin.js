/* MOVA — js/ui/admin.js  (HU-01: administrador gestiona clientes)
   Vista "Clientes" del panel: pestañas (clientes, solicitudes, bloqueados),
   búsqueda, bloqueo, detalle con los tres productos, registrar y editar.
   La navegación entre vistas está en admin-panel.js. */

// Pestaña activa de la vista Clientes: "todos", "solicitudes" o "bloqueados".
let pestanaClientesAdmin = "todos";

// Evita que un nombre con símbolos rompa el HTML de la tabla.
function escaparHtml(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function inicialesDe(nombre) {
  const palabras = String(nombre).split(/\s+/).filter(Boolean);
  let iniciales = palabras[0] ? palabras[0][0] : "";
  if (palabras.length > 1) iniciales += palabras[palabras.length - 1][0];
  return iniciales.toUpperCase();
}

// Texto escrito en el buscador del panel.
function textoBuscadorAdmin() {
  const campo = document.querySelector("#screen-admin .search input");
  return campo ? campo.value : "";
}

// Mensaje arriba de la tabla: verde si ok es true, rojo si es false. Sin mensaje, se oculta.
function avisoAdmin(mensaje, ok) {
  let caja = document.getElementById("admin-aviso");
  if (!caja) {
    caja = document.createElement("p");
    caja.id = "admin-aviso";
    caja.style.margin = "0 0 12px";
    caja.style.padding = "10px 14px";
    caja.style.borderRadius = "10px";
    const tabla = document.querySelector("#screen-admin .client-table");
    tabla.parentNode.insertBefore(caja, tabla);
  }
  if (!mensaje) {
    caja.style.display = "none";
    return;
  }
  caja.textContent = mensaje;
  caja.style.display = "block";
  caja.style.color = ok ? "#0f6b57" : "#d93025";
  caja.style.background = ok ? "#e6f6f1" : "#fdeeee";
}

// Escribe un texto en un elemento por id (si existe).
function ponerTextoAdmin(id, texto) {
  const el = document.getElementById(id);
  if (el) el.textContent = texto;
}

// Métricas del Resumen, calculadas desde sistema.clientes y las solicitudes.
function pintarMetricasAdmin() {
  const clientes = sistema.clientes;
  const bloqueados = clientes.filter((c) => c.estaBloqueado()).length;
  const cuentas = clientes.flatMap((c) => c.productos);
  const ahorros = cuentas.filter((p) => p.codigo === "ahorros");
  const corrientes = cuentas.filter((p) => p.codigo === "corriente");
  const sumar = (lista) => lista.reduce((suma, p) => suma + p.saldo, 0);
  const pendientes = sistema.solicitudesPendientes.length;

  ponerTextoAdmin("met-clientes", clientes.length);
  ponerTextoAdmin("met-clientes-nota", bloqueados > 0 ? `${bloqueados} bloqueado(s)` : "Ninguno bloqueado");
  ponerTextoAdmin("met-ahorros", formatMoney(sumar(ahorros)));
  ponerTextoAdmin("met-ahorros-nota", `${ahorros.length} ${ahorros.length === 1 ? "cuenta" : "cuentas"}`);
  ponerTextoAdmin("met-corriente", formatMoney(sumar(corrientes)));
  ponerTextoAdmin("met-corriente-nota", `${corrientes.length} ${corrientes.length === 1 ? "cuenta" : "cuentas"}`);
  ponerTextoAdmin("met-solicitudes", pendientes);
  ponerTextoAdmin("met-solicitudes-nota", pendientes > 0 ? "Por revisar en Clientes" : "Sin pendientes");
}

// Números de cada pestaña de la vista Clientes.
function pintarPestanasAdmin() {
  const clientes = sistema.clientes;
  ponerTextoAdmin("tab-cuenta-todos", clientes.length);
  ponerTextoAdmin("tab-cuenta-solicitudes", sistema.solicitudesPendientes.length);
  ponerTextoAdmin("tab-cuenta-claves", sistema.restablecimientosPendientes.length);
  ponerTextoAdmin("tab-cuenta-bloqueados", clientes.filter((c) => c.estaBloqueado()).length);
  document.querySelectorAll("#screen-admin [data-pestana]").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.pestana === pestanaClientesAdmin);
    btn.setAttribute("aria-selected", btn.dataset.pestana === pestanaClientesAdmin ? "true" : "false");
  });
}

// Título, nota y columnas de la tabla según la pestaña.
const TABLAS_ADMIN = {
  todos: { titulo: "Clientes existentes", nota: "Consulta y administra los usuarios registrados", columnas: ["CLIENTE", "IDENTIFICACIÓN", "PRODUCTOS", "ESTADO", "ACCIONES"] },
  bloqueados: { titulo: "Clientes bloqueados", nota: "Bloqueados por el administrador o por 3 intentos fallidos", columnas: ["CLIENTE", "IDENTIFICACIÓN", "PRODUCTOS", "ESTADO", "ACCIONES"] },
  solicitudes: { titulo: "Solicitudes de clientes nuevos", nota: "Personas que se registraron y esperan aprobación", columnas: ["ASPIRANTE", "IDENTIFICACIÓN", "PRODUCTO ELEGIDO", "FECHA", "ACCIONES"] },
  claves: { titulo: "Recuperar contraseña", nota: "Clientes que olvidaron su clave y esperan una clave temporal", columnas: ["CLIENTE", "IDENTIFICACIÓN", "USUARIO", "FECHA", "ACCIONES"] },
};

function pintarCabeceraTablaAdmin() {
  const tabla = TABLAS_ADMIN[pestanaClientesAdmin];
  ponerTextoAdmin("admin-tabla-titulo", tabla.titulo);
  ponerTextoAdmin("admin-tabla-nota", tabla.nota);
  const cabecera = document.getElementById("admin-tabla-cabecera");
  if (cabecera) cabecera.innerHTML = tabla.columnas.map((c) => `<span>${c}</span>`).join("");
}

// Tabla de la pestaña activa (filtrada por el buscador).
function pintarFilasAdmin() {
  const wrap = document.getElementById("admin-client-rows");
  pintarPestanasAdmin();
  pintarCabeceraTablaAdmin();
  if (pestanaClientesAdmin === "solicitudes") {
    pintarSolicitudesAdmin(wrap, textoBuscadorAdmin()); // admin-solicitudes.js
    return;
  }
    if (pestanaClientesAdmin === "claves") {
    pintarRestablecimientosAdmin(wrap, textoBuscadorAdmin()); // admin-claves.js
    return;
  }
  let clientes = sistema.buscarClientes(textoBuscadorAdmin());
  if (pestanaClientesAdmin === "bloqueados") clientes = clientes.filter((c) => c.estaBloqueado());
  if (clientes.length === 0) {
    wrap.innerHTML = `<p class="empty">${pestanaClientesAdmin === "bloqueados" ? "No hay clientes bloqueados." : "No hay clientes para mostrar."}</p>`;
    return;
  }
  wrap.innerHTML = clientes
    .map((c) => {
      const bloqueado = c.estaBloqueado();
      const n = c.productos.length;
      return `
    <div class="client-row">
      <div><i>${inicialesDe(c.nombre)}</i><span><b>${escaparHtml(c.nombre)}</b><small>${escaparHtml(c.correo)}</small></span></div>
      <span>${escaparHtml(c.identificacion)}</span>
      <span>${n} ${n === 1 ? "producto" : "productos"}</span>
      <span><em class="${bloqueado ? "blocked" : "active"}">${bloqueado ? "Bloqueado" : "Activo"}</em></span>
      <div class="row-actions">
        <button title="Ver detalle" data-detalle="${escaparHtml(c.userName)}"><i data-icon="eye" data-size="17"></i></button>
        <button title="Editar" data-edit="${escaparHtml(c.userName)}"><i data-icon="settings" data-size="17"></i></button>
        <button title="${bloqueado ? "Desbloquear" : "Bloquear"}" data-toggle-block="${escaparHtml(c.userName)}"><i data-icon="${bloqueado ? "check" : "lock"}" data-size="17"></i></button>
      </div>
    </div>`;
    })
    .join("");
  renderIcons(wrap);
  wrap.querySelectorAll("[data-detalle]").forEach((btn) => {
    btn.addEventListener("click", () => abrirDetalleClienteAdmin(btn.dataset.detalle));
  });
  wrap.querySelectorAll("[data-edit]").forEach((btn) => {
    btn.addEventListener("click", () => abrirModalEdicionAdmin(btn.dataset.edit));
  });
  wrap.querySelectorAll("[data-toggle-block]").forEach((btn) => {
    btn.addEventListener("click", () => alternarBloqueoAdmin(btn.dataset.toggleBlock));
  });
}

// Bloquea o desbloquea al cliente usando el administrador (el Sistema guarda).
function alternarBloqueoAdmin(userName) {
  try {
    const cliente = sistema.buscarCliente(userName);
    if (cliente.estaBloqueado()) {
      adminActual.desbloquearCliente(userName);
      avisoAdmin(`Cliente ${cliente.nombre} desbloqueado.`, true);
    } else {
      adminActual.bloquearCliente(userName);
      avisoAdmin(`Cliente ${cliente.nombre} bloqueado.`, true);
    }
  } catch (error) {
    avisoAdmin(error.message, false);
  }
  pintarPanelAdmin();
}

// Dibuja todo el panel. Se llama al entrar como administrador y después de cada cambio.
function pintarPanelAdmin() {
  pintarMetricasAdmin();
  pintarFilasAdmin();
  if (typeof pintarGraficosAdmin === "function") pintarGraficosAdmin(); // admin-graficos.js
  if (typeof pintarTicketsAdmin === "function") pintarTicketsAdmin(); // admin-tickets.js
  if (typeof pintarSubadminsAdmin === "function") pintarSubadminsAdmin(); // admin-subadmins.js (HU-14)
    if (typeof aplicarPermisosAdmin === "function") aplicarPermisosAdmin(); // admin-permisos.js (HU-14)
}

// Cambia de pestaña en la vista Clientes.
function cambiarPestanaClientesAdmin(pestana) {
  if (!TABLAS_ADMIN[pestana]) return;
  pestanaClientesAdmin = pestana;
  avisoAdmin("");
  pintarFilasAdmin();
}

alIniciar(() => {
  const buscador = document.querySelector("#screen-admin .search input");
  if (buscador) buscador.addEventListener("input", pintarFilasAdmin);
  document.querySelectorAll("#screen-admin [data-pestana]").forEach((btn) => {
    btn.addEventListener("click", () => cambiarPestanaClientesAdmin(btn.dataset.pestana));
  });
});

/* ===================== MODAL REGISTRAR CLIENTE (HU-01) ===================== */
// El modal se crea desde aquí para no tocar index.html.
function cerrarModalAdmin() {
  const modal = document.getElementById("admin-modal");
  if (modal) modal.remove();
}

function abrirModalRegistroAdmin() {
  cerrarModalAdmin();
  const fondo = document.createElement("div");
  fondo.id = "admin-modal";
  fondo.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;z-index:1000;overflow:auto";
  fondo.innerHTML = `
    <form id="admin-modal-form" style="width:100%;max-width:560px;max-height:92vh;overflow:auto;padding:24px;background:#fff;border-radius:16px">
      <h2 style="margin:0 0 4px">Registrar cliente</h2>
      <p style="margin:0 0 16px">Completa los datos y elige el producto inicial.</p>
      <div class="form-grid">
        <label class="field"><span>Nombre completo</span><div class="field-control"><input type="text" id="adm-nombre" /></div></label>
        <label class="field"><span>Identificación</span><div class="field-control"><input type="text" id="adm-identificacion" /></div></label>
        <label class="field"><span>Celular</span><div class="field-control"><input type="text" id="adm-telefono" /></div></label>
        <label class="field"><span>Correo electrónico</span><div class="field-control"><input type="email" id="adm-correo" /></div></label>
        <label class="field"><span>Nombre de usuario</span><div class="field-control"><input type="text" id="adm-usuario" /></div></label>
        <label class="field"><span>Contraseña</span><div class="field-control"><input type="password" id="adm-clave" placeholder="Mínimo 8 caracteres" /></div></label>
        <label class="field"><span>Confirmar contraseña</span><div class="field-control"><input type="password" id="adm-confirmar" /></div></label>
        <label class="field"><span>Producto inicial</span><div class="field-control">
          <select id="adm-producto">
            <option value="ahorros">Cuenta de ahorros</option>
            <option value="corriente">Cuenta corriente</option>
            <option value="tarjeta">Tarjeta de crédito</option>
          </select>
        </div></label>
      </div>
      <p id="adm-error" style="color:#d93025;margin:8px 0;display:none"></p>
      <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:16px">
        <button type="button" class="btn btn-secondary" id="adm-cancelar"><span>Cancelar</span></button>
        <button type="submit" class="btn btn-primary"><span>Registrar</span></button>
      </div>
    </form>`;
  document.body.appendChild(fondo);

  fondo.addEventListener("click", (e) => {
    if (e.target === fondo) cerrarModalAdmin();
  });
  document.getElementById("adm-cancelar").addEventListener("click", cerrarModalAdmin);

  document.getElementById("admin-modal-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const error = document.getElementById("adm-error");
    error.style.display = "none";
    try {
      const datos = {
        identificacion: document.getElementById("adm-identificacion").value.trim(),
        nombre: document.getElementById("adm-nombre").value.trim(),
        telefono: document.getElementById("adm-telefono").value.trim(),
        userName: document.getElementById("adm-usuario").value.trim(),
        correo: document.getElementById("adm-correo").value.trim(),
        clave: document.getElementById("adm-clave").value,
        confirmarClave: document.getElementById("adm-confirmar").value,
      };
      adminActual.registrarCliente(datos, document.getElementById("adm-producto").value);
      cerrarModalAdmin();
      avisoAdmin(`Cliente ${datos.nombre} registrado.`, true);
      pintarPanelAdmin();
    } catch (err) {
      error.textContent = err.message;
      error.style.display = "block";
    }
  });
}

alIniciar(() => {
  const botonRegistrar = document.querySelector("#screen-admin .page-heading .btn");
  if (botonRegistrar) botonRegistrar.addEventListener("click", abrirModalRegistroAdmin);
});

/* ===================== MODAL EDITAR CLIENTE (HU-01) ===================== */
function abrirModalEdicionAdmin(userName) {
  cerrarModalAdmin();
  const cliente = sistema.buscarCliente(userName);
  if (!cliente) {
    avisoAdmin("El cliente no existe.", false);
    return;
  }
  const fondo = document.createElement("div");
  fondo.id = "admin-modal";
  fondo.style.cssText =
    "position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:16px;z-index:1000;overflow:auto";
  fondo.innerHTML = `
    <form id="admin-modal-form" style="width:100%;max-width:560px;max-height:92vh;overflow:auto;padding:24px;background:#fff;border-radius:16px">
      <h2 style="margin:0 0 4px">Editar cliente</h2>
      <p style="margin:0 0 16px">Cambia los datos que necesites y guarda.</p>
      <div class="form-grid">
        <label class="field"><span>Nombre completo</span><div class="field-control"><input type="text" id="edt-nombre" /></div></label>
        <label class="field"><span>Identificación</span><div class="field-control"><input type="text" id="edt-identificacion" /></div></label>
        <label class="field"><span>Celular</span><div class="field-control"><input type="text" id="edt-telefono" /></div></label>
        <label class="field"><span>Correo electrónico</span><div class="field-control"><input type="email" id="edt-correo" /></div></label>
        <label class="field"><span>Nombre de usuario</span><div class="field-control"><input type="text" id="edt-usuario" /></div></label>
      </div>
      <p id="edt-error" style="color:#d93025;margin:8px 0;display:none"></p>
      <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:16px">
               <button type="button" class="btn btn-secondary" id="edt-eliminar" style="margin-right:auto;color:#d93025"><span>Eliminar cliente</span></button>
        <button type="button" class="btn btn-secondary" id="edt-cancelar"><span>Cancelar</span></button>
        <button type="submit" class="btn btn-primary"><span>Guardar cambios</span></button>
      </div>
    </form>`;
  document.body.appendChild(fondo);

  // Se precargan los datos actuales del cliente.
  document.getElementById("edt-nombre").value = cliente.nombre;
  document.getElementById("edt-identificacion").value = cliente.identificacion;
  document.getElementById("edt-telefono").value = cliente.telefono;
  document.getElementById("edt-correo").value = cliente.correo;
  document.getElementById("edt-usuario").value = cliente.userName;

  fondo.addEventListener("click", (e) => {
    if (e.target === fondo) cerrarModalAdmin();
  });
  document.getElementById("edt-cancelar").addEventListener("click", cerrarModalAdmin);
    document.getElementById("edt-eliminar").addEventListener("click", () => {
    const error = document.getElementById("edt-error");
    error.style.display = "block";
    error.innerHTML = `¿Seguro que quieres eliminar a <b>${escaparHtml(cliente.nombre)}</b>? Esta acción no se puede deshacer. <button type="button" id="edt-confirmar-eliminar" class="btn btn-primary" style="margin-left:8px"><span>Sí, eliminar</span></button>`;
    document.getElementById("edt-confirmar-eliminar").addEventListener("click", () => {
      try {
        adminActual.eliminarCliente(userName, true);
        cerrarModalAdmin();
        avisoAdmin(`Cliente ${cliente.nombre} eliminado.`, true);
        pintarPanelAdmin();
      } catch (err) {
        error.textContent = err.message;
      }
    });
  });

  document.getElementById("admin-modal-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const error = document.getElementById("edt-error");
    error.style.display = "none";
    try {
      const cambios = {
        nombre: document.getElementById("edt-nombre").value.trim(),
        identificacion: document.getElementById("edt-identificacion").value.trim(),
        telefono: document.getElementById("edt-telefono").value.trim(),
        correo: document.getElementById("edt-correo").value.trim(),
        userName: document.getElementById("edt-usuario").value.trim(),
      };
      adminActual.editarCliente(userName, cambios);
      cerrarModalAdmin();
      avisoAdmin(`Cliente ${cambios.nombre} actualizado.`, true);
      pintarPanelAdmin();
    } catch (err) {
      error.textContent = err.message;
      error.style.display = "block";
    }
  });
}
/* ===================== MODAL DETALLE DEL CLIENTE ===================== */
// Información del cliente y el detalle de sus tres productos (o el botón para abrirlo si no lo tiene).
const PRODUCTOS_ADMIN = [
  { codigo: "ahorros", nombre: "Cuenta de ahorros", icono: "wallet", color: "mint" },
  { codigo: "corriente", nombre: "Cuenta corriente", icono: "card", color: "blue" },
  { codigo: "tarjeta", nombre: "Tarjeta de crédito", icono: "card", color: "violet" },
];

function fechaCortaAdmin(fecha) {
  return fecha.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

function productoDetalleAdminHtml(cliente, info) {
  const p = cliente.buscarProductoPorCodigo(info.codigo);
  if (!p) {
    return `
      <div class="detalle-producto vacio">
        <div class="detalle-producto-cabecera"><i class="${info.color}" data-icon="${info.icono}" data-size="18"></i><b>${info.nombre}</b></div>
        <p>El cliente no tiene este producto.</p>
        <button type="button" class="btn btn-secondary" data-abrir-producto="${info.codigo}"><span>Abrir ${info.nombre.toLowerCase()}</span></button>
      </div>`;
  }
  const cifras = p instanceof TarjetaCredito
    ? `<dl>
        <div><dt>Cupo total</dt><dd>${formatMoney(p.cupoTotal)}</dd></div>
        <div><dt>Disponible</dt><dd>${formatMoney(p.cupoDisponible)}</dd></div>
        <div><dt>Deuda</dt><dd>${formatMoney(p.deuda)}</dd></div>
        <div><dt>Usado</dt><dd>${formatMoney(p.capitalUtilizado)}</dd></div>
      </dl>
      <button type="button" class="btn-link" data-mostrar-cupo>Ajustar cupo</button>
      <form class="ajustar-cupo" data-ajustar-cupo hidden>
        <span class="field-control"><input type="text" inputmode="numeric" value="${formatMoney(p.cupoTotal)}" aria-label="Cupo nuevo" /></span>
        <button type="submit" class="btn btn-primary"><span>Guardar cupo</span></button>
      </form>`
    : `<dl>
        <div><dt>Saldo</dt><dd class="${p.saldo < 0 ? "negativo" : ""}">${formatMoney(p.saldo)}</dd></div>
        <div><dt>Movimientos</dt><dd>${p.historial().length}</dd></div>
      </dl>`;
  const ultimos = p.historial().slice(0, 3);
  const lista = ultimos.length
    ? `<ul>${ultimos
        .map((m) => {
          const e = estiloMovimiento(m);
          return `<li><span>${escaparHtml(m.titulo)}<small>${fechaCortaAdmin(m.fecha)}</small></span><b class="${m.esIngreso ? "positivo" : ""}">${e.valor}</b></li>`;
        })
        .join("")}</ul>`
    : `<p>Sin movimientos todavía.</p>`;
  return `
    <div class="detalle-producto">
      <div class="detalle-producto-cabecera"><i class="${info.color}" data-icon="${info.icono}" data-size="18"></i><b>${info.nombre}</b><small>N.º ${escaparHtml(p.numero)}</small></div>
      ${cifras}
      ${lista}
    </div>`;
}

function abrirDetalleClienteAdmin(userName) {
  cerrarModalAdmin();
  const cliente = sistema.buscarCliente(userName);
  if (!cliente) {
    avisoAdmin("El cliente no existe.", false);
    return;
  }
  const bloqueado = cliente.estaBloqueado();
  const fondo = abrirModalBaseAdmin(`
    <div class="admin-modal-caja ancha">
      <div class="detalle-cliente-cabecera">
        <i>${inicialesDe(cliente.nombre)}</i>
        <div>
          <h2>${escaparHtml(cliente.nombre)}</h2>
          <p>@${escaparHtml(cliente.userName)} · <em class="${bloqueado ? "blocked" : "active"}">${bloqueado ? "Bloqueado" : "Activo"}</em></p>
        </div>
        <button type="button" class="admin-modal-cerrar" aria-label="Cerrar">×</button>
      </div>
      <dl class="detalle-datos">
        <div><dt>Identificación</dt><dd>${escaparHtml(cliente.identificacion)}</dd></div>
        <div><dt>Celular</dt><dd>${escaparHtml(cliente.telefono)}</dd></div>
        <div><dt>Correo</dt><dd>${escaparHtml(cliente.correo)}</dd></div>
        <div><dt>Cliente desde</dt><dd>${fechaCortaAdmin(cliente.fechaRegistro)}</dd></div>
        <div><dt>Saldo total</dt><dd>${formatMoney(cliente.saldoTotal)}</dd></div>
      </dl>
      <h3>Productos</h3>
      <div class="detalle-productos">${PRODUCTOS_ADMIN.map((info) => productoDetalleAdminHtml(cliente, info)).join("")}</div>
      <p class="admin-modal-error" id="det-error"></p>
      <div class="admin-modal-botones">
        <button type="button" class="btn btn-secondary boton-extracto" id="det-extracto"><i data-icon="download" data-size="17"></i><span>Descargar extracto</span></button>
        <button type="button" class="btn btn-secondary" id="det-bloqueo"><span>${bloqueado ? "Desbloquear" : "Bloquear"}</span></button>
        <button type="button" class="btn btn-primary" id="det-editar"><span>Editar datos</span></button>
      </div>
    </div>`);
  // HU-12: el mismo extracto en PDF que descarga el cliente (extracto.js), con opción de todo el historial.
  fondo.querySelector("#det-extracto").addEventListener("click", () => abrirVentanaExtracto(cliente, { conHistorial: true }));
  fondo.querySelector("#det-editar").addEventListener("click", () => abrirModalEdicionAdmin(userName));
  fondo.querySelector("#det-bloqueo").addEventListener("click", () => {
    alternarBloqueoAdmin(userName);
    abrirDetalleClienteAdmin(userName);
  });
  // HU-11: ajustar el cupo de la tarjeta desde el detalle.
  const mostrarCupo = fondo.querySelector("[data-mostrar-cupo]");
  const formCupo = fondo.querySelector("[data-ajustar-cupo]");
  if (mostrarCupo && formCupo) {
    mostrarCupo.addEventListener("click", () => {
      formCupo.hidden = !formCupo.hidden;
      if (!formCupo.hidden) formCupo.querySelector("input").select();
    });
    formCupo.addEventListener("submit", (e) => {
      e.preventDefault();
      const error = document.getElementById("det-error");
      error.style.display = "none";
      try {
        const movimiento = adminActual.ajustarCupo(userName, leerCupoAdmin(formCupo.querySelector("input").value));
        pintarPanelAdmin();
        abrirDetalleClienteAdmin(userName);
        avisoAdmin(`Cupo de ${cliente.nombre} ajustado de ${formatMoney(movimiento.detalle.cupoAnterior)} a ${formatMoney(movimiento.detalle.cupoNuevo)}.`, true);
      } catch (err) {
        error.textContent = err.message;
        error.style.display = "block";
      }
    });
  }

  fondo.querySelectorAll("[data-abrir-producto]").forEach((btn) => {
    btn.addEventListener("click", () => {
      try {
        adminActual.abrirProducto(userName, btn.dataset.abrirProducto);
        pintarPanelAdmin();
        abrirDetalleClienteAdmin(userName);
        avisoAdmin(`Producto abierto para ${cliente.nombre}.`, true);
      } catch (err) {
        const error = document.getElementById("det-error");
        error.textContent = err.message;
        error.style.display = "block";
      }
    });
  });
}
