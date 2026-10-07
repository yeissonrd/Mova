/* ============================================================
   Cuenta — clase BASE (abstracta) de todos los productos bancarios.
   De ella heredan: CuentaAhorros, CuentaCorriente y TarjetaCredito.

   Aquí vive lo que TODOS los productos comparten:
   - número y saldo (privados: solo cambian con los métodos de la clase)
   - registro de movimientos y su historial (HU-03)
   - consignar, retirar y transferir

   Las clases hijas cambian reglas puntuales sobrescribiendo métodos
   (polimorfismo): por ejemplo, CuentaAhorros.retirar() cobra el 1,5 %.
   ============================================================ */
class Cuenta {
  // Atributos privados (encapsulamiento).
  #numero;
  #saldo;
  #movimientos;

  constructor(numero, saldoInicial = 0, movimientos = []) {
    // JavaScript no tiene "abstract", así que lo simulamos: no se puede hacer new Cuenta().
    if (new.target === Cuenta) {
      throw new Error("Cuenta es una clase base: usa CuentaAhorros, CuentaCorriente o TarjetaCredito.");
    }
    this.#numero = numero;
    this.#saldo = saldoInicial;
    this.#movimientos = movimientos;
  }

  // ---------- Consultas ----------
  get numero() {
    return this.#numero;
  }

  get saldo() {
    return this.#saldo;
  }

  get codigo() {
    return "cuenta"; // identificador interno (se usa al guardar y en las reglas de transferencia)
  }

  get tipo() {
    return "Cuenta"; // nombre para mostrar en pantalla
  }

  get permiteTransferencias() {
    return true; // TarjetaCredito lo cambia a false
  }

  // HU-03 criterio 3: el saldo consultado siempre es el más reciente.
  consultarSaldo() {
    return this.#saldo;
  }

  // HU-03 criterio 2: historial ordenado por fecha descendente (el más reciente primero).
  historial() {
    // Se invierte primero para que, si dos movimientos tienen la misma hora, el último quede arriba.
    return [...this.#movimientos].reverse().sort((a, b) => b.fecha - a.fecha);
  }

  // ---------- Reglas que las clases hijas pueden cambiar ----------
  // Cuánto dinero se puede sacar como máximo en este momento.
  limiteRetiro() {
    return this.#saldo;
  }

  // Frase usada en el mensaje de error cuando el retiro supera el límite.
  descripcionLimite() {
    return "tu saldo disponible";
  }

  // ---------- Operaciones ----------
  consignar(valor) {
    this._validarMonto(valor);
    return this._aplicar("Consignación", valor);
  }

  retirar(valor) {
    this._validarMonto(valor);
    const limite = this.limiteRetiro();
    if (valor > limite) {
      throw new Error(`El valor supera ${this.descripcionLimite()}. Máximo para retirar: ${Cuenta.formatear(limite)}.`);
    }
    return this._aplicar("Retiro", -valor);
  }

  // Mueve dinero de ESTA cuenta a otra. Las reglas que dependen de los clientes
  // (mismo cliente, mismo tipo...) las revisa Sistema.transferir().
  transferir(destino, valor) {
    if (!(destino instanceof Cuenta)) {
      throw new Error("La cuenta de destino no es válida.");
    }
    if (destino === this) {
      throw new Error("No puedes transferir a la misma cuenta.");
    }
    if (!this.permiteTransferencias || !destino.permiteTransferencias) {
      throw new Error("La tarjeta de crédito no permite transferencias.");
    }
    this._validarMonto(valor);
    const limite = this.limiteRetiro();
    if (valor > limite) {
      throw new Error(`El valor supera ${this.descripcionLimite()}. Máximo para transferir: ${Cuenta.formatear(limite)}.`);
    }
    const salida = this._aplicar("Transferencia enviada", -valor, { contraparte: destino.numero });
    destino._aplicar("Transferencia recibida", valor, { contraparte: this.numero });
    return salida;
  }

  // ---------- Métodos "protegidos" (el guion bajo indica: solo para esta clase y sus hijas) ----------
  _validarMonto(valor) {
    if (typeof valor !== "number" || !Number.isFinite(valor) || valor <= 0) {
      throw new Error("El valor debe ser un número mayor a 0.");
    }
  }

  // ÚNICO punto donde cambia el saldo: actualiza el saldo y deja el registro en el historial.
  _aplicar(tipo, cambio, detalle = {}) {
    this.#saldo = this.#saldo + cambio;
    const movimiento = new Movimiento(tipo, cambio, this.#saldo, detalle);
    this.#movimientos.push(movimiento);
    return movimiento;
  }

  // ---------- Guardado en localStorage ----------
  toJSON() {
    return {
      codigo: this.codigo,
      numero: this.#numero,
      saldo: this.#saldo,
      movimientos: this.#movimientos.map((m) => m.toJSON()),
    };
  }

  static formatear(valor) {
    return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(valor);
  }
}
