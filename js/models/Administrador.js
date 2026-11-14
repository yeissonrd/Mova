/* ============================================================
   Administrador — gestiona a los clientes (HU-01).
   No toca localStorage directamente: le pide el trabajo al Sistema,
   que valida y guarda. Así hay UN solo lugar con las reglas.
   ============================================================ */
class Administrador {
  static LARGO_MINIMO_CLAVE = 8;

  #clave;
  #sistema;

  constructor({ nombre, userName, clave }, sistema) {
    this.nombre = nombre;
    this.userName = userName;
    this.#clave = clave;
    this.#sistema = sistema;
  }

  verificarClave(clave) {
    return this.#clave === clave;
  }

  // HU-14: el administrador principal tiene todos los permisos (el Subadministrador lo redefine).
  tienePermiso() {
    return true;
  }

  // HU-13: el administrador cambia su clave validando la actual y su confirmación.
  cambiarClave(claveActual, claveNueva, confirmacion) {
    if (!this.verificarClave(claveActual)) {
      throw new Error("La clave actual no es correcta.");
    }
    if (typeof claveNueva !== "string" || claveNueva.length < Administrador.LARGO_MINIMO_CLAVE) {
      throw new Error(`La nueva clave debe tener mínimo ${Administrador.LARGO_MINIMO_CLAVE} caracteres.`);
    }
    if (claveNueva !== confirmacion) {
      throw new Error("La nueva clave y su confirmación no coinciden.");
    }
    if (claveNueva === claveActual) {
      throw new Error("La nueva clave debe ser diferente a la actual.");
    }
    this.#clave = claveNueva;
  }

  // HU-01 criterio 1 y 4: registrar (el Sistema rechaza userName duplicado).
  registrarCliente(datos, productoInicial = "ahorros") {
    const cliente = this.#sistema.registrarCliente(datos, productoInicial);
    this.#registrar("Cliente registrado", `${cliente.nombre} (${cliente.userName}); producto inicial: ${productoInicial}.`);
    return cliente;
  }

  // HU-01 criterio 2: editar datos de un cliente existente.
  editarCliente(userName, cambios) {
    const cliente = this.#sistema.actualizarCliente(userName, cambios);
    this.#registrar("Cliente editado", `${cliente.nombre} (${cliente.userName}); campos: ${Object.keys(cambios).filter((campo) => campo !== "clave").join(", ") || "sin cambios"}.`);
    return cliente;
  }

  // HU-01 criterio 3: eliminar, solo si ya se confirmó (la pantalla pregunta primero).
  eliminarCliente(userName, confirmado = false) {
    if (confirmado !== true) {
      throw new Error("Debes confirmar la eliminación del cliente.");
    }
    const cliente = this.#sistema.buscarCliente(userName);
    this.#sistema.eliminarCliente(userName);
    this.#registrar("Cliente eliminado", `${cliente ? cliente.nombre : userName} (${userName}).`);
  }

  buscarClientes(texto) {
    return this.#sistema.buscarClientes(texto);
  }

  listarClientes() {
    return this.#sistema.clientes;
  }

  bloquearCliente(userName) {
    const cliente = this.#sistema.bloquearCliente(userName);
    this.#registrar("Cliente bloqueado", `${cliente.nombre} (${cliente.userName}).`);
    return cliente;
  }

  desbloquearCliente(userName) {
    const cliente = this.#sistema.desbloquearCliente(userName);
    this.#registrar("Cliente desbloqueado", `${cliente.nombre} (${cliente.userName}).`);
    return cliente;
  }

  // Solicitudes de clientes nuevos: el Sistema valida y guarda.
  listarSolicitudesPendientes() {
    return this.#sistema.solicitudesPendientes;
  }

