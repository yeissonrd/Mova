/* MOVA — js/ui/admin-subadmins.js  (HU-14: subadministradores)
   Vista "Subadministradores": lista, crear, editar permisos y eliminar.
   La usa el administrador principal. Usa funciones de admin.js y admin-panel.js:
   cargar después de ellos. */

// Texto corto de los permisos de un subadministrador, por ejemplo "Tickets · Bloqueados".
function permisosTextoAdmin(subadministrador) {
  const nombres = { tickets: "Tickets", bloqueados: "Bloqueados", clientes: "Clientes" };
  const lista = subadministrador.permisos.map((p) => nombres[p]);
  return lista.length ? lista.join(" · ") : "Sin permisos";
}

// Pinta la tabla de la vista.
function pintarSubadminsAdmin() {
  const wrap = document.getElementById("admin-subadmins-rows");
  if (!wrap) return;
  const subadministradores = sistema.subadministradores;
  if (subadministradores.length === 0) {
    wrap.innerHTML = `<p class="empty">Todavía no hay subadministradores. Crea el primero con el botón de arriba.</p>`;
    return;
  }
  wrap.innerHTML = subadministradores
    .map(
      (s) => `
    <div class="client-row subadmin-row">
      <div><i>${inicialesDe(s.nombre)}</i><span><b>${escaparHtml(s.nombre)}</b></span></div>
      <span>@${escaparHtml(s.userName)}</span>
      <span>${escaparHtml(permisosTextoAdmin(s))}</span>
      <div class="row-actions">
        <button class="revisar" title="Editar subadministrador" data-editar-subadmin="${escaparHtml(s.userName)}"><i data-icon="settings" data-size="17"></i><span>Editar</span></button>
      </div>
    </div>`
    )
    .join("");
  renderIcons(wrap);
  wrap.querySelectorAll("[data-editar-subadmin]").forEach((btn) => {
    btn.addEventListener("click", () => abrirSubadminAdmin(btn.dataset.editarSubadmin));
  });
}

// Cuadro para crear (sin parámetro) o editar (con el usuario) un subadministrador.
function abrirSubadminAdmin(userName = null) {
  const existente = userName ? sistema.buscarSubadministrador(userName) : null;
  const permisosActuales = existente ? existente.permisos : [];
  const casillas = Object.entries(Subadministrador.PERMISOS)
    .map(
      ([codigo, texto]) => `
      <label class="subadmin-permiso"><input type="checkbox" value="${codigo}"${permisosActuales.includes(codigo) ? " checked" : ""} /> <span>${escaparHtml(texto)}</span></label>`
    )
    .join("");

  const fondo = abrirModalBaseAdmin(`
    <div class="admin-modal-caja">
      <div class="detalle-cliente-cabecera">
        <div>
          <h2>${existente ? "Editar subadministrador" : "Nuevo subadministrador"}</h2>
          <p>Elige qué puede hacer. Solo tú apruebas solicitudes, creas subadministradores y eliminas clientes.</p>
        </div>
        <button type="button" class="admin-modal-cerrar" aria-label="Cerrar">×</button>
      </div>
      <label class="field"><span>Nombre</span><div class="field-control"><input id="sub-nombre" value="${existente ? escaparHtml(existente.nombre) : ""}" /></div></label>
      <label class="field"><span>Usuario</span><div class="field-control"><input id="sub-usuario" value="${existente ? escaparHtml(existente.userName) : ""}"${existente ? " disabled" : ""} /></div></label>
      ${existente ? "" : `<label class="field"><span>Clave (mínimo 8 caracteres)</span><div class="field-control"><input id="sub-clave" /></div></label>`}
      <fieldset class="subadmin-permisos"><legend>Permisos</legend>${casillas}</fieldset>
      <p class="admin-modal-error" id="sub-error"></p>
      <div class="admin-modal-botones">
        ${existente ? `<button type="button" class="btn btn-secondary boton-eliminar" id="sub-eliminar"><span>Eliminar</span></button>` : ""}
        <button type="button" class="btn btn-primary" id="sub-guardar"><span>Guardar</span></button>
      </div>
    </div>`);

  const error = fondo.querySelector("#sub-error");
  const mostrarError = (mensaje) => {
    error.textContent = mensaje;
    error.style.display = "block";
  };

  fondo.querySelector("#sub-guardar").addEventListener("click", () => {
    const permisos = [...fondo.querySelectorAll(".subadmin-permisos input:checked")].map((i) => i.value);
    const nombre = fondo.querySelector("#sub-nombre").value;
    try {
      if (existente) {
        adminActual.editarSubadministrador(userName, { nombre, permisos });
      } else {
        adminActual.crearSubadministrador({
          nombre,
          userName: fondo.querySelector("#sub-usuario").value,
          clave: fondo.querySelector("#sub-clave").value,
          permisos,
        });
      }
      cerrarModalAdmin();
      pintarSubadminsAdmin();
    } catch (e) {
      mostrarError(e.message);
    }
  });

  // Eliminar pide una segunda pulsación para confirmar.
  const eliminar = fondo.querySelector("#sub-eliminar");
  if (eliminar) {
    let pidioConfirmacion = false;
    eliminar.addEventListener("click", () => {
      if (!pidioConfirmacion) {
        pidioConfirmacion = true;
        eliminar.querySelector("span").textContent = "Confirmar eliminación";
        return;
      }
      try {
        adminActual.eliminarSubadministrador(userName, true);
        cerrarModalAdmin();
        pintarSubadminsAdmin();
      } catch (e) {
        mostrarError(e.message);
      }
    });
  }
}

alIniciar(() => {
  const boton = document.getElementById("subadmin-nuevo");
  if (boton) boton.addEventListener("click", () => abrirSubadminAdmin());
});