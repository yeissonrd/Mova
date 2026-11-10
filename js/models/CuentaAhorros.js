/* ============================================================
   CuentaAhorros — hereda de Cuenta (HU-04).
   Regla propia: al retirar se abona al cliente un interés del 1,5 %.
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
  // El retiro no supera el saldo disponible; el rendimiento se abona como movimiento positivo.
  retirar(valor) {
    this._validarMonto(valor);
    if (!Number.isInteger(valor)) throw new Error("El valor debe expresarse en pesos enteros.");
    const interes = Math.round(valor * CuentaAhorros.TASA_RETIRO);
    if (valor > this.saldo) {
      throw new Error(`Saldo insuficiente. Puedes retirar hasta ${Cuenta.formatear(this.saldo)}.`);
    }

    const retiro = this._aplicar("Retiro", -valor, { interes });
    if (interes > 0) {
      this._aplicar("Interés abonado (1,5 %)", interes, { tasa: CuentaAhorros.TASA_RETIRO, base: valor });
    }
    return retiro;
  }

  static fromJSON(datos) {
    return new CuentaAhorros(datos.numero, datos.saldo, datos.movimientos.map((m) => Movimiento.fromJSON(m)));
  }
}
