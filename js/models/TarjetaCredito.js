/* ============================================================
   TarjetaCredito — reglas de la tarjeta (HU-06).

   El saldo heredado representa el cupo disponible (capital).
   Los planes de pago registran capital e intereses pendientes por cuota.
   Los abonos se aplican primero a la cuota más antigua y luego a la
   siguiente. Los intereses no consumen cupo; el capital pagado lo libera.
   ============================================================ */
class TarjetaCredito extends Cuenta {
  static CUPO_INICIAL = 2000000;
  #cupoTotal;

  constructor(numero, cupoTotal = TarjetaCredito.CUPO_INICIAL, cupoDisponible = cupoTotal, movimientos = []) {
    super(numero, cupoDisponible, movimientos);
    this.#cupoTotal = cupoTotal;
    this.#migrarPlanesDePago();
  }

  get codigo() { return "tarjeta"; }
  get tipo() { return "Tarjeta de crédito"; }
  get permiteTransferencias() { return false; }
  get cupoTotal() { return this.#cupoTotal; }
  get cupoDisponible() { return this.saldo; }

  // Incluye el capital y los intereses que quedan en las cuotas.
  get capitalUtilizado() {
    return this.#cupoTotal - this.cupoDisponible;
  }

  get deuda() {
    return this.#compras().reduce((total, compra) => total + this.#saldoPlan(compra), 0);
  }

  // Suma solo la cuota pendiente más próxima de cada compra activa.
  get proximoPagoEstimado() {
    return this.#compras().reduce((total, compra) => {
      const siguiente = compra.detalle.planCuotas.find((cuota) => cuota.montoPendiente > 0);
      return total + (siguiente?.montoPendiente || 0);
    }, 0);
  }

  get planesPago() {
    return this.#compras().map((compra) => {
      const cuotas = compra.detalle.planCuotas;
      const pendientes = cuotas.filter((cuota) => cuota.montoPendiente > 0);
      return {
        descripcion: compra.detalle.descripcion || "Compra",
        fecha: compra.fecha,
        cuotasTotales: compra.detalle.cuotas,
        cuotasPendientes: pendientes.length,
        saldoPendiente: this.#saldoPlan(compra),
        proximaCuota: pendientes[0]?.montoPendiente || 0,
      };
    }).filter((plan) => plan.saldoPendiente > 0);
  }

  get abonos() {
    return this.historial().filter((movimiento) => movimiento.tipo === "Pago de tarjeta");
  }

  static tasaPorCuotas(cuotas) {
    if (!Number.isInteger(cuotas) || cuotas < 1) {
      throw new Error("El número de cuotas debe ser un entero mayor o igual a 1.");
    }
    if (cuotas <= 2) return 0;
    if (cuotas <= 6) return 0.019;
    return 0.023;
  }

  static calcularCuota(valor, cuotas) {
    const tasa = TarjetaCredito.tasaPorCuotas(cuotas);
    if (tasa === 0) return Math.round(valor / cuotas);
    return Math.round((valor * tasa) / (1 - Math.pow(1 + tasa, -cuotas)));
  }

  static calcularTotal(valor, cuotas) {
    return Math.max(valor, TarjetaCredito.calcularCuota(valor, cuotas) * cuotas);
  }

  comprar(valor, cuotas, descripcion = "Compra") {
    this._validarMonto(valor);
    if (!Number.isInteger(valor)) throw new Error("El valor debe expresarse en pesos enteros.");
    if (!Number.isInteger(cuotas) || cuotas < 1 || cuotas > 36) {
      throw new Error("El número de cuotas debe estar entre 1 y 36.");
    }
    const tasaMensual = TarjetaCredito.tasaPorCuotas(cuotas);
    if (valor > this.cupoDisponible) {
      throw new Error(`Cupo insuficiente. Tu cupo disponible es ${Cuenta.formatear(this.cupoDisponible)}.`);
    }

    const cuotaMensual = TarjetaCredito.calcularCuota(valor, cuotas);
    const totalAPagar = TarjetaCredito.calcularTotal(valor, cuotas);
    const planCuotas = this.#crearCuotas(valor, cuotas, cuotaMensual, totalAPagar);
    const movimiento = this._aplicar("Compra en cuotas", -valor, {
      descripcion, cuotas, tasaMensual, cuotaMensual, totalAPagar, planCuotas,
    });
    return { movimiento, cuotas, tasaMensual, cuotaMensual, totalAPagar };
  }

  pagar(valor) {
    this._validarMonto(valor);
    if (!Number.isInteger(valor)) throw new Error("El valor debe expresarse en pesos enteros.");
    const deuda = this.deuda;
    if (valor > deuda) {
      throw new Error(`El pago supera tu deuda actual (${Cuenta.formatear(deuda)}).`);
    }

    let restante = valor;
    let capitalAbonado = 0;
    let interesesAbonados = 0;
    const aplicaciones = [];

    // Orden cronológico: primero se cubren las cuotas de las compras más antiguas.
    for (const compra of this.#compras().reverse()) {
      for (let indice = 0; indice < compra.detalle.planCuotas.length && restante > 0; indice++) {
        const cuota = compra.detalle.planCuotas[indice];
        if (cuota.montoPendiente <= 0) continue;

        const aplicado = Math.min(restante, cuota.montoPendiente);
        // Cada abono cubre primero los intereses y luego el capital de esa cuota.
        const interes = Math.min(aplicado, cuota.interesPendiente);
        const capital = Math.min(aplicado - interes, cuota.capitalPendiente);
        cuota.interesPendiente -= interes;
        cuota.capitalPendiente -= capital;
        cuota.montoPendiente = cuota.interesPendiente + cuota.capitalPendiente;
        restante -= aplicado;
        interesesAbonados += interes;
        capitalAbonado += capital;
        aplicaciones.push({
          descripcion: compra.detalle.descripcion || "Compra",
          cuota: indice + 1,
          valor: aplicado,
          intereses: interes,
          capital,
        });
      }
    }

    const movimiento = this._aplicar("Pago de tarjeta", capitalAbonado, {
      valorPagado: valor,
      capitalAbonado,
      interesesAbonados,
      aplicaciones,
    }, valor);
    return movimiento;
  }

  consignar(valor) {
    return this.pagar(valor);
  }

  retirar() {
    throw new Error("La tarjeta de crédito no permite retiros. Usa comprar().");
  }

  transferir() {
    throw new Error("La tarjeta de crédito no permite transferencias.");
  }

  toJSON() {
    return { ...super.toJSON(), cupoTotal: this.#cupoTotal };
  }

  static fromJSON(datos) {
    return new TarjetaCredito(
      datos.numero,
      datos.cupoTotal,
      datos.saldo,
      (datos.movimientos || []).map((movimiento) => Movimiento.fromJSON(movimiento)),
    );
  }

  #compras() {
    return this.historial().filter((movimiento) => movimiento.tipo === "Compra en cuotas");
  }

  #saldoPlan(compra) {
    return compra.detalle.planCuotas.reduce((total, cuota) => total + cuota.montoPendiente, 0);
  }

  #crearCuotas(valor, numeroCuotas, cuotaMensual, totalAPagar = Math.max(valor, cuotaMensual * numeroCuotas)) {
    const capitalBase = Math.floor(valor / numeroCuotas);
    const sobrante = valor % numeroCuotas;
    return Array.from({ length: numeroCuotas }, (_, indice) => {
      const capital = capitalBase + (indice >= numeroCuotas - sobrante ? 1 : 0);
      const monto = indice === numeroCuotas - 1 ? totalAPagar - cuotaMensual * (numeroCuotas - 1) : cuotaMensual;
      const interes = monto - capital;
      return { montoPendiente: monto, capitalPendiente: capital, interesPendiente: interes };
    });
  }

  #migrarPlanesDePago() {
    const compras = this.#compras();
    const necesitaMigracion = compras.some((compra) => !Array.isArray(compra.detalle.planCuotas));
    if (!necesitaMigracion) return;

    for (const compra of compras) {
      if (Array.isArray(compra.detalle.planCuotas)) continue;
      const valor = Math.abs(compra.monto);
      const cuotas = Number(compra.detalle.cuotas) || 1;
      const cuotaMensual = Number(compra.detalle.cuotaMensual) || Math.round(valor / cuotas);
      const totalAPagar = Math.max(valor, Number(compra.detalle.totalAPagar) || cuotaMensual * cuotas);
      compra.detalle.planCuotas = this.#crearCuotas(valor, cuotas, cuotaMensual, totalAPagar);
    }

    // Los datos anteriores guardaban pagos como abonos directos al capital.
    // Se reconstruyen en ese mismo orden para conservar el cupo disponible actual.
    const comprasActivas = [];
    for (const movimiento of this.historial().reverse()) {
      if (movimiento.tipo === "Compra en cuotas") {
        comprasActivas.push(movimiento);
      } else if (movimiento.tipo === "Pago de tarjeta" && !Array.isArray(movimiento.detalle.aplicaciones)) {
        let restante = Number(movimiento.detalle.valorPagado) || movimiento.monto;
        let capitalAbonado = 0;
        const aplicaciones = [];
        for (const compra of comprasActivas) {
          for (let indice = 0; indice < compra.detalle.planCuotas.length && restante > 0; indice++) {
            const cuota = compra.detalle.planCuotas[indice];
            const capital = Math.min(restante, cuota.capitalPendiente);
            cuota.capitalPendiente -= capital;
            cuota.montoPendiente = cuota.capitalPendiente + cuota.interesPendiente;
            restante -= capital;
            capitalAbonado += capital;
            if (capital) aplicaciones.push({ descripcion: compra.detalle.descripcion || "Compra", cuota: indice + 1, valor: capital, intereses: 0, capital });
          }
        }
        movimiento.detalle.valorPagado = Number(movimiento.detalle.valorPagado) || movimiento.monto;
        movimiento.detalle.capitalAbonado = capitalAbonado;
        movimiento.detalle.interesesAbonados = 0;
        movimiento.detalle.aplicaciones = aplicaciones;
      }
    }
  }
}
