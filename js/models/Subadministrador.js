/* ============================================================
   Subadministrador — HU-14.
   Un Subadministrador ES un Administrador (herencia), pero con
   permisos limitados: solo hace lo que el administrador principal
   le haya dado (tickets, bloqueados, clientes).
   ============================================================ */
class Subadministrador extends Administrador {
  static PERMISOS = Object.freeze({
    tickets: "Gestión de tickets",
    bloqueados: "Bloqueo y desbloqueo de clientes",
    clientes: "Consulta de clientes y extractos",
  });

  #permisos;

  constructor({ nombre, userName, clave, permisos = [] }, sistema) {
    super({ nombre, userName, clave }, sistema);
    this.#permisos = permisos.filter((p) => p in Subadministrador.PERMISOS);
  }

  get permisos() {
    return [...this.#permisos];
  }

  tienePermiso(permiso) {
    return this.#permisos.includes(permiso);
  }

  // Solo el administrador principal puede cambiar los permisos (lo llama el Sistema).
  asignarPermisos(permisos) {
    this.#permisos = permisos.filter((p) => p in Subadministrador.PERMISOS);
  }

  // Bloquear y desbloquear exigen el permiso "bloqueados".
  bloquearCliente(userName) {
    this.#exigir("bloqueados", "bloquear clientes");
    return super.bloquearCliente(userName);
  }

  desbloquearCliente(userName) {
    this.#exigir("bloqueados", "desbloquear clientes");
    return super.desbloquearCliente(userName);
  }

  // Lo que SOLO hace el administrador principal: se bloquea aquí.
  registrarCliente() { this.#soloPrincipal("registrar clientes"); }
  editarCliente() { this.#soloPrincipal("editar clientes"); }
  eliminarCliente() { this.#soloPrincipal("eliminar clientes"); }
  aprobarSolicitud() { this.#soloPrincipal("aprobar solicitudes"); }
  denegarSolicitud() { this.#soloPrincipal("denegar solicitudes"); }
  ajustarCupo() { this.#soloPrincipal("ajustar cupos"); }
  abrirProducto() { this.#soloPrincipal("abrir productos"); }
  aprobarRestablecimiento() { this.#soloPrincipal("aprobar restablecimientos de clave"); }
  denegarRestablecimiento() { this.#soloPrincipal("denegar restablecimientos de clave"); }

  #exigir(permiso, accion) {
    if (!this.tienePermiso(permiso)) {
      throw new Error(`No tienes permiso para ${accion}.`);
    }
  }

  #soloPrincipal(accion) {
    throw new Error(`Solo el administrador principal puede ${accion}.`);
  }

  toJSON() {
    return { ...super.toJSON(), permisos: this.#permisos };
  }
}