/* MOVA — js/ui/transferencias.js (HU-07: transferencias) */

let transferenciaBorrador = { numeroOrigen: "", numeroDestino: "", valor: "" };

function transferEscapar(texto) {
  return String(texto ?? "").replace(/[&<>"']/g, (caracter) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[caracter]);
}

function transferProducto(numero) {
  return clienteActual?.productos.find((producto) => producto.numero === numero) || null;
}

function transferOrigenesHtml() {
  const origenes = (clienteActual?.productos || []).filter(
    (producto) => producto.codigo !== "tarjeta" && producto.permiteTransferencias
  );
  if (!origenes.length) {
    return `<div class="info-note"><i data-icon="shield"></i> No tienes cuentas habilitadas para enviar transferencias.</div>
      <button class="btn btn-secondary full" data-go="accounts"><span>Ver mis cuentas</span></button>`;
  }
  const opciones = origenes.map((producto) => `<option value="${transferEscapar(producto.numero)}" ${producto.numero === transferenciaBorrador.numeroOrigen ? "selected" : ""}>${transferEscapar(producto.tipo)} · ${transferEscapar(producto.numero)} — ${formatMoney(producto.saldo)}</option>`).join("");
  return `<div class="transfer-fields">
    <label class="field" for="transfer-origin"><span>Cuenta de origen</span><div class="field-control"><select id="transfer-origin" required>${opciones}</select></div></label>
    <p class="info-note"><i data-icon="shield"></i> Las tarjetas de crédito no pueden enviar ni recibir transferencias.</p>
    <div id="transfer-notice" aria-live="polite"></div>
    <button class="btn btn-primary full" id="transfer-origin-continue"><span>Continuar</span></button>
  </div>`;
}

function transferDestinoHtml() {
  return `<div class="transfer-fields">
    <label class="field" for="transfer-destination"><span>Número de cuenta destino</span><div class="field-control"><input id="transfer-destination" type="text" inputmode="numeric" autocomplete="off" maxlength="30" value="${transferEscapar(transferenciaBorrador.numeroDestino)}" placeholder="Escribe el número de cuenta" required /></div></label>
    <label class="field" for="transfer-amount"><span>Monto a transferir</span><div class="field-control"><input id="transfer-amount" type="number" min="1" step="1" value="${transferEscapar(transferenciaBorrador.valor)}" placeholder="250000" required /></div></label>
    <div id="transfer-notice" aria-live="polite"></div>
    <div class="review-actions"><button class="btn btn-secondary" id="transfer-back-origin"><span>Volver</span></button><button class="btn btn-primary" id="transfer-review-btn"><span>Revisar transferencia</span></button></div>
  </div>`;
}

function transferReviewHtml(origen, encontrado, valor) {
  const { cliente: destinatario, producto: destino } = encontrado;
  return `<div class="review">
    <h2>Confirma los datos</h2><p>Revisa el destinatario y el monto antes de enviar.</p>
    <div><span>Desde</span><b>${transferEscapar(origen.tipo)}<br />${transferEscapar(origen.numero)}</b></div>
    <div><span>Para</span><b>${transferEscapar(destinatario.nombre)}<br />${transferEscapar(destino.tipo)} · ${transferEscapar(destino.numero)}</b></div>
    <div><span>Monto</span><strong>${formatMoney(valor)}</strong></div>
    <div id="transfer-notice" aria-live="polite"></div>
    <div class="review-actions"><button class="btn btn-secondary" id="transfer-edit-btn"><span>Volver</span></button><button class="btn btn-primary" id="transfer-confirm-btn"><span>Confirmar transferencia</span></button></div>
  </div>`;
}

function transferComprobanteHtml(resultado, valor, origen) {
  const referencia = `MOV-${Date.now().toString().slice(-8)}`;
  return `<section class="panel transfer-success">
    <i data-icon="check" data-size="34"></i><h2>¡Transferencia exitosa!</h2>
    <p>Enviaste <b>${formatMoney(valor)}</b> a <b>${transferEscapar(resultado.destinatario)}</b>.</p>
    <div><span>Número de comprobante</span><b>${referencia}</b></div>
    <div><span>Cuenta de origen</span><b>${transferEscapar(origen.numero)}</b></div>
    <div><span>Nuevo saldo</span><b>${formatMoney(resultado.movimiento.saldoResultante)}</b></div>
    <button class="btn btn-primary" id="transfer-again-btn"><span>Hacer otra transferencia</span></button><button class="btn btn-secondary" data-go="dashboard"><span>Volver al inicio</span></button>
  </section>`;
}

function transferHtml() {
  transferenciaBorrador = { numeroOrigen: "", numeroDestino: "", valor: "" };
  return `<div class="page-heading"><div><div class="eyebrow"><span></span> Mueve tu dinero</div><h1>Nueva transferencia</h1><p>Envía dinero de forma rápida y segura.</p></div></div>
  <div id="transfer-body"><div class="transfer-layout"><section class="panel transfer-form">
    <div class="steps"><span class="active" id="transfer-step-1">1 <small>Origen</small></span><i></i><span id="transfer-step-2">2 <small>Destino</small></span><i></i><span id="transfer-step-3">3 <small>Confirmar</small></span></div>
    <div id="transfer-step-content">${transferOrigenesHtml()}</div>
  </section><aside class="panel safe-panel"><i data-icon="shield"></i><h3>Tu transferencia está protegida</h3><p>Validamos cada movimiento para mantener tu dinero seguro.</p><hr /><b>Antes de confirmar</b><span><i data-icon="check" data-size="16"></i> Verifica el beneficiario</span><span><i data-icon="check" data-size="16"></i> Confirma el monto</span></aside></div></div>`;
}

function transferAviso(mensaje) {
  const aviso = document.getElementById("transfer-notice");
  if (aviso) aviso.innerHTML = `<div class="field"><small role="alert">${transferEscapar(mensaje)}</small></div>`;
}

function transferPaso(numero) {
  [1, 2, 3].forEach((paso) => document.getElementById(`transfer-step-${paso}`).classList.toggle("active", paso <= numero));
}

function transferMostrarOrigen() {
  transferPaso(1);
  const contenido = document.getElementById("transfer-step-content");
  contenido.innerHTML = transferOrigenesHtml();
  renderIcons(contenido);
  contenido.querySelectorAll("[data-go]").forEach((elemento) => elemento.addEventListener("click", () => go(elemento.dataset.go)));
  const continuar = document.getElementById("transfer-origin-continue");
  if (continuar) continuar.addEventListener("click", () => {
    transferenciaBorrador.numeroOrigen = document.getElementById("transfer-origin").value;
    if (!transferProducto(transferenciaBorrador.numeroOrigen)) return transferAviso("Selecciona una cuenta de origen válida.");
    transferMostrarDestino();
  });
}

function transferMostrarDestino() {
  transferPaso(2);
  const contenido = document.getElementById("transfer-step-content");
  contenido.innerHTML = transferDestinoHtml();
  document.getElementById("transfer-back-origin").addEventListener("click", transferMostrarOrigen);
  document.getElementById("transfer-review-btn").addEventListener("click", () => {
    transferenciaBorrador.numeroDestino = document.getElementById("transfer-destination").value.trim();
    transferenciaBorrador.valor = document.getElementById("transfer-amount").value;
    const origen = transferProducto(transferenciaBorrador.numeroOrigen);
    const valor = Number(transferenciaBorrador.valor);
    if (!origen) return transferAviso("La cuenta de origen ya no está disponible. Vuelve a seleccionarla.");
    if (!transferenciaBorrador.numeroDestino) return transferAviso("Escribe el número de cuenta destino.");
    if (!Number.isFinite(valor) || valor <= 0 || !Number.isInteger(valor)) return transferAviso("El valor debe ser un número entero mayor a 0.");
    const encontrado = sistema.buscarProductoPorNumero(transferenciaBorrador.numeroDestino);
    if (!encontrado) return transferAviso("La cuenta de destino no existe.");
    transferMostrarRevision(origen, encontrado, valor);
  });
}

function transferMostrarRevision(origen, encontrado, valor) {
  transferPaso(3);
  const contenido = document.getElementById("transfer-step-content");
  contenido.innerHTML = transferReviewHtml(origen, encontrado, valor);
  document.getElementById("transfer-edit-btn").addEventListener("click", transferMostrarDestino);
  document.getElementById("transfer-confirm-btn").addEventListener("click", (evento) => {
    const boton = evento.currentTarget;
    boton.disabled = true;
    try {
      const resultado = sistema.transferir(clienteActual, transferenciaBorrador.numeroOrigen, transferenciaBorrador.numeroDestino, Number(transferenciaBorrador.valor));
      document.getElementById("transfer-body").innerHTML = transferComprobanteHtml(resultado, Number(transferenciaBorrador.valor), origen);
      renderIcons(document.getElementById("transfer-body"));
      document.getElementById("transfer-again-btn").addEventListener("click", () => renderClientScreen("transfer"));
      document.querySelector("#transfer-body [data-go='dashboard']").addEventListener("click", () => go("dashboard"));
    } catch (error) {
      boton.disabled = false;
      transferAviso(error.message);
    }
  });
}

registrarPantalla("transfer", transferHtml, transferMostrarOrigen);
