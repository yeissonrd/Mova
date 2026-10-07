/* ============================================================
   CuentaAhorros — hereda de Cuenta (HU-04).
   Regla propia: cada retiro cobra un interés del 1,5 %.
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
  // El interés se cobra ADEMÁS del valor retirado, así que el saldo debe alcanzar para los dos.
  retirar(valor) {
    this._validarMonto(valor);
    const interes = Math.round(valor * CuentaAhorros.TASA_RETIRO);
    const total = valor + interes;

    if (total > this.limiteRetiro()) {
      throw new Error(
        `Saldo insuficiente. El retiro más el interés del 1,5 % (${Cuenta.formatear(interes)}) suma ` +
          `${Cuenta.formatear(total)} y tu saldo es ${Cuenta.formatear(this.saldo)}.`
      );
    }

    const retiro = this._aplicar("Retiro", -valor, { interes });
    this._aplicar("Interés por retiro (1,5 %)", -interes, { tasa: CuentaAhorros.TASA_RETIRO, base: valor });
    return retiro;
  }

  static fromJSON(datos) {
    return new CuentaAhorros(datos.numero, datos.saldo, datos.movimientos.map((m) => Movimiento.fromJSON(m)));
  }
}
