/* ============================================================
   Cliente — una persona con cuenta en MOVA (HU-02 y HU-08).

   Un cliente tiene una LISTA de productos (ahorros, corriente, tarjeta):
   el saldo ya no es del cliente, es de cada producto.

   Aquí viven las reglas de seguridad que antes estaban en menu.js:
   - 3 intentos fallidos => bloqueo por 24 horas
   - cambio de clave pidiendo la clave actual y su confirmación
   NOTA: proyecto académico, la clave se guarda tal cual (sin cifrar).
   ============================================================ */
class Cliente {
  static MAX_INTENTOS = 3;
  static HORAS_BLOQUEO = 24;
  static LARGO_MINIMO_CLAVE = 8;

  // Relaciona el código guardado de cada producto con su clase.
  static CLASES_PRODUCTO = Object.freeze({
    ahorros: CuentaAhorros,
    corriente: CuentaCorriente,
    tarjeta: TarjetaCredito,
  });

  static #ETIQUETAS = {
    identificacion: "Identificación",
    nombre: "Nombre completo",
    telefono: "Celular",
    userName: "Nombre de usuario",
    correo: "Correo electrónico",
    clave: "Contraseña",
  };

  // Atributos privados (encapsulamiento).
  #datos; // identificacion, nombre, telefono, userName, correo
  #clave;
  #productos;
  #intentosFallidos;
  #bloqueadoHasta; // Date o null (bloqueo temporal por intentos fallidos)
  #bloqueadoPorAdmin; // true si el administrador lo bloqueó
  #fechaRegistro;

  // "datos" trae los campos del formulario; "estado" solo se usa al reconstruir desde localStorage.
  constructor({ identificacion, nombre, telefono, userName, correo, clave }, estado = {}) {
    this.#datos = {
      identificacion: String(identificacion).trim(),
      nombre: String(nombre).trim(),
      telefono: String(telefono).trim(),
      userName: String(userName).trim(),
      correo: String(correo).trim(),
    };
    this.#clave = clave;
    this.#productos = estado.productos || [];
    this.#intentosFallidos = estado.intentosFallidos || 0;
    this.#bloqueadoHasta = estado.bloqueadoHasta || null;
    this.#bloqueadoPorAdmin = estado.bloqueadoPorAdmin || false;
    this.#fechaRegistro = estado.fechaRegistro || new Date();
  }

  // ---------- Consultas ----------
  get identificacion() { return this.#datos.identificacion; }
  get nombre() { return this.#datos.nombre; }
  get telefono() { return this.#datos.telefono; }
  get userName() { return this.#datos.userName; }
  get correo() { return this.#datos.correo; }
  get fechaRegistro() { return this.#fechaRegistro; }
  get intentosFallidos() { return this.#intentosFallidos; }
  get bloqueadoHasta() { return this.#bloqueadoHasta; }
  get bloqueadoPorAdmin() { return this.#bloqueadoPorAdmin; }
  get productos() { return [...this.#productos]; }

  // Suma de los saldos de las cuentas (la tarjeta no cuenta: su "saldo" es cupo, no dinero propio).
  get saldoTotal() {
    return this.#productos
      .filter((producto) => !(producto instanceof TarjetaCredito))
      .reduce((suma, producto) => suma + producto.saldo, 0);
  }

  // ---------- Productos ----------
  agregarProducto(producto) {
    if (!(producto instanceof Cuenta)) {
      throw new Error("El producto no es válido.");
    }
    if (this.buscarProductoPorCodigo(producto.codigo)) {
      throw new Error(`El cliente ya tiene un producto de tipo "${producto.tipo}".`);
    }
    this.#productos.push(producto);
  }

  buscarProducto(numero) {
    return this.#productos.find((producto) => producto.numero === numero) || null;
  }

  buscarProductoPorCodigo(codigo) {
    return this.#productos.find((producto) => producto.codigo === codigo) || null;
  }

  // ---------- Clave y perfil (HU-08) ----------
  verificarClave(clave) {
    return this.#clave === clave;
  }

  // HU-08: pide la clave actual y la confirmación de la nueva.
  cambiarClave(claveActual, claveNueva, confirmacion) {
    if (!this.verificarClave(claveActual)) {
      throw new Error("La clave actual no es correcta.");
    }
    if (typeof claveNueva !== "string" || claveNueva.length < Cliente.LARGO_MINIMO_CLAVE) {
      throw new Error(`La nueva clave debe tener mínimo ${Cliente.LARGO_MINIMO_CLAVE} caracteres.`);
    }
    if (claveNueva !== confirmacion) {
      throw new Error("La nueva clave y su confirmación no coinciden.");
    }
    if (claveNueva === claveActual) {
      throw new Error("La nueva clave debe ser diferente a la actual.");
    }
    this.#clave = claveNueva;
  }

  // HU-08: edita los datos del perfil. Valida todo antes de cambiar algo.
  actualizarPerfil(cambios) {
    const permitidos = ["identificacion", "nombre", "telefono", "userName", "correo"];
    const nuevos = {};
    for (const campo of permitidos) {
      if (cambios[campo] === undefined) continue;
      const valor = String(cambios[campo]).trim();
      if (!valor) {
        throw new Error(`El campo "${Cliente.#ETIQUETAS[campo]}" no puede quedar vacío.`);
      }
      if (campo === "correo" && !Cliente.#correoValido(valor)) {
        throw new Error("El correo electrónico no es válido.");
      }
      nuevos[campo] = valor;
    }
    Object.assign(this.#datos, nuevos);
  }

  // ---------- Bloqueo e intentos fallidos (HU-02) ----------
  estaBloqueado() {
    if (this.#bloqueadoPorAdmin) return true;
    return this.#bloqueadoHasta !== null && new Date() < this.#bloqueadoHasta;
  }

  // Si el bloqueo de 24 h ya venció, vuelve a dejar al cliente con sus 3 intentos.
  liberarBloqueoVencido() {
    if (this.#bloqueadoHasta !== null && new Date() >= this.#bloqueadoHasta) {
      this.reiniciarIntentos();
    }
  }

  // Suma un intento fallido. Al llegar a 3 bloquea 24 horas. Devuelve cuántos intentos quedan.
  registrarIntentoFallido() {
    this.#intentosFallidos++;
    if (this.#intentosFallidos >= Cliente.MAX_INTENTOS) {
      const hasta = new Date();
      hasta.setHours(hasta.getHours() + Cliente.HORAS_BLOQUEO);
      this.#bloqueadoHasta = hasta;
    }
    return Math.max(0, Cliente.MAX_INTENTOS - this.#intentosFallidos);
  }

  reiniciarIntentos() {
    this.#intentosFallidos = 0;
    this.#bloqueadoHasta = null;
  }

  bloquearPorAdmin() {
    this.#bloqueadoPorAdmin = true;
  }

  desbloquear() {
    this.#bloqueadoPorAdmin = false;
    this.reiniciarIntentos();
  }

  // ---------- Validación de datos de registro (HU-02 criterio 1) ----------
  static validar(datos) {
    for (const campo of Object.keys(Cliente.#ETIQUETAS)) {
      if (datos[campo] === undefined || datos[campo] === null || !String(datos[campo]).trim()) {
        throw new Error(`El campo "${Cliente.#ETIQUETAS[campo]}" es obligatorio.`);
      }
    }
    if (!Cliente.#correoValido(String(datos.correo).trim())) {
      throw new Error("El correo electrónico no es válido.");
    }
    if (datos.clave.length < Cliente.LARGO_MINIMO_CLAVE) {
      throw new Error(`La contraseña debe tener mínimo ${Cliente.LARGO_MINIMO_CLAVE} caracteres.`);
    }
    if (datos.clave !== datos.confirmarClave) {
      throw new Error("La clave y su confirmación no coinciden.");
    }
  }

  static #correoValido(correo) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
  }

  // ---------- Guardado en localStorage ----------
  toJSON() {
    return {
      ...this.#datos,
      clave: this.#clave,
      intentosFallidos: this.#intentosFallidos,
      bloqueadoHasta: this.#bloqueadoHasta ? this.#bloqueadoHasta.toISOString() : null,
      bloqueadoPorAdmin: this.#bloqueadoPorAdmin,
      fechaRegistro: this.#fechaRegistro.toISOString(),
      productos: this.#productos.map((producto) => producto.toJSON()),
    };
  }

  // Reconstruye un Cliente REAL (con sus métodos y sus productos como objetos de cada clase).
  static fromJSON(datos) {
    const productos = datos.productos.map((producto) => Cliente.CLASES_PRODUCTO[producto.codigo].fromJSON(producto));
    return new Cliente(datos, {
      productos,
      intentosFallidos: datos.intentosFallidos,
      bloqueadoHasta: datos.bloqueadoHasta ? new Date(datos.bloqueadoHasta) : null,
      bloqueadoPorAdmin: datos.bloqueadoPorAdmin,
      fechaRegistro: new Date(datos.fechaRegistro),
    });
  }
}
