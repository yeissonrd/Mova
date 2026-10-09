/* MOVA — js/ui/transferencias.js  (HU-07: transferencias)
   Pantalla: transfer (Transferir). */

function transferStepFieldsHtml() {
  return `
  <div class="transfer-fields">
    <label class="field"><span>Cuenta de origen</span>
      <div class="select-card"><i data-icon="wallet"></i><div><b>Ahorros •••• 4832</b><small>Disponible: ${formatMoney(3250000)}</small></div><i data-icon="chevron" data-size="16"></i></div>
    </label>
    <label class="field"><span>Beneficiario</span>
      <div class="select-card"><div class="avatar">MR</div><div><b>María Rodríguez</b><small>Cuenta de ahorros •••• 0291</small></div><i data-icon="chevron" data-size="16"></i></div>
    </label>
    <label class="field"><span>Monto a transferir</span><div class="field-control"><input placeholder="$ 250.000" /></div></label>
    <label class="field"><span>Mensaje (opcional)</span><div class="field-control"><input placeholder="Ej. Almuerzo del sábado" /></div></label>
    <div class="info-note"><i data-icon="shield"></i> Las tarjetas de crédito no pueden recibir transferencias.</div>
    <button class="btn btn-primary full" id="transfer-continue-btn"><span>Continuar</span></button>
  </div>`;
}

function transferStepReviewHtml() {
  return `
  <div class="review">
    <h2>Revisa los datos</h2>
    <p>Confirma que todo esté correcto antes de enviar.</p>
    <div><span>Desde</span><b>Cuenta de ahorros •••• 4832</b></div>
    <div><span>Para</span><b>María Rodríguez<br />•••• 0291</b></div>
    <div><span>Monto</span><strong>${formatMoney(250000)}</strong></div>
    <div><span>Costo</span><b>${formatMoney(0)}</b></div>
    <div class="review-actions">
      <button class="btn btn-secondary" id="transfer-back-btn"><span>Volver</span></button>
      <button class="btn btn-primary" id="transfer-confirm-btn"><span>Confirmar transferencia</span></button>
    </div>
  </div>`;
}

function transferStepSuccessHtml() {
  return `
  <section class="panel transfer-success">
    <i data-icon="check" data-size="34"></i>
    <h2>¡Transferencia exitosa!</h2>
    <p>Enviaste <b>${formatMoney(250000)}</b> a María Rodríguez.</p>
    <div><span>Número de comprobante</span><b>MOV-847291</b></div>
    <button class="btn btn-primary" id="transfer-again-btn"><span>Hacer otra transferencia</span></button>
    <button class="btn btn-secondary" data-go="dashboard"><span>Volver al inicio</span></button>
  </section>`;
}

function transferHtml() {
  return `
  <div class="page-heading">
    <div>
      <div class="eyebrow"><span></span> Mueve tu dinero</div>
      <h1>Nueva transferencia</h1>
      <p>Envía dinero de forma rápida y segura.</p>
    </div>
  </div>
  <div id="transfer-body">
    <div class="transfer-layout">
      <section class="panel transfer-form">
        <div class="steps">
          <span class="active" id="transfer-step-1">1 <small>Datos</small></span>
          <i></i>
          <span id="transfer-step-2">2 <small>Revisar</small></span>
          <i></i>
          <span>3 <small>Confirmar</small></span>
        </div>
        <div id="transfer-step-content">${transferStepFieldsHtml()}</div>
      </section>
      <aside class="panel safe-panel" id="transfer-safe-panel">
        <i data-icon="shield"></i>
        <h3>Tu transferencia está protegida</h3>
        <p>Validamos cada movimiento para mantener tu dinero seguro.</p>
        <hr />
        <b>Antes de confirmar</b>
        <span><i data-icon="check" data-size="16"></i> Verifica el beneficiario</span>
        <span><i data-icon="check" data-size="16"></i> Confirma el monto</span>
      </aside>
    </div>
  </div>`;
}

function wireTransferStep(step) {
  const stepContent = document.getElementById("transfer-step-content");
  const body = document.getElementById("transfer-body");

  if (step === "fields") {
    document.getElementById("transfer-step-1").classList.add("active");
    document.getElementById("transfer-step-2").classList.remove("active");
    stepContent.innerHTML = transferStepFieldsHtml();
    renderIcons(stepContent);
    document.getElementById("transfer-continue-btn").addEventListener("click", () => wireTransferStep("review"));
  } else if (step === "review") {
    document.getElementById("transfer-step-2").classList.add("active");
    stepContent.innerHTML = transferStepReviewHtml();
    renderIcons(stepContent);
    document.getElementById("transfer-back-btn").addEventListener("click", () => wireTransferStep("fields"));
    document.getElementById("transfer-confirm-btn").addEventListener("click", () => wireTransferStep("done"));
  } else if (step === "done") {
    body.innerHTML = transferStepSuccessHtml();
    renderIcons(body);
    document.getElementById("transfer-again-btn").addEventListener("click", () => renderClientScreen("transfer"));
    document.querySelectorAll("#transfer-body [data-go]").forEach((el) => {
      el.addEventListener("click", () => go(el.dataset.go));
    });
  }
}

registrarPantalla("transfer", transferHtml, () => wireTransferStep("fields"));
