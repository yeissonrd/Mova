/* MOVA — js/ui/cambio-clave-obligatorio.js  (HU-15: recuperar contraseña)
   Si el cliente entró con una clave temporal, este cuadro le exige cambiarla antes de usar
   la app. No tiene botón de cerrar ni se cierra con Escape o con un clic afuera.
   Toma prestado solo el estilo del cuadro del panel de administración. */

function exigirCambioClave() {
  if (!clienteActual) return;
  const anterior = document.getElementById("clave-obligatoria");
  if (anterior) anterior.remove();

  const fondo = document.createElement("div");
  fondo.id = "clave-obligatoria"; // otro id: así los atajos del cuadro del admin no lo cierran
  fondo.className = "admin-modal-fondo";
  fondo.innerHTML = `
    <form class="admin-modal-caja" id="clave-obligatoria-form" role="dialog" aria-modal="true" aria-labelledby="clave-obligatoria-titulo">
      <h2 id="clave-obligatoria-titulo">Crea tu nueva contraseña</h2>
      <p class="admin-modal-nota">Entraste con una clave temporal. Por tu seguridad, cámbiala ahora para seguir usando MOVA.</p>
      <label class="field"><span>Clave temporal</span><div class="field-control"><input type="password" id="clave-ob-actual" autocomplete="off" /></div></label>
      <label class="field"><span>Nueva contraseña</span><div class="field-control"><input type="password" id="clave-ob-nueva" autocomplete="new-password" placeholder="Mínimo ${Cliente.LARGO_MINIMO_CLAVE} caracteres" /></div></label>
      <label class="field"><span>Confirmar nueva contraseña</span><div class="field-control"><input type="password" id="clave-ob-confirmacion" autocomplete="new-password" /></div></label>
      <p class="admin-modal-error" id="clave-ob-error"></p>
      <div class="admin-modal-botones">
        <button type="submit" class="btn btn-primary"><span>Guardar nueva contraseña</span></button>
      </div>
    </form>`;
  document.body.appendChild(fondo);
  fondo.querySelector("#clave-ob-actual").focus();

  const error = fondo.querySelector("#clave-ob-error");
  fondo.querySelector("#clave-obligatoria-form").addEventListener("submit", (e) => {
    e.preventDefault();
    error.style.display = "none";
    try {
      sistema.cambiarClave(
        clienteActual,
        fondo.querySelector("#clave-ob-actual").value,
        fondo.querySelector("#clave-ob-nueva").value,
        fondo.querySelector("#clave-ob-confirmacion").value
      );
      fondo.remove();
    } catch (err) {
      error.textContent = err.message;
      error.style.display = "block";
    }
  });
}