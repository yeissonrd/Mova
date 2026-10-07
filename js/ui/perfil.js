/* MOVA — js/ui/perfil.js  (HU-08: perfil del cliente)
   Pantalla: profile (Mi perfil). */

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

function wireProfile() {
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

registrarPantalla("profile", profileHtml, wireProfile);
