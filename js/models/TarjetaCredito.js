/* ============================================================
   TarjetaCredito — hereda de Cuenta (HU-06).

   Cómo encaja una tarjeta en la clase Cuenta:
   - El "saldo" heredado representa el CUPO DISPONIBLE.
   - deuda = cupo total - cupo disponible (se calcula, no se guarda).
   - Comprar baja el cupo disponible; pagar lo sube.

   Sobrescribe (polimorfismo) lo que no aplica a una tarjeta:
   retirar() y transferir() quedan bloqueados.
   ============================================================ */
class TarjetaCredito extends Cuenta {
  static CUPO_INICIAL = 2000000; // cupo con el que se abre una tarjeta nueva (ajustable)
  #cupoTotal;

  constructor(numero, cupoTotal = TarjetaCredito.CUPO_INICIAL, cupoDisponible = cupoTotal, movimientos = []) {
    super(numero, cupoDisponible, movimientos);
    this.#cupoTotal = cupoTotal;
  }

  get codigo() {
    return "tarjeta";
  }

  get tipo() {
    return "Tarjeta de crédito";
  }

  get permiteTransferencias() {
    return false;
  }

  get cupoTotal() {
    return this.#cupoTotal;
  }

  get cupoDisponible() {
    return this.saldo;
  }

  get deuda() {
    return this.#cupoTotal - this.saldo;
  }

  // ---------- Tasas y cuota (HU-06 criterios 1 y 2) ----------
  // 1-2 cuotas: 0 %  |  3-6 cuotas: 1,9 % mensual  |  7 o más: 2,3 % mensual
  static tasaPorCuotas(cuotas) {
    if (!Number.isInteger(cuotas) || cuotas < 1) {
      throw new Error("El número de cuotas debe ser un entero mayor o igual a 1.");
    }
    if (cuotas <= 2) return 0;
    if (cuotas <= 6) return 0.019;
    return 0.023;
  }

  // Fórmula de cuota fija: cuota = valor * i / (1 - (1 + i)^-n)   (i = tasa mensual, n = cuotas)
  // Sin interés (i = 0) es simplemente valor / n. Se redondea al peso.
  static calcularCuota(valor, cuotas) {
    const tasa = TarjetaCredito.tasaPorCuotas(cuotas);
    if (tasa === 0) {
      return Math.round(valor / cuotas);
    }
    return Math.round((valor * tasa) / (1 - Math.pow(1 + tasa, -cuotas)));
  }

  // ---------- Operaciones propias ----------
  comprar(valor, cuotas, descripcion = "Compra") {
    this._validarMonto(valor);
    const tasaMensual = TarjetaCredito.tasaPorCuotas(cuotas);
    if (valor > this.cupoDisponible) {
      throw new Error(`Cupo insuficiente. Tu cupo disponible es ${Cuenta.formatear(this.cupoDisponible)}.`);
    }
    const cuotaMensual = TarjetaCredito.calcularCuota(valor, cuotas);
    const totalAPagar = cuotaMensual * cuotas;
    const movimiento = this._aplicar("Compra en cuotas", -valor, { descripcion, cuotas, tasaMensual, cuotaMensual, totalAPagar });
    return { movimiento, cuotas, tasaMensual, cuotaMensual, totalAPagar };
  }

  pagar(valor) {
    this._validarMonto(valor);
    if (valor > this.deuda) {
      throw new Error(`El pago supera tu deuda actual (${Cuenta.formatear(this.deuda)}).`);
    }
    return this._aplicar("Pago de tarjeta", valor);
  }

  // ---------- Sobrescritos ----------
  consignar(valor) {
    return this.pagar(valor); // "consignar" a una tarjeta equivale a abonar a la deuda
  }

  retirar() {
    throw new Error("La tarjeta de crédito no permite retiros. Usa comprar().");
  }

  transferir() {
    throw new Error("La tarjeta de crédito no permite transferencias.");
  }

  // ---------- Guardado en localStorage ----------
  toJSON() {
    return { ...super.toJSON(), cupoTotal: this.#cupoTotal };
  }

  static fromJSON(datos) {
    return new TarjetaCredito(datos.numero, datos.cupoTotal, datos.saldo, datos.movimientos.map((m) => Movimiento.fromJSON(m)));
  }
}
