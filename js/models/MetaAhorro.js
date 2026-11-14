/* ============================================================
   MetaAhorro — una meta de ahorro del cliente (HU-17).

   El cliente aparta dinero de su cuenta de ahorros hacia la meta
   y lo puede devolver. La meta solo lleva la cuenta de cuánto hay
   apartado: el dinero sale y vuelve a la cuenta con movimientos
   propios ("Aporte a meta" / "Devolución de meta"), sin pasar por
   retirar(), así que nunca se abona el rendimiento del 1,5 %.
   ============================================================ */
class MetaAhorro {
  static MAX_ACTIVAS = 5;
  static NOMBRE_MIN = 3;
  static NOMBRE_MAX = 40;
  static OBJETIVO_MIN = 10000;
  static OBJETIVO_MAX = 1000000000;

  // Atributos privados (encapsulamiento).
  #id;
  #nombre;
  #objetivo;
  #ahorrado;
  #fechaLimite; // Date o null
  #fechaCreacion;
  #fechaCumplida; // Date o null: cuándo llegó al objetivo por primera vez

  constructor({ id, nombre, objetivo, ahorrado = 0, fechaLimite = null, fechaCreacion = new Date(), fechaCumplida = null }) {
    this.#id = id;
    this.#nombre = String(nombre).trim();
    this.#objetivo = objetivo;
    this.#ahorrado = ahorrado;
    this.#fechaLimite = fechaLimite;
    this.#fechaCreacion = fechaCreacion;
    this.#fechaCumplida = fechaCumplida;
  }

  // ---------- Consultas ----------
  get id() { return this.#id; }
  get nombre() { return this.#nombre; }
  get objetivo() { return this.#objetivo; }
  get ahorrado() { return this.#ahorrado; }
  get fechaLimite() { return this.#fechaLimite; }
  get fechaCreacion() { return this.#fechaCreacion; }
  get fechaCumplida() { return this.#fechaCumplida; }

  get cumplida() {
    return this.#fechaCumplida !== null;
  }

  get falta() {
    return Math.max(0, this.#objetivo - this.#ahorrado);
  }

  // Porcentaje de avance entre 0 y 100.
  get progreso() {
    return Math.min(100, Math.floor((this.#ahorrado / this.#objetivo) * 100));
  }

  // Meses que quedan hasta la fecha límite (mínimo 1). null si no tiene fecha.
  mesesRestantes(hoy = new Date()) {
    if (!this.#fechaLimite) return null;
    let meses = (this.#fechaLimite.getFullYear() - hoy.getFullYear()) * 12 + (this.#fechaLimite.getMonth() - hoy.getMonth());
    if (this.#fechaLimite.getDate() < hoy.getDate()) meses -= 1; // el último mes todavía no se completa
    return Math.max(1, meses);
  }

  // Cuánto aportar cada mes para llegar a tiempo. null si no tiene fecha o ya se cumplió.
  aporteMensualSugerido(hoy = new Date()) {
    if (!this.#fechaLimite || this.cumplida || this.falta === 0) return null;
    return Math.ceil(this.falta / this.mesesRestantes(hoy));
  }

  // ---------- Operaciones (solo cambian lo apartado; el dinero lo mueve la cuenta) ----------
  aportar(valor) {
    MetaAhorro.#validarValor(valor);
    if (this.cumplida) {
      throw new Error(`La meta "${this.#nombre}" ya está cumplida.`);
    }
    if (valor > this.falta) {
      throw new Error(`A esta meta solo le faltan ${Cuenta.formatear(this.falta)}.`);
    }
    this.#ahorrado += valor;
    if (this.#ahorrado >= this.#objetivo) {
      this.#fechaCumplida = new Date();
    }
  }

  devolver(valor) {
    MetaAhorro.#validarValor(valor);
    if (valor > this.#ahorrado) {
      throw new Error(`En esta meta solo hay ${Cuenta.formatear(this.#ahorrado)} apartados.`);
    }
    this.#ahorrado -= valor;
  }

  // ---------- Validaciones ----------
  static #validarValor(valor) {
    if (typeof valor !== "number" || !Number.isInteger(valor) || valor <= 0) {
      throw new Error("El valor debe ser un número entero de pesos mayor a 0.");
    }
  }

  // Valida los datos de una meta nueva (nombre, objetivo y fecha límite opcional).
  static validar({ nombre, objetivo, fechaLimite }, hoy = new Date()) {
    const texto = String(nombre || "").trim();
    if (texto.length < MetaAhorro.NOMBRE_MIN || texto.length > MetaAhorro.NOMBRE_MAX) {
      throw new Error(`El nombre de la meta debe tener entre ${MetaAhorro.NOMBRE_MIN} y ${MetaAhorro.NOMBRE_MAX} caracteres.`);
    }
    if (!Number.isInteger(objetivo) || objetivo < MetaAhorro.OBJETIVO_MIN || objetivo > MetaAhorro.OBJETIVO_MAX) {
      throw new Error(
        `El valor objetivo debe estar entre ${Cuenta.formatear(MetaAhorro.OBJETIVO_MIN)} y ${Cuenta.formatear(MetaAhorro.OBJETIVO_MAX)}.`
      );
    }
    if (fechaLimite) {
      const manana = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1);
      if (!(fechaLimite instanceof Date) || Number.isNaN(fechaLimite.getTime()) || fechaLimite < manana) {
        throw new Error("La fecha límite debe ser una fecha futura.");
      }
    }
  }

  // ---------- Guardado en localStorage ----------
  toJSON() {
    return {
      id: this.#id,
      nombre: this.#nombre,
      objetivo: this.#objetivo,
      ahorrado: this.#ahorrado,
      fechaLimite: this.#fechaLimite ? this.#fechaLimite.toISOString() : null,
      fechaCreacion: this.#fechaCreacion.toISOString(),
      fechaCumplida: this.#fechaCumplida ? this.#fechaCumplida.toISOString() : null,
    };
  }

  static fromJSON(datos) {
    return new MetaAhorro({
      ...datos,
      fechaLimite: datos.fechaLimite ? new Date(datos.fechaLimite) : null,
      fechaCreacion: new Date(datos.fechaCreacion),
      fechaCumplida: datos.fechaCumplida ? new Date(datos.fechaCumplida) : null,
    });
  }
}
