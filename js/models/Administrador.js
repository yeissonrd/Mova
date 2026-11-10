/* ============================================================
   Administrador — gestiona a los clientes (HU-01).
   No toca localStorage directamente: le pide el trabajo al Sistema,
   que valida y guarda. Así hay UN solo lugar con las reglas.
   ============================================================ */
class Administrador {
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

  // HU-01 criterio 1 y 4: registrar (el Sistema rechaza userName duplicado).
  registrarCliente(datos, productoInicial = "ahorros") {
    return this.#sistema.registrarCliente(datos, productoInicial);
  }

  // HU-01 criterio 2: editar datos de un cliente existente.
  editarCliente(userName, cambios) {
    return this.#sistema.actualizarCliente(userName, cambios);
  }

  // HU-01 criterio 3: eliminar, solo si ya se confirmó (la pantalla pregunta primero).
  eliminarCliente(userName, confirmado = false) {
    if (confirmado !== true) {
      throw new Error("Debes confirmar la eliminación del cliente.");
    }
    return this.#sistema.eliminarCliente(userName);
  }

  buscarClientes(texto) {
    return this.#sistema.buscarClientes(texto);
  }

  listarClientes() {
    return this.#sistema.clientes;
  }

  bloquearCliente(userName) {
    return this.#sistema.bloquearCliente(userName);
  }

  desbloquearCliente(userName) {
    return this.#sistema.desbloquearCliente(userName);
  }

  // Solicitudes de clientes nuevos: el Sistema valida y guarda.
  listarSolicitudesPendientes() {
    return this.#sistema.solicitudesPendientes;
  }

  aprobarSolicitud(id, productos, cupoTarjeta) {
    return this.#sistema.aprobarSolicitud(id, productos, cupoTarjeta);
  }

  denegarSolicitud(id, motivo) {
    return this.#sistema.denegarSolicitud(id, motivo);
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
    return this.#sistema.ajustarCupo(cliente, tarjeta.numero, nuevoCupo);
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

  toJSON() {
    return { nombre: this.nombre, userName: this.userName, clave: this.#clave };
  }
}
