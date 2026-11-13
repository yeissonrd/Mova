/* ============================================================
   Movimiento — un registro del historial de un producto.
   Ejemplos: consignación, retiro, compra en cuotas, transferencia.
   Es un objeto de datos simple: no tiene reglas de negocio.
   ============================================================ */
class Movimiento {
  // Movimientos que no son entrada ni salida de dinero del cliente (se muestran en color neutro).
  // El pago de la tarjeta no es un ingreso (no entra dinero) ni un gasto (es algo bueno): va neutro.
  static TIPOS_NEUTROS = Object.freeze(["Ajuste de cupo", "Pago de tarjeta"]);

  // Nombre para mostrar cuando es distinto al tipo guardado (el tipo no cambia para no romper filtros ni datos).
  static NOMBRES = Object.freeze({ "Pago de tarjeta": "Abono a tarjeta" });

  // HU-17: dinero que se mueve entre la cuenta de ahorros y una meta del mismo cliente.
  // Para el cliente es salida/entrada de su cuenta, pero el dinero no sale del banco.
  static TIPOS_INTERNOS = Object.freeze(["Aporte a meta", "Devolución de meta"]);

  constructor(tipo, monto, saldoResultante, detalle = {}, fecha = new Date()) {
    this.tipo = tipo;                       // "Consignación", "Retiro", "Compra en cuotas"...
    this.monto = monto;                     // positivo = entra dinero, negativo = sale
    this.saldoResultante = saldoResultante; // saldo del producto después del movimiento
    this.detalle = detalle;                 // datos extra: cuotas, tasa, cuota mensual, contraparte...
    this.fecha = fecha;                     // objeto Date
  }

  get titulo() {
    const nombre = Movimiento.NOMBRES[this.tipo] || this.tipo;
    return this.detalle && this.detalle.meta ? `${nombre} · ${this.detalle.meta}` : nombre;
  }

  get esInterno() {
    return Movimiento.TIPOS_INTERNOS.includes(this.tipo);
  }

  get esNeutro() {
    return Movimiento.TIPOS_NEUTROS.includes(this.tipo);
  }

  get esIngreso() {
    return this.monto > 0 && !this.esNeutro;
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
