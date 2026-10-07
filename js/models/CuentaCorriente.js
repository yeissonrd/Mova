/* ============================================================
   CuentaCorriente — hereda de Cuenta (HU-05).
   Regla propia: permite retirar hasta el saldo + 20 % adicional (sobregiro).
   No cobra intereses, así que NO sobrescribe retirar(): le basta con
   cambiar el límite que usa el retirar() heredado de Cuenta.
   ============================================================ */
class CuentaCorriente extends Cuenta {
  static SOBREGIRO = 0.2; // 20 %

  constructor(numero, saldoInicial = 0, movimientos = []) {
    super(numero, saldoInicial, movimientos);
  }

  get codigo() {
    return "corriente";
  }

  get tipo() {
    return "Cuenta corriente";
  }

  // Sobrescribe el límite: saldo + 20 %. Si el saldo es 0 o negativo (ya se usó el sobregiro),
  // no se puede retirar hasta volver a consignar.
  limiteRetiro() {
    if (this.saldo <= 0) {
      return 0;
    }
    return Math.floor(this.saldo * (1 + CuentaCorriente.SOBREGIRO));
  }

  descripcionLimite() {
    return "tu saldo más el 20 % de sobregiro";
  }

  static fromJSON(datos) {
    return new CuentaCorriente(datos.numero, datos.saldo, datos.movimientos.map((m) => Movimiento.fromJSON(m)));
  }
}
