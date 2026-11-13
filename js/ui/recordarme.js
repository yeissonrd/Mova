/* MOVA — js/ui/recordarme.js  (HU-15: casilla "Recordarme" del login)
   Si la casilla está marcada al ingresar, el nombre de usuario queda guardado en este
   navegador y aparece escrito la próxima vez. Solo se guarda el usuario, nunca la clave. */

const CLAVE_USUARIO_RECORDADO = "mova.usuarioRecordado";

alIniciar(() => {
  const formulario = document.getElementById("login-form");
  const campoUsuario = document.getElementById("login-usuario");
  const casilla = formulario ? formulario.querySelector('.form-meta input[type="checkbox"]') : null;
  if (!formulario || !campoUsuario || !casilla) return;

  // Al abrir la app: si hay un usuario guardado, se escribe y se marca la casilla.
  try {
    const guardado = localStorage.getItem(CLAVE_USUARIO_RECORDADO);
    if (guardado) {
      campoUsuario.value = guardado;
      casilla.checked = true;
    }
  } catch (error) {
    // localStorage bloqueado: simplemente no se recuerda nada.
  }

  // Al enviar el login: cuando termina el manejo de sesion.js se mira si el ingreso fue válido.
  formulario.addEventListener("submit", () => {
    setTimeout(() => {
      if (clienteActual === null) return; // el ingreso falló: no se guarda nada
      try {
        if (casilla.checked) localStorage.setItem(CLAVE_USUARIO_RECORDADO, clienteActual.userName);
        else localStorage.removeItem(CLAVE_USUARIO_RECORDADO);
      } catch (error) {
        // localStorage bloqueado: se ignora.
      }
    }, 0);
  });
});