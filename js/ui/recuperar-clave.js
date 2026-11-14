/* MOVA — js/ui/recuperar-clave.js  (HU-15: recuperar contraseña)
   Formulario de "¿Olvidaste tu contraseña?" del login. Reutiliza el cuadro del panel
   de administración (abrirModalBaseAdmin, de admin-panel.js): cargar DESPUÉS de admin-panel.js. */

function abrirRecuperarClave() {
  const fondo = abrirModalBaseAdmin(`
    <div class="admin-modal-caja" role="dialog" aria-modal="true" aria-labelledby="recuperar-titulo">
      <h2 id="recuperar-titulo">Recuperar contraseña</h2>
      <p class="admin-modal-nota">Escribe tus datos. Si coinciden con tu cuenta, el banco revisará tu solicitud y te entregará una clave temporal.</p>
      <label class="field"><span>Usuario</span><div class="field-control"><input type="text" id="rec-usuario" placeholder="Tu nombre de usuario" /></div></label>
      <label class="field"><span>Identificación</span><div class="field-control"><input type="text" id="rec-identificacion" placeholder="Tu número de identificación" /></div></label>
      <label class="field"><span>Correo electrónico</span><div class="field-control"><input type="email" id="rec-correo" placeholder="Correo con el que te registraste" /></div></label>
      <p class="admin-modal-error" id="rec-error"></p>
      <div class="admin-modal-botones">
        <button type="button" class="btn btn-secondary admin-modal-cerrar"><span>Cancelar</span></button>
        <button type="button" class="btn btn-primary" id="rec-enviar"><span>Enviar solicitud</span></button>
      </div>
    </div>`);

  const error = fondo.querySelector("#rec-error");
  fondo.querySelector("#rec-enviar").addEventListener("click", () => {
    error.style.display = "none";
    try {
      const solicitud = sistema.solicitarRestablecimiento(
        fondo.querySelector("#rec-usuario").value.trim(),
        fondo.querySelector("#rec-identificacion").value.trim(),
        fondo.querySelector("#rec-correo").value.trim()
      );
      fondo.querySelector(".admin-modal-caja").innerHTML = `
        <h2>Solicitud ${solicitud.id} enviada</h2>
        <p class="admin-modal-nota">El banco revisará tus datos. Cuando la apruebe te dará una clave temporal para entrar; al ingresar tendrás que cambiarla.</p>
        <div class="admin-modal-botones"><button type="button" class="btn btn-primary admin-modal-cerrar"><span>Entendido</span></button></div>`;
    } catch (e) {
      error.textContent = e.message;
      error.style.display = "block";
    }
  });
}

alIniciar(() => {
  // El botón ya existe en el login (index.html), solo le faltaba la acción.
  const boton = document.querySelector("#login-form .form-meta button");
  if (boton) boton.addEventListener("click", abrirRecuperarClave);
});