  aprobarSolicitud(id, productos, cupoTarjeta) {
    const cliente = this.#sistema.aprobarSolicitud(id, productos, cupoTarjeta);
    this.#registrar("Solicitud aprobada", `Solicitud ${id}; cliente ${cliente.nombre} (${cliente.userName}); productos: ${productos.join(", ")}.`);
    return cliente;
  }

  denegarSolicitud(id, motivo) {
    const solicitud = this.#sistema.denegarSolicitud(id, motivo);
    this.#registrar("Solicitud denegada", `Solicitud ${id}; usuario ${solicitud.userName}; motivo: ${motivo || "sin motivo"}.`);
    return solicitud;
  }

  // HU-11: ajustar el cupo de la tarjeta de un cliente.
  ajustarCupo(userName, nuevoCupo) {
    const cliente = this.#sistema.buscarCliente(userName);
    if (!cliente) {
      throw new Error("El cliente no existe.");
    }
    const tarjeta = cliente.buscarProductoPorCodigo("tarjeta");
    if (!tarjeta) {
      throw new Error("El cliente no tiene tarjeta de crédito.");
    }
    const movimiento = this.#sistema.ajustarCupo(cliente, tarjeta.numero, nuevoCupo);
    this.#registrar("Cupo de tarjeta ajustado", `${cliente.nombre} (${cliente.userName}); nuevo cupo: ${nuevoCupo}.`);
    return movimiento;
  }

  // Abre un producto que el cliente todavía no tiene.
  abrirProducto(userName, codigo) {
    const cliente = this.#sistema.buscarCliente(userName);
    if (!cliente) {
      throw new Error("El cliente no existe.");
    }
    this.#sistema.abrirProducto(cliente, codigo);
    return cliente;
  }
    // HU-15: restablecer la clave de un cliente que la olvidó (el Sistema valida y guarda).
  listarRestablecimientosPendientes() {
    return this.#sistema.restablecimientosPendientes;
  }

  aprobarRestablecimiento(id) {
    return this.#sistema.aprobarRestablecimiento(id);
  }

  denegarRestablecimiento(id) {
    return this.#sistema.denegarRestablecimiento(id);
  }
    // HU-14: gestión de subadministradores (solo el principal; el Subadministrador lo bloquea).
  listarSubadministradores() {
    return this.#sistema.subadministradores;
  }

  crearSubadministrador(datos) {
    const subadmin = this.#sistema.crearSubadministrador(datos);
    this.#registrar("Subadministrador creado", `${subadmin.nombre} (${subadmin.userName}); permisos: ${subadmin.permisos.join(", ") || "ninguno"}.`);
    return subadmin;
  }

  editarSubadministrador(userName, cambios) {
    const subadmin = this.#sistema.editarSubadministrador(userName, cambios);
    this.#registrar("Subadministrador editado", `${subadmin.nombre} (${subadmin.userName}); permisos: ${subadmin.permisos.join(", ") || "ninguno"}.`);
    return subadmin;
  }

  eliminarSubadministrador(userName, confirmado = false) {
    if (confirmado !== true) {
      throw new Error("Debes confirmar la eliminación del subadministrador.");
    }
    const subadmin = this.#sistema.buscarSubadministrador(userName);
    this.#sistema.eliminarSubadministrador(userName);
    this.#registrar("Subadministrador eliminado", `${subadmin ? subadmin.nombre : userName} (${userName}).`);
  }

  cambiarEstadoTicket(centroAyuda, numero, estado, respuesta) {
    const ticket = centroAyuda.responderTicket(numero, estado, respuesta);
    this.#registrar("Estado de ticket cambiado", `Ticket ${numero}; estado: ${estado}.`);
    return ticket;
  }

  #registrar(accion, detalle) {
    const rol = this instanceof Subadministrador ? "Subadministrador" : "Administrador principal";
    this.#sistema.registrarAccion(this.nombre, accion, detalle, rol);
  }

  toJSON() {
    return { nombre: this.nombre, userName: this.userName, clave: this.#clave };
  }
}
