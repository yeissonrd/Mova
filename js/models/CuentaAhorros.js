/* ============================================================
   CuentaAhorros — hereda de Cuenta (HU-04).
   Regla propia: el primer retiro del mes abona al cliente un interés del 1,5 %.
   ============================================================ */
class CuentaAhorros extends Cuenta {
  static TASA_RETIRO = 0.015; // 1,5 %

  constructor(numero, saldoInicial = 0, movimientos = []) {
    super(numero, saldoInicial, movimientos);
  }

  get codigo() {
    return "ahorros";
  }

  get tipo() {
    return "Cuenta de ahorros";
  }

  // Sobrescribe retirar() de Cuenta (polimorfismo).
  // El retiro no supera el saldo disponible; se abona una sola vez por mes calendario.
  retirar(valor) {
    this._validarMonto(valor);
    if (!Number.isInteger(valor)) throw new Error("El valor debe expresarse en pesos enteros.");
    if (valor > this.saldo) {
      throw new Error(`Saldo insuficiente. Puedes retirar hasta ${Cuenta.formatear(this.saldo)}.`);
    }

    const interes = this.#yaAbonoEsteMes() ? 0 : Math.round(valor * CuentaAhorros.TASA_RETIRO);
    const retiro = this._aplicar("Retiro", -valor, { interes });
    if (interes > 0) {
      this._aplicar("Interés abonado (1,5 %)", interes, { tasa: CuentaAhorros.TASA_RETIRO, base: valor });
    }
    return retiro;
  }

  // ---------- HU-17: metas de ahorro ----------
  // Aparta dinero hacia una meta. No es un retiro: no abona el 1,5 % y no puede superar el saldo.
  apartarParaMeta(valor, meta) {
    this._validarMonto(valor);
    if (valor > this.saldo) {
      throw new Error(`Saldo insuficiente. Puedes apartar hasta ${Cuenta.formatear(this.saldo)}.`);
    }
    return this._aplicar("Aporte a meta", -valor, { meta: meta.nombre, metaId: meta.id });
  }

  // Devuelve a la cuenta dinero que estaba apartado en una meta.
  devolverDeMeta(valor, meta) {
    this._validarMonto(valor);
    return this._aplicar("Devolución de meta", valor, { meta: meta.nombre, metaId: meta.id });
  }

  static fromJSON(datos) {
    return new CuentaAhorros(datos.numero, datos.saldo, datos.movimientos.map((m) => Movimiento.fromJSON(m)));
  }

  #yaAbonoEsteMes() {
    const hoy = new Date();
    return this.historial().some((movimiento) => {
      if (movimiento.tipo !== "Interés abonado (1,5 %)") return false;
      const fecha = movimiento.fecha instanceof Date ? movimiento.fecha : new Date(movimiento.fecha);
      return Number.isFinite(fecha.getTime()) && fecha.getMonth() === hoy.getMonth() && fecha.getFullYear() === hoy.getFullYear();
    });
  }
}
