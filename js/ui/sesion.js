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
// Pone el nombre y las iniciales del cliente en el encabezado
function actualizarEncabezadoCliente() {
  if (!clienteActual) return;
  const avatar = document.querySelector("#screen-client .user-tools .avatar");
  const nombre = document.querySelector("#screen-client .user-tools b");
  const palabras = clienteActual.nombre.split(/\s+/).filter(Boolean);
  let iniciales = palabras[0] ? palabras[0][0] : "";
  if (palabras.length > 1) iniciales += palabras[palabras.length - 1][0];
  if (avatar) avatar.textContent = iniciales.toUpperCase();
  if (nombre) nombre.textContent = clienteActual.nombre;
}
// Si no hay sesión iniciada, las pantallas del cliente mandan al login
const irAPantalla = go;
go = function (screen) {
  if (PANTALLAS_CLIENTE[screen] && clienteActual === null) {
    screen = "login";
  }
  irAPantalla(screen);
};

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
        actualizarEncabezadoCliente();
        document.getElementById("login-clave").value = "";
        go("dashboard");
      } catch (error) {
        loginError.textContent = error.message;
        loginError.style.display = "block";
      }
      mostrarIntentosLogin(usuario);
    });
  }
  // ---------- REGISTRO ----------
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    // Aviso de error (se crea aquí para no tocar index.html)
    const registerError = document.createElement("p");
    registerError.id = "register-error";
    registerError.style.color = "#d93025";
    registerError.style.margin = "8px 0";
    registerError.style.display = "none";
    registerForm.querySelector('button[type="submit"]').before(registerError);

    registerForm.addEventListener("submit", (e) => {
      e.preventDefault();
      registerError.style.display = "none";
      try {
        if (!document.getElementById("reg-terminos").checked) {
          throw new Error("Debes aceptar los términos de uso y la política de datos.");
        }
        const datos = {
          identificacion: document.getElementById("reg-identificacion").value.trim(),
          nombre: document.getElementById("reg-nombre").value.trim(),
          telefono: document.getElementById("reg-telefono").value.trim(),
          userName: document.getElementById("reg-usuario").value.trim(),
          correo: document.getElementById("reg-correo").value.trim(),
          clave: document.getElementById("reg-clave").value,
          confirmarClave: document.getElementById("reg-confirmar").value,
        };
        // El select dice "credito", pero Sistema espera "tarjeta"
        let producto = document.getElementById("reg-producto").value;
        if (producto === "credito") producto = "tarjeta";

        sistema.registrarCliente(datos, producto);
        // Tras registrar, se inicia sesión automáticamente
        clienteActual = sistema.autenticar(datos.userName, datos.clave);
        registerForm.reset();
        go("dashboard");
      } catch (error) {
        registerError.textContent = error.message;
        registerError.style.display = "block";
      }
    });
  }
    // ---------- CERRAR SESIÓN ----------
  const botonSalir = document.querySelector("#screen-client .logout");
  if (botonSalir) botonSalir.addEventListener("click", () => { clienteActual = null; });
  
  go("landing");
});
