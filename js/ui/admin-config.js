/* MOVA — js/ui/admin-config.js (HU-13: configuración y clave del administrador). */

function mostrarAvisoConfiguracionAdmin(tipo, mensaje) {
  const aviso = document.getElementById("admin-config-notice");
  if (!aviso) return;
  aviso.hidden = false;
  aviso.className = `admin-config-notice ${tipo}`;
  aviso.textContent = mensaje;
}

function ocultarClavesFormularioAdmin(formulario) {
  formulario.querySelectorAll("[data-password-toggle]").forEach((boton) => {
    const entrada = document.getElementById(boton.dataset.passwordToggle);
    if (entrada) entrada.type = "password";
    boton.setAttribute("aria-pressed", "false");
    boton.setAttribute("aria-label", `Mostrar ${boton.dataset.passwordLabel || "contraseña"}`);
    const icono = boton.querySelector("[data-icon]");
    if (icono) icono.setAttribute("data-icon", "eye");
    renderIcons(boton);
  });
}

alIniciar(() => {
  const formulario = document.getElementById("admin-config-form");
  if (!formulario) return;

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();
    const aviso = document.getElementById("admin-config-notice");
    aviso.hidden = true;

    try {
      if (!adminActual) throw new Error("Inicia sesión como administrador para cambiar la contraseña.");
      sistema.cambiarClaveAdministrador(
        document.getElementById("admin-clave-actual").value,
        document.getElementById("admin-clave-nueva").value,
        document.getElementById("admin-clave-confirmacion").value,
      );
      formulario.reset();
      ocultarClavesFormularioAdmin(formulario);
      mostrarAvisoConfiguracionAdmin("success", "Tu contraseña se actualizó correctamente. Usa la nueva contraseña la próxima vez que inicies sesión.");
    } catch (error) {
      mostrarAvisoConfiguracionAdmin("error", error.message);
    }
  });
});
