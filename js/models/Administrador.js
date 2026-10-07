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

  toJSON() {
    return { nombre: this.nombre, userName: this.userName, clave: this.#clave };
  }
}
