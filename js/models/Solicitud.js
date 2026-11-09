/* ============================================================
   Solicitud — pedido de apertura de un cliente nuevo.

   Cuando alguien se registra desde la página no queda como cliente:
   queda una Solicitud "Pendiente". El administrador la revisa y la
   aprueba (eligiendo productos y cupo de la tarjeta) o la deniega.
   Solo al aprobarla el Sistema crea el Cliente real.
   NOTA: proyecto académico, la clave se guarda tal cual (sin cifrar).
   ============================================================ */
class Solicitud {
  static ESTADOS = Object.freeze({ PENDIENTE: "Pendiente", APROBADA: "Aprobada", DENEGADA: "Denegada" });
  static PRODUCTOS = Object.freeze(["ahorros", "corriente", "tarjeta"]);

  // Atributos privados (encapsulamiento).
  #id;
  #datos; // identificacion, nombre, telefono, userName, correo
  #clave;
  #productoElegido;
  #estado;
  #fecha;
  #fechaRespuesta;
  #motivo;
  #productosAprobados;
  #cupoAprobado;

  constructor({
    id,
    identificacion,
    nombre,
    telefono,
    userName,
    correo,
    clave,
    productoElegido = "ahorros",
    estado = Solicitud.ESTADOS.PENDIENTE,
    fecha = new Date(),
    fechaRespuesta = null,
    motivo = "",
    productosAprobados = [],
    cupoAprobado = null,
  }) {
    if (!Solicitud.PRODUCTOS.includes(productoElegido)) {
      throw new Error("El tipo de producto no es válido.");
    }
    this.#id = id;
    this.#datos = {
      identificacion: String(identificacion).trim(),
      nombre: String(nombre).trim(),
      telefono: String(telefono).trim(),
      userName: String(userName).trim(),
      correo: String(correo).trim(),
    };
    this.#clave = clave;
    this.#productoElegido = productoElegido;
    this.#estado = estado;
    this.#fecha = fecha;
    this.#fechaRespuesta = fechaRespuesta;
    this.#motivo = motivo;
    this.#productosAprobados = [...productosAprobados];
    this.#cupoAprobado = cupoAprobado;
  }

  // ---------- Consultas ----------
  get id() { return this.#id; }
  get identificacion() { return this.#datos.identificacion; }
  get nombre() { return this.#datos.nombre; }
  get telefono() { return this.#datos.telefono; }
  get userName() { return this.#datos.userName; }
  get correo() { return this.#datos.correo; }
  get productoElegido() { return this.#productoElegido; }
  get estado() { return this.#estado; }
  get fecha() { return this.#fecha; }
  get fechaRespuesta() { return this.#fechaRespuesta; }
  get motivo() { return this.#motivo; }
  get productosAprobados() { return [...this.#productosAprobados]; }
  get cupoAprobado() { return this.#cupoAprobado; }
  get pendiente() { return this.#estado === Solicitud.ESTADOS.PENDIENTE; }

  verificarClave(clave) {
    return this.#clave === clave;
  }

  // Datos para crear el Cliente cuando se aprueba (incluye la clave que eligió al registrarse).
  datosCliente() {
    return { ...this.#datos, clave: this.#clave, confirmarClave: this.#clave };
  }

  // ---------- Respuesta del administrador ----------
  aprobar(productos, cupo) {
    this.#exigirPendiente();
    this.#estado = Solicitud.ESTADOS.APROBADA;
    this.#productosAprobados = [...productos];
    this.#cupoAprobado = productos.includes("tarjeta") ? cupo : null;
    this.#fechaRespuesta = new Date();
  }

  denegar(motivo = "") {
    this.#exigirPendiente();
    this.#estado = Solicitud.ESTADOS.DENEGADA;
    this.#motivo = String(motivo).trim();
    this.#fechaRespuesta = new Date();
  }

  #exigirPendiente() {
    if (!this.pendiente) {
      throw new Error(`La solicitud ${this.#id} ya fue ${this.#estado.toLowerCase()}.`);
    }
  }

  // ---------- Guardado en localStorage ----------
  toJSON() {
    return {
      id: this.#id,
      ...this.#datos,
      clave: this.#clave,
      productoElegido: this.#productoElegido,
      estado: this.#estado,
      fecha: this.#fecha.toISOString(),
      fechaRespuesta: this.#fechaRespuesta ? this.#fechaRespuesta.toISOString() : null,
      motivo: this.#motivo,
      productosAprobados: this.#productosAprobados,
      cupoAprobado: this.#cupoAprobado,
    };
  }

  static fromJSON(datos) {
    return new Solicitud({
      ...datos,
      fecha: new Date(datos.fecha),
      fechaRespuesta: datos.fechaRespuesta ? new Date(datos.fechaRespuesta) : null,
    });
  }
}
