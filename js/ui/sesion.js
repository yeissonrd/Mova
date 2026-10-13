/* MOVA — js/ui/sesion.js  (HU-02: login y registro)
   Formularios de ingreso y registro. Cargar de ÚLTIMO: arranca la app en la landing. */

// Muestra cuántos intentos le quedan al usuario en el login
function mostrarIntentosLogin(usuario) {
  const el = document.getElementById("login-intentos");
  if (!el || !usuario) return;
  try {
    const n = sistema.intentosRestantes(usuario);
    el.textContent = n + (n === 1 ? " intento disponible." : " intentos disponibles.");
  } catch (error) {
    // Si el usuario no existe, se deja el texto como está
  }
}

alIniciar(() => {
  // ---------- LOGIN ----------
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    // Aviso de error (se crea aquí para no tocar index.html)
    const loginError = document.createElement("p");
    loginError.id = "login-error";
    loginError.style.color = "#d93025";
    loginError.style.margin = "8px 0";
    loginError.style.display = "none";
    loginForm.querySelector('button[type="submit"]').before(loginError);

    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const usuario = document.getElementById("login-usuario").value.trim();
      const clave = document.getElementById("login-clave").value;
      loginError.style.display = "none";
      try {
        clienteActual = sistema.autenticar(usuario, clave);
        document.getElementById("login-clave").value = "";
        go("dashboard");
      } catch (error) {
        loginError.textContent = error.message;
        loginError.style.display = "block";
      }
      mostrarIntentosLogin(usuario);
    });
  }

  // ---------- REGISTRO (por ahora solo simula; se conecta en los siguientes pasos) ----------
  const registerForm = document.getElementById("register-form");
  if (registerForm) registerForm.addEventListener("submit", (e) => { e.preventDefault(); go("dashboard"); });

  go("landing");
});