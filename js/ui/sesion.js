/* MOVA — js/ui/sesion.js  (HU-02: login y registro)
   Formularios de ingreso y registro. Cargar de ÚLTIMO: arranca la app en la landing. */

alIniciar(() => {
  // Formularios de login / registro: por ahora solo simulan el ingreso
  const loginForm = document.getElementById("login-form");
  if (loginForm) loginForm.addEventListener("submit", (e) => { e.preventDefault(); go("dashboard"); });

  const registerForm = document.getElementById("register-form");
  if (registerForm) registerForm.addEventListener("submit", (e) => { e.preventDefault(); go("dashboard"); });

  go("landing");
});
