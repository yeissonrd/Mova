/* ============================================================
   Restablecimiento — pedido de clave nueva de un cliente (HU-15).

   Cuando un cliente olvida su contraseña llena el formulario del login
   (usuario + identificación + correo). Eso crea un Restablecimiento
   "Pendiente". El administrador lo aprueba (el Sistema genera una clave
   temporal) o lo deniega.
   ============================================================ */
class Restablecimiento {
  static ESTADOS = Object.freeze({ PENDIENTE: "Pendiente", APROBADA: "Aprobada", DENEGADA: "Denegada" });

  // Atributos privados (encapsulamiento).
  #id;
  #userName;
  #nombre;
  #identificacion;
  #correo;
  #estado;
  #fecha;
  #fechaRespuesta;

  constructor({
    id,
    userName,
    nombre,
    identificacion,
    correo,
    estado = Restablecimiento.ESTADOS.PENDIENTE,
    fecha = new Date(),
    fechaRespuesta = null,
  }) {
    this.#id = id;
    this.#userName = String(userName).trim();
    this.#nombre = String(nombre).trim();
    this.#identificacion = String(identificacion).trim();
    this.#correo = String(correo).trim();
    this.#estado = estado;
    this.#fecha = fecha;
    this.#fechaRespuesta = fechaRespuesta;
  }

  // ---------- Consultas ----------
  get id() { return this.#id; }
  get userName() { return this.#userName; }
  get nombre() { return this.#nombre; }
  get identificacion() { return this.#identificacion; }
  get correo() { return this.#correo; }
  get estado() { return this.#estado; }
  get fecha() { return this.#fecha; }
  get fechaRespuesta() { return this.#fechaRespuesta; }
  get pendiente() { return this.#estado === Restablecimiento.ESTADOS.PENDIENTE; }

  // ---------- Respuesta del administrador ----------
  aprobar() {
    this.#exigirPendiente();
    this.#estado = Restablecimiento.ESTADOS.APROBADA;
    this.#fechaRespuesta = new Date();
  }

  denegar() {
    this.#exigirPendiente();
    this.#estado = Restablecimiento.ESTADOS.DENEGADA;
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
      userName: this.#userName,
      nombre: this.#nombre,
      identificacion: this.#identificacion,
      correo: this.#correo,
      estado: this.#estado,
      fecha: this.#fecha.toISOString(),
      fechaRespuesta: this.#fechaRespuesta ? this.#fechaRespuesta.toISOString() : null,
    };
  }

  static fromJSON(datos) {
    return new Restablecimiento({
      ...datos,
      fecha: new Date(datos.fecha),
      fechaRespuesta: datos.fechaRespuesta ? new Date(datos.fechaRespuesta) : null,
    });
  }
}