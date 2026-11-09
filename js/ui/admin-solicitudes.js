/* MOVA — js/ui/admin-solicitudes.js  (CORRECCIONES: solicitudes de clientes nuevos)
   Pestaña "Solicitudes" de la vista Clientes: lista de pendientes y el cuadro
   para revisarlas. Al aprobar, el administrador elige los productos (por defecto
   los tres) y el cupo de la tarjeta (por defecto $2.000.000). */

const NOMBRES_PRODUCTO_ADMIN = {
  ahorros: "Cuenta de ahorros",
  corriente: "Cuenta corriente",
  tarjeta: "Tarjeta de crédito",
};

// Filas de la pestaña Solicitudes (se pintan dentro de #admin-client-rows).
function pintarSolicitudesAdmin(wrap, texto) {
  const solicitudes = sistema.buscarSolicitudesPendientes(texto);
  if (solicitudes.length === 0) {
    wrap.innerHTML = `<p class="empty">No hay solicitudes pendientes.</p>`;
    return;
  }
  wrap.innerHTML = solicitudes
    .map(
      (s) => `
    <div class="client-row">
      <div><i>${inicialesDe(s.nombre)}</i><span><b>${escaparHtml(s.nombre)}</b><small>${escaparHtml(s.id)} · ${escaparHtml(s.correo)}</small></span></div>
      <span>${escaparHtml(s.identificacion)}</span>
      <span>${NOMBRES_PRODUCTO_ADMIN[s.productoElegido]}</span>
      <span>${fechaCortaAdmin(s.fecha)}</span>
      <div class="row-actions">
        <button class="revisar" title="Revisar solicitud" data-revisar="${escaparHtml(s.id)}"><i data-icon="eye" data-size="17"></i><span>Revisar</span></button>
      </div>
    </div>`
    )
    .join("");
  renderIcons(wrap);
  wrap.querySelectorAll("[data-revisar]").forEach((btn) => {
    btn.addEventListener("click", () => abrirSolicitudAdmin(btn.dataset.revisar));
  });
}

// Lee un valor con puntos o signo pesos ("2.000.000", "$ 2.000.000") como número entero.
function leerCupoAdmin(texto) {
  return Number(String(texto).replace(/[^\d]/g, ""));
}

function productoSolicitudHtml(codigo, elegido) {
  const esTarjeta = codigo === "tarjeta";
  return `
    <label class="solicitud-producto ${codigo === elegido ? "elegido" : ""}">
      <input type="checkbox" value="${codigo}" checked />
      <span>
        <b>${NOMBRES_PRODUCTO_ADMIN[codigo]}</b>
        <small>${codigo === elegido ? "Producto que eligió al registrarse" : esTarjeta ? "Cupo para compras a cuotas" : "Se abre con saldo $ 0"}</small>
      </span>
      ${
        esTarjeta
          ? `<span class="field-control cupo"><span>Cupo</span><input type="text" inputmode="numeric" id="sol-cupo" value="${formatMoney(TarjetaCredito.CUPO_INICIAL)}" aria-label="Cupo de la tarjeta" /></span>`
          : ""
      }
    </label>`;
}

// Cuadro con la información de la solicitud, los tres productos y los botones Aprobar / Denegar.
function abrirSolicitudAdmin(id) {
  const s = sistema.buscarSolicitud(id);
  if (!s || !s.pendiente) {
    avisoAdmin("La solicitud ya no está pendiente.", false);
    pintarFilasAdmin();
    return;
  }
  const fondo = abrirModalBaseAdmin(`
    <form class="admin-modal-caja" id="sol-form">
      <div class="detalle-cliente-cabecera">
        <i>${inicialesDe(s.nombre)}</i>
        <div>
          <h2>Solicitud ${escaparHtml(s.id)}</h2>
          <p>Recibida el ${fechaCortaAdmin(s.fecha)} · <em class="pendiente">Pendiente</em></p>
        </div>
        <button type="button" class="admin-modal-cerrar" aria-label="Cerrar">×</button>
      </div>
      <dl class="detalle-datos">
        <div><dt>Nombre</dt><dd>${escaparHtml(s.nombre)}</dd></div>
        <div><dt>Identificación</dt><dd>${escaparHtml(s.identificacion)}</dd></div>
        <div><dt>Celular</dt><dd>${escaparHtml(s.telefono)}</dd></div>
        <div><dt>Correo</dt><dd>${escaparHtml(s.correo)}</dd></div>
        <div><dt>Usuario</dt><dd>@${escaparHtml(s.userName)}</dd></div>
      </dl>
      <h3>Productos a aprobar</h3>
      <p class="admin-modal-nota">Desmarca los productos que no quieras abrir. La tarjeta viene con el cupo inicial de ${formatMoney(TarjetaCredito.CUPO_INICIAL)}; puedes ajustarlo (entre ${formatMoney(Sistema.CUPO_MINIMO)} y ${formatMoney(Sistema.CUPO_MAXIMO)}).</p>
      <div class="solicitud-productos">${Solicitud.PRODUCTOS.map((c) => productoSolicitudHtml(c, s.productoElegido)).join("")}</div>
      <label class="field solicitud-motivo"><span>Motivo (solo si deniegas, opcional)</span>
        <div class="field-control"><textarea id="sol-motivo" rows="2" maxlength="200" placeholder="Ej. Los datos de identificación no coinciden."></textarea></div>
      </label>
      <p class="admin-modal-error" id="sol-error"></p>
      <div class="admin-modal-botones">
        <button type="button" class="btn btn-danger" id="sol-denegar"><span>Denegar</span></button>
        <button type="submit" class="btn btn-primary"><i data-icon="check" data-size="18"></i><span>Aprobar solicitud</span></button>
      </div>
    </form>`);

  const error = fondo.querySelector("#sol-error");
  const mostrarError = (mensaje) => {
    error.textContent = mensaje;
    error.style.display = "block";
  };

  // El campo del cupo se apaga si la tarjeta no está marcada.
  const checkTarjeta = fondo.querySelector('input[value="tarjeta"]');
  const cupo = fondo.querySelector("#sol-cupo");
  checkTarjeta.addEventListener("change", () => { cupo.disabled = !checkTarjeta.checked; });
  cupo.addEventListener("blur", () => {
    const valor = leerCupoAdmin(cupo.value);
    if (valor) cupo.value = formatMoney(valor);
  });

  fondo.querySelector("#sol-form").addEventListener("submit", (e) => {
    e.preventDefault();
    error.style.display = "none";
    const productos = [...fondo.querySelectorAll(".solicitud-productos input[type=checkbox]:checked")].map((c) => c.value);
    try {
      const cliente = adminActual.aprobarSolicitud(id, productos, leerCupoAdmin(cupo.value));
      cerrarModalAdmin();
      pestanaClientesAdmin = "todos";
      pintarPanelAdmin();
      const n = cliente.productos.length;
      avisoAdmin(`Solicitud ${id} aprobada: ${cliente.nombre} ya es cliente con ${n} ${n === 1 ? "producto" : "productos"} y puede iniciar sesión.`, true);
    } catch (err) {
      mostrarError(err.message);
    }
  });

  fondo.querySelector("#sol-denegar").addEventListener("click", () => {
    error.style.display = "none";
    try {
      adminActual.denegarSolicitud(id, fondo.querySelector("#sol-motivo").value);
      cerrarModalAdmin();
      pintarPanelAdmin();
      avisoAdmin(`Solicitud ${id} de ${s.nombre} denegada.`, true);
    } catch (err) {
      mostrarError(err.message);
    }
  });
}
