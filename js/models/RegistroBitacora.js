/* MOVA — Registro inmutable de una acción administrativa (HU-16). */
class RegistroBitacora {
  #fecha;
  #actor;
  #rol;
  #accion;
  #detalle;

  constructor({ fecha = new Date(), actor, rol = "Administrador", accion, detalle = "" }) {
    this.#fecha = fecha instanceof Date ? new Date(fecha) : new Date(fecha);
    this.#actor = String(actor || "Administrador");
    this.#rol = String(rol || "Administrador");
    this.#accion = String(accion || "Acción administrativa");
    this.#detalle = String(detalle || "");
    Object.freeze(this);
  }

  get fecha() { return new Date(this.#fecha); }
  get actor() { return this.#actor; }
  get rol() { return this.#rol; }
  get accion() { return this.#accion; }
  get detalle() { return this.#detalle; }

  toJSON() {
    return { fecha: this.#fecha.toISOString(), actor: this.#actor, rol: this.#rol, accion: this.#accion, detalle: this.#detalle };
  }

  static fromJSON(datos) {
    return new RegistroBitacora(datos);
  }
}
