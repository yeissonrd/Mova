/* MOVA — js/ui/admin-claves.js  (HU-15: restablecer la clave de un cliente)
   Pestaña "Recuperar clave" de la vista Clientes: lista de solicitudes pendientes y el cuadro
   para revisarlas. Al aprobar, el Sistema genera una clave temporal y el administrador
   se la entrega al cliente. Usa funciones de admin.js y admin-panel.js: cargar después de ellos. */

// Filas de la pestaña (se pintan dentro de #admin-client-rows).
function pintarRestablecimientosAdmin(wrap, texto) {
  const buscado = Sistema.normalizar(texto);
  const pendientes = sistema.restablecimientosPendientes.filter(
    (r) =>
      !buscado ||
      [r.nombre, r.userName, r.identificacion, r.correo, r.id].some((campo) => Sistema.normalizar(campo).includes(buscado))
  );
  if (pendientes.length === 0) {
    wrap.innerHTML = `<p class="empty">No hay solicitudes de recuperación pendientes.</p>`;
    return;
  }
  wrap.innerHTML = pendientes
    .map(
      (r) => `
    <div class="client-row">
      <div><i>${inicialesDe(r.nombre)}</i><span><b>${escaparHtml(r.nombre)}</b><small>${escaparHtml(r.id)} · ${escaparHtml(r.correo)}</small></span></div>
      <span>${escaparHtml(r.identificacion)}</span>
      <span>@${escaparHtml(r.userName)}</span>
      <span>${fechaCortaAdmin(r.fecha)}</span>
      <div class="row-actions">
        <button class="revisar" title="Revisar solicitud" data-revisar-clave="${escaparHtml(r.id)}"><i data-icon="eye" data-size="17"></i><span>Revisar</span></button>
      </div>
    </div>`
    )
    .join("");
  renderIcons(wrap);
  wrap.querySelectorAll("[data-revisar-clave]").forEach((btn) => {
    btn.addEventListener("click", () => abrirRestablecimientoAdmin(btn.dataset.revisarClave));
  });
}

// Cuadro con los datos de la solicitud y los botones Denegar / Aprobar.
function abrirRestablecimientoAdmin(id) {
  const r = sistema.restablecimientosPendientes.find((x) => x.id === id);
  if (!r) {
    avisoAdmin("La solicitud ya no está pendiente.", false);
    pintarFilasAdmin();
    return;
  }
  const fondo = abrirModalBaseAdmin(`
    <div class="admin-modal-caja">
      <div class="detalle-cliente-cabecera">
        <i>${inicialesDe(r.nombre)}</i>
        <div>
          <h2>Recuperar clave ${escaparHtml(r.id)}</h2>
          <p>Recibida el ${fechaCortaAdmin(r.fecha)} · <em class="pendiente">Pendiente</em></p>
        </div>
        <button type="button" class="admin-modal-cerrar" aria-label="Cerrar">×</button>
      </div>
      <dl class="detalle-datos">
        <div><dt>Nombre</dt><dd>${escaparHtml(r.nombre)}</dd></div>
        <div><dt>Identificación</dt><dd>${escaparHtml(r.identificacion)}</dd></div>
        <div><dt>Usuario</dt><dd>@${escaparHtml(r.userName)}</dd></div>
        <div><dt>Correo</dt><dd>${escaparHtml(r.correo)}</dd></div>
      </dl>
      <p class="admin-modal-nota">Al aprobar se genera una clave temporal. Entrégasela al cliente: al entrar tendrá que cambiarla.</p>
      <p class="admin-modal-error" id="rec-adm-error"></p>
      <div class="admin-modal-botones">
        <button type="button" class="btn btn-danger" id="rec-denegar"><span>Denegar</span></button>
        <button type="button" class="btn btn-primary" id="rec-aprobar"><span>Aprobar y generar clave</span></button>
      </div>
    </div>`);

  const error = fondo.querySelector("#rec-adm-error");
  const mostrarError = (mensaje) => {
    error.textContent = mensaje;
    error.style.display = "block";
  };

  fondo.querySelector("#rec-aprobar").addEventListener("click", () => {
    error.style.display = "none";
    try {
      const { cliente, claveTemporal } = adminActual.aprobarRestablecimiento(id);
      fondo.querySelector(".admin-modal-caja").innerHTML = `
        <h2>Clave temporal generada</h2>
        <p class="admin-modal-nota">Entrégasela a ${escaparHtml(cliente.nombre)} (@${escaparHtml(cliente.userName)}). Solo se muestra ahora; al entrar tendrá que cambiarla.</p>
        <p style="font: 700 24px 'Manrope'; letter-spacing: .08em; text-align: center; background: var(--canvas); padding: 16px; border-radius: 12px; margin: 14px 0;">${escaparHtml(claveTemporal)}</p>
        <div class="admin-modal-botones"><button type="button" class="btn btn-primary admin-modal-cerrar"><span>Listo</span></button></div>`;
      pintarPanelAdmin();
    } catch (err) {
      mostrarError(err.message);
    }
  });

  fondo.querySelector("#rec-denegar").addEventListener("click", () => {
    error.style.display = "none";
    try {
      adminActual.denegarRestablecimiento(id);
      cerrarModalAdmin();
      pintarPanelAdmin();
      avisoAdmin(`Solicitud ${id} de ${r.nombre} denegada.`, true);
    } catch (err) {
      mostrarError(err.message);
    }
  });
}