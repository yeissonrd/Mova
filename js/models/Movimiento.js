/* ============================================================
   Movimiento — un registro del historial de un producto.
   Ejemplos: consignación, retiro, compra en cuotas, transferencia.
   Es un objeto de datos simple: no tiene reglas de negocio.
   ============================================================ */
class Movimiento {
  constructor(tipo, monto, saldoResultante, detalle = {}, fecha = new Date()) {
    this.tipo = tipo;                       // "Consignación", "Retiro", "Compra en cuotas"...
    this.monto = monto;                     // positivo = entra dinero, negativo = sale
    this.saldoResultante = saldoResultante; // saldo del producto después del movimiento
    this.detalle = detalle;                 // datos extra: cuotas, tasa, cuota mensual, contraparte...
    this.fecha = fecha;                     // objeto Date
  }

  get esIngreso() {
    return this.monto > 0;
  }

  // Convierte el movimiento a un objeto simple para guardarlo en localStorage.
  toJSON() {
    return {
      tipo: this.tipo,
      monto: this.monto,
      saldoResultante: this.saldoResultante,
      detalle: this.detalle,
      fecha: this.fecha.toISOString(),
    };
  }

  // Reconstruye un Movimiento real a partir del objeto simple guardado.
  static fromJSON(datos) {
    return new Movimiento(datos.tipo, datos.monto, datos.saldoResultante, datos.detalle || {}, new Date(datos.fecha));
  }
}
