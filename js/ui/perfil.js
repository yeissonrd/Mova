/* MOVA — js/ui/perfil.js (HU-08: perfil del cliente)
   Pantalla: profile (Mi perfil). */

function profileEscapar(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (caracter) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[caracter]);
}

function profileIniciales(nombre) {
  return String(nombre || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((palabra) => palabra[0])
    .filter((letra, indice, letras) => indice === 0 || indice === letras.length - 1)
    .join("")
    .toUpperCase();
}

function profileFechaRegistro() {
  const fecha = new Date(clienteActual.fechaRegistro);
  return Number.isNaN(fecha.getTime())
    ? "—"
    : fecha.toLocaleDateString("es-CO", { month: "long", year: "numeric" });
}

function profileHtml() {
  const cliente = clienteActual;
  return `
  <div class="page-heading">
    <div>
      <div class="eyebrow"><span></span> Tu información</div>
      <h1>Perfil y seguridad</h1>
      <p>Mantén tus datos actualizados y tu cuenta protegida.</p>
    </div>
  </div>
  <div id="profile-notice" aria-live="polite"></div>
  <div class="profile-grid">
    <aside class="panel profile-card">
      <div class="profile-avatar">${profileEscapar(profileIniciales(cliente.nombre))}</div>
      <h2>${profileEscapar(cliente.nombre)}</h2>
      <p>${profileEscapar(cliente.correo)}</p>
      <span><i></i> Cliente activo</span>
      <hr />
      <small>Miembro desde</small>
      <b>${profileEscapar(profileFechaRegistro())}</b>
    </aside>
    <div>
      <section class="panel form-panel">
        <div class="panel-title"><div><h2>Información personal</h2><p>Datos asociados a tu cuenta MOVA</p></div></div>
        <div class="form-grid">
          <label class="field"><span>Nombre completo</span><div class="field-control"><input id="profile-nombre" value="${profileEscapar(cliente.nombre)}" autocomplete="name" /></div></label>
          <label class="field"><span>Identificación</span><div class="field-control"><input id="profile-identificacion" value="${profileEscapar(cliente.identificacion)}" autocomplete="off" readonly aria-readonly="true" title="La identificación no se puede cambiar." /></div></label>
          <label class="field"><span>Celular</span><div class="field-control"><input id="profile-telefono" value="${profileEscapar(cliente.telefono)}" autocomplete="tel" /></div></label>
          <label class="field"><span>Correo electrónico</span><div class="field-control"><input id="profile-correo" type="email" value="${profileEscapar(cliente.correo)}" autocomplete="email" /></div></label>
          <label class="field"><span>Nombre de usuario</span><div class="field-control"><input id="profile-usuario" value="${profileEscapar(cliente.userName)}" autocomplete="username" /></div></label>
        </div>
        <button class="btn btn-primary" id="profile-save-btn" type="button"><span>Guardar cambios</span></button>
      </section>
      <section class="panel form-panel security-panel">
        <div class="panel-title">
          <div><h2>Contraseña y seguridad</h2><p>Te recomendamos actualizarla periódicamente</p></div>
          <i data-icon="lock"></i>
        </div>
        <div class="form-grid">
          <label class="field"><span>Contraseña actual</span><div class="field-control"><input id="profile-clave-actual" type="password" autocomplete="current-password" /><button class="password-toggle" type="button" data-password-toggle="profile-clave-actual" aria-label="Mostrar contraseña actual" aria-pressed="false"><i data-icon="eye" data-size="17"></i></button></div></label>
          <label class="field"><span>Nueva contraseña</span><div class="field-control"><input id="profile-clave-nueva" type="password" minlength="8" autocomplete="new-password" placeholder="Mínimo 8 caracteres" /><button class="password-toggle" type="button" data-password-toggle="profile-clave-nueva" aria-label="Mostrar nueva contraseña" aria-pressed="false"><i data-icon="eye" data-size="17"></i></button></div></label>
          <label class="field"><span>Confirmar nueva contraseña</span><div class="field-control"><input id="profile-clave-confirmacion" type="password" minlength="8" autocomplete="new-password" /><button class="password-toggle" type="button" data-password-toggle="profile-clave-confirmacion" aria-label="Mostrar confirmación de contraseña" aria-pressed="false"><i data-icon="eye" data-size="17"></i></button></div></label>
        </div>
        <button class="btn btn-secondary" id="profile-password-btn" type="button"><span>Cambiar contraseña</span></button>
      </section>
    </div>
  </div>`;
}

function profileAviso(mensaje, tipo = "success") {
  const contenedor = document.getElementById("profile-notice");
  if (!contenedor) return;
  const correcto = tipo === "success";
  contenedor.innerHTML = `
    <div class="notice ${correcto ? "success" : "error"}"${correcto ? "" : ' style="color:#a12b2b;background:#fff0f0;border:1px solid #f1caca"'} role="status">
      <i data-icon="${correcto ? "check" : "shield"}"></i>
      <div><b>${correcto ? "Operación exitosa" : "No se pudo completar"}</b><span>${profileEscapar(mensaje)}</span></div>
      <button id="profile-notice-close" type="button" aria-label="Cerrar">×</button>
    </div>`;
  renderIcons(contenedor);
  document.getElementById("profile-notice-close").addEventListener("click", () => {
    contenedor.innerHTML = "";
  });
}

function wireProfile() {
  document.getElementById("profile-save-btn").addEventListener("click", () => {
    const cambios = {
      nombre: document.getElementById("profile-nombre").value,
      telefono: document.getElementById("profile-telefono").value,
      correo: document.getElementById("profile-correo").value,
      userName: document.getElementById("profile-usuario").value,
    };
    try {
      clienteActual = sistema.actualizarPerfil(clienteActual, cambios);
      actualizarEncabezadoCliente();
      renderClientScreen("profile");
      profileAviso("Tu información se actualizó correctamente.");
    } catch (error) {
      profileAviso(error.message, "error");
    }
  });

  document.getElementById("profile-password-btn").addEventListener("click", () => {
    const actual = document.getElementById("profile-clave-actual").value;
    const nueva = document.getElementById("profile-clave-nueva").value;
    const confirmacion = document.getElementById("profile-clave-confirmacion").value;
    try {
      sistema.cambiarClave(clienteActual, actual, nueva, confirmacion);
      document.getElementById("profile-clave-actual").value = "";
      document.getElementById("profile-clave-nueva").value = "";
      document.getElementById("profile-clave-confirmacion").value = "";
      profileAviso("Tu contraseña se cambió correctamente.");
    } catch (error) {
      profileAviso(error.message, "error");
    }
  });
  document.querySelectorAll("#client-content [data-password-toggle]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const entrada = document.getElementById(boton.dataset.passwordToggle);
      if (!entrada) return;
      const mostrar = entrada.type === "password";
      entrada.type = mostrar ? "text" : "password";
      boton.setAttribute("aria-pressed", String(mostrar));
      const descripcion = boton.dataset.passwordToggle === "profile-clave-actual"
        ? "contraseña actual"
        : boton.dataset.passwordToggle === "profile-clave-nueva"
          ? "nueva contraseña"
          : "confirmación de contraseña";
      boton.setAttribute("aria-label", (mostrar ? "Ocultar " : "Mostrar ") + descripcion);
    });
  });
}

registrarPantalla("profile", profileHtml, wireProfile);
