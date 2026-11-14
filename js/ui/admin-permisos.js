/* MOVA — js/ui/admin-permisos.js  (HU-14: qué ve cada administrador)
   Pone clases en <body> según los permisos de adminActual; css/subadmins.css esconde con
   ellas las pestañas y botones que no corresponden. El permiso real lo hace valer el modelo
   (Subadministrador.js): esto solo evita mostrar botones que darían error.
   Usa funciones de admin.js y admin-panel.js: cargar después de ellos. */

function aplicarPermisosAdmin() {
  if (!adminActual) return;
  const esSub = adminActual instanceof Subadministrador;
  const puede = (permiso) => adminActual.tienePermiso(permiso);
  const verClientes = puede("clientes") || puede("bloqueados");

  document.body.classList.toggle("admin-sub", esSub);
  document.body.classList.toggle("admin-sin-tickets", !puede("tickets"));
  document.body.classList.toggle("admin-sin-clientes", !puede("clientes"));
  document.body.classList.toggle("admin-sin-bloqueados", !puede("bloqueados"));
  document.body.classList.toggle("admin-sin-vista-clientes", !verClientes);

  // Encabezado: nombre y rol de quien entró.
  const nombre = document.querySelector("#screen-admin .user-tools b");
  const rol = document.querySelector("#screen-admin .user-tools small");
  const avatar = document.querySelector("#screen-admin .user-tools .avatar");
  if (nombre) nombre.textContent = esSub ? adminActual.nombre : "Admin MOVA";
  if (rol) rol.textContent = esSub ? "Subadministrador" : "Administrador";
  if (avatar) avatar.textContent = esSub ? inicialesDe(adminActual.nombre) : "AM";

  // Si la vista o la pestaña abierta ya no está permitida, vuelve a una que sí.
  const vistaPermitida = {
    resumen: true,
    clientes: verClientes,
    tickets: puede("tickets"),
    configuracion: !esSub,
    subadmins: !esSub,
  };
  if (!vistaPermitida[vistaAdminActual]) {
    mostrarVistaAdmin("resumen");
    return;
  }
  const pestanaPermitida = {
    todos: puede("clientes"),
    bloqueados: puede("bloqueados"),
    solicitudes: !esSub,
    claves: !esSub,
  };
  if (pestanaPermitida[pestanaClientesAdmin] === false) {
    cambiarPestanaClientesAdmin(puede("clientes") ? "todos" : "bloqueados");
  }
}