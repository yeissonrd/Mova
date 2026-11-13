/* MOVA — js/ui/metas.js  (HU-17: metas de ahorro)
   Pantalla "goals": el cliente crea metas, aparta dinero de su cuenta de ahorros,
   lo devuelve y ve su avance. Se entra desde Inicio (acceso rápido) y desde Mis cuentas.
   Las reglas están en MetaAhorro, CuentaAhorros, Cliente y Sistema. */

// Ícono propio de la pantalla (diana).
ICON_PATHS.meta =
  '<circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" /><path d="m15 9 5-5M17 4h3v3" />';

// Mensaje que se muestra después de repintar la pantalla (éxito o error).
let avisoPendienteMetas = null;

function metasEscapar(valor) {
  return String(valor ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// "$ 250.000" → 250000. Vacío o sin números → NaN.
function metasLeerValor(texto) {
  const limpio = String(texto).replace(/[^\d]/g, "");
  return limpio ? Number(limpio) : NaN;
}

function metasFecha(fecha) {
  return fecha.toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });
}

/* ===================== HTML DE LA PANTALLA ===================== */
function metaCardHtml(meta) {
  const sugerido = meta.aporteMensualSugerido();
  const detalleFecha = meta.cumplida
    ? `Cumplida el ${metasFecha(meta.fechaCumplida)}`
    : meta.fechaLimite
      ? `Fecha límite: ${metasFecha(meta.fechaLimite)}${sugerido ? ` · Aporte sugerido: <b>${formatMoney(sugerido)}</b> al mes` : ""}`
      : "Sin fecha límite";
  return `
    <article class="panel meta-card${meta.cumplida ? " cumplida" : ""}">
      <div class="meta-cabecera">
        <i data-icon="meta" data-size="20"></i>
        <h3>${metasEscapar(meta.nombre)}</h3>
        <span class="meta-estado">${meta.cumplida ? "Cumplida" : "Activa"}</span>
      </div>
      <p class="meta-cifras"><b>${formatMoney(meta.ahorrado)}</b> de ${formatMoney(meta.objetivo)}</p>
      <div class="meta-barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${meta.progreso}" aria-label="Avance de ${metasEscapar(meta.nombre)}">
        <span style="width:${meta.progreso}%"></span>
      </div>
      <div class="meta-avance"><span>${meta.progreso} %</span><span>${meta.falta > 0 ? `Faltan ${formatMoney(meta.falta)}` : "¡Objetivo alcanzado!"}</span></div>
      <p class="meta-detalle">${detalleFecha}</p>
      <div class="meta-acciones">
        <button class="btn btn-primary" data-meta-accion="aportar" data-meta="${metasEscapar(meta.id)}" ${meta.cumplida ? "disabled" : ""}><i data-icon="plus" data-size="17"></i><span>Aportar</span></button>
        <button class="btn btn-secondary" data-meta-accion="devolver" data-meta="${metasEscapar(meta.id)}" ${meta.ahorrado === 0 ? "disabled" : ""}><i data-icon="minus" data-size="17"></i><span>Devolver</span></button>
        ${meta.ahorrado === 0 ? `<button class="meta-eliminar" data-meta-accion="eliminar" data-meta="${metasEscapar(meta.id)}">Eliminar</button>` : ""}
      </div>
    </article>`;
}

function goalsHtml() {
  const cliente = clienteActual;
  const cuenta = cliente.buscarProductoPorCodigo("ahorros");
  const metas = cliente.metas.sort((a, b) => Number(a.cumplida) - Number(b.cumplida) || b.fechaCreacion - a.fechaCreacion);
  const activas = cliente.metasActivas.length;
  const puedeCrear = Boolean(cuenta) && activas < MetaAhorro.MAX_ACTIVAS;

  const encabezado = `
    <div class="page-heading">
      <div>
        <div class="eyebrow"><span></span> Tu futuro</div>
        <h1>Metas de ahorro</h1>
        <p>Aparta dinero de tu cuenta de ahorros para lo que quieres lograr.</p>
      </div>
      <button class="btn btn-primary" id="metas-nueva" ${puedeCrear ? "" : "disabled"}><i data-icon="plus" data-size="18"></i><span>Nueva meta</span></button>
    </div>
    <div id="metas-aviso" class="metas-aviso" role="status" aria-live="polite" hidden></div>`;

  if (!cuenta) {
    return `${encabezado}
      <section class="panel metas-vacio">
        <i data-icon="wallet" data-size="28"></i>
        <h2>Necesitas una cuenta de ahorros</h2>
        <p>Las metas se alimentan desde tu cuenta de ahorros. Solicítala en el Centro de ayuda o comunícate con el banco.</p>
        <button class="btn btn-secondary" data-go="help"><span>Ir al centro de ayuda</span></button>
      </section>`;
  }

  return `${encabezado}
    <div class="metas-resumen">
      <div><small>Disponible en ahorros</small><b>${formatMoney(cuenta.saldo)}</b></div>
      <div><small>Apartado en metas</small><b>${formatMoney(cliente.totalEnMetas)}</b></div>
      <div><small>Metas activas</small><b>${activas} de ${MetaAhorro.MAX_ACTIVAS}</b></div>
    </div>
    ${
      metas.length === 0
        ? `<section class="panel metas-vacio">
            <i data-icon="meta" data-size="28"></i>
            <h2>Aún no tienes metas</h2>
            <p>Crea tu primera meta (un viaje, un computador, tu fondo de emergencia) y aparta dinero para ella desde tu cuenta de ahorros.</p>
          </section>`
        : `<div class="metas-grid">${metas.map(metaCardHtml).join("")}</div>`
    }
    <p class="metas-nota">Apartar o devolver dinero de una meta no es un retiro: no cobra ni abona el rendimiento del 1,5 %. El dinero apartado sigue siendo tuyo y vuelve a tu cuenta cuando lo devuelvas.</p>`;
}

/* ===================== VENTANAS (crear, aportar, devolver, eliminar) ===================== */
function cerrarVentanaMetas() {
  const fondo = document.getElementById("metas-fondo");
  if (fondo) fondo.remove();
}

function abrirVentanaMetas(contenido, alEnviar) {
  cerrarVentanaMetas();
  const fondo = document.createElement("div");
  fondo.id = "metas-fondo";
  fondo.className = "metas-fondo";
  fondo.innerHTML = `<form class="metas-modal" role="dialog" aria-modal="true" novalidate>${contenido}
      <p class="metas-error" id="metas-error" hidden></p>
      <div class="metas-modal-acciones">
        <button type="button" class="btn btn-secondary" data-metas-cerrar><span>Cancelar</span></button>
        <button type="submit" class="btn btn-primary" id="metas-confirmar"><span>Guardar</span></button>
      </div>
    </form>`;
  document.body.appendChild(fondo);
  renderIcons(fondo);
  fondo.addEventListener("click", (e) => {
    if (e.target === fondo || e.target.closest("[data-metas-cerrar]")) cerrarVentanaMetas();
  });
  const formulario = fondo.querySelector("form");
  formulario.addEventListener("submit", (e) => {
    e.preventDefault();
    const error = fondo.querySelector("#metas-error");
    error.hidden = true;
    try {
      avisoPendienteMetas = { tipo: "ok", texto: alEnviar(formulario) };
      cerrarVentanaMetas();
      renderClientScreen("goals");
    } catch (err) {
      error.textContent = err.message;
      error.hidden = false;
    }
  });
  const primero = formulario.querySelector("input");
  if (primero) primero.focus();
  return fondo;
}

function abrirNuevaMeta() {
  const manana = new Date();
  manana.setDate(manana.getDate() + 1);
  const minimo = manana.toISOString().slice(0, 10);
  const fondo = abrirVentanaMetas(
    `<h2>Nueva meta</h2>
     <p>Ponle un nombre, cuánto quieres ahorrar y, si quieres, para cuándo.</p>
     <label class="field"><span>Nombre de la meta</span><div class="field-control"><input id="meta-nombre" maxlength="${MetaAhorro.NOMBRE_MAX}" placeholder="Ej. Viaje a Cartagena" /></div></label>
     <label class="field"><span>Valor objetivo</span><div class="field-control"><input id="meta-objetivo" inputmode="numeric" placeholder="$ 2.000.000" /></div></label>
     <label class="field"><span>Fecha límite (opcional)</span><div class="field-control"><input id="meta-fecha" type="date" min="${minimo}" /></div></label>`,
    (form) => {
      const fecha = form.querySelector("#meta-fecha").value;
      const meta = sistema.crearMeta(clienteActual, {
        nombre: form.querySelector("#meta-nombre").value,
        objetivo: metasLeerValor(form.querySelector("#meta-objetivo").value),
        fechaLimite: fecha ? new Date(fecha + "T23:59:59") : null,
      });
      return `Creaste la meta "${meta.nombre}". Ahora aparta dinero con el botón Aportar.`;
    },
  );
  fondo.querySelector("#metas-confirmar span").textContent = "Crear meta";
  formatearCampoMetas(fondo.querySelector("#meta-objetivo"));
}

function abrirMovimientoMeta(id, accion) {
  const meta = clienteActual.buscarMeta(id);
  if (!meta) return;
  const cuenta = clienteActual.buscarProductoPorCodigo("ahorros");
  const aportar = accion === "aportar";
  const maximo = aportar ? Math.min(cuenta.saldo, meta.falta) : meta.ahorrado;
  const fondo = abrirVentanaMetas(
    `<h2>${aportar ? "Aportar a" : "Devolver de"} "${metasEscapar(meta.nombre)}"</h2>
     <p>${
       aportar
         ? `Disponible en ahorros: <b>${formatMoney(cuenta.saldo)}</b> · Le faltan <b>${formatMoney(meta.falta)}</b>.`
         : `Apartado en esta meta: <b>${formatMoney(meta.ahorrado)}</b>. El dinero vuelve a tu cuenta de ahorros.`
     }</p>
     <label class="field"><span>Valor</span><div class="field-control"><input id="meta-valor" inputmode="numeric" placeholder="$ 100.000" /></div></label>
     ${maximo > 0 ? `<button type="button" class="meta-todo" id="meta-todo">${aportar ? "Usar el máximo" : "Devolver todo"} (${formatMoney(maximo)})</button>` : ""}`,
    (form) => {
      const valor = metasLeerValor(form.querySelector("#meta-valor").value);
      if (aportar) {
        sistema.aportarAMeta(clienteActual, id, valor);
        const actual = clienteActual.buscarMeta(id);
        return actual.cumplida
          ? `¡Felicitaciones! Cumpliste tu meta "${actual.nombre}".`
          : `Apartaste ${formatMoney(valor)} para "${actual.nombre}". Llevas ${actual.progreso} %.`;
      }
      sistema.devolverDeMeta(clienteActual, id, valor);
      return `Devolviste ${formatMoney(valor)} de "${meta.nombre}" a tu cuenta de ahorros.`;
    },
  );
  fondo.querySelector("#metas-confirmar span").textContent = aportar ? "Aportar" : "Devolver";
  const campo = fondo.querySelector("#meta-valor");
  formatearCampoMetas(campo);
  const todo = fondo.querySelector("#meta-todo");
  if (todo) todo.addEventListener("click", () => { campo.value = formatMoney(maximo); campo.focus(); });
}

function abrirEliminarMeta(id) {
  const meta = clienteActual.buscarMeta(id);
  if (!meta) return;
  const fondo = abrirVentanaMetas(
    `<h2>Eliminar meta</h2>
     <p>¿Seguro que quieres eliminar la meta <b>"${metasEscapar(meta.nombre)}"</b>? No tiene dinero apartado, así que no pierdes nada.</p>`,
    () => {
      sistema.eliminarMeta(clienteActual, id);
      return `Eliminaste la meta "${meta.nombre}".`;
    },
  );
  const boton = fondo.querySelector("#metas-confirmar");
  boton.classList.replace("btn-primary", "btn-danger");
  boton.querySelector("span").textContent = "Sí, eliminar";
}

// Muestra el valor con formato de pesos al salir del campo.
function formatearCampoMetas(campo) {
  if (!campo) return;
  campo.addEventListener("blur", () => {
    const valor = metasLeerValor(campo.value);
    if (!Number.isNaN(valor)) campo.value = formatMoney(valor);
  });
}

/* ===================== EVENTOS DE LA PANTALLA ===================== */
function wireGoals() {
  // navegacion.js escribe la ruta DESPUÉS de esta función, por eso se espera un instante
  setTimeout(() => {
    document.getElementById("client-breadcrumb-label").textContent = "Metas de ahorro";
  }, 0);

  if (avisoPendienteMetas) {
    const aviso = document.getElementById("metas-aviso");
    aviso.textContent = avisoPendienteMetas.texto;
    aviso.className = "metas-aviso " + avisoPendienteMetas.tipo;
    aviso.hidden = false;
    avisoPendienteMetas = null;
  }

  const nueva = document.getElementById("metas-nueva");
  if (nueva) nueva.addEventListener("click", abrirNuevaMeta);

  document.querySelectorAll("#client-content [data-meta-accion]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const { metaAccion, meta } = boton.dataset;
      if (metaAccion === "eliminar") abrirEliminarMeta(meta);
      else abrirMovimientoMeta(meta, metaAccion);
    });
  });
}

registrarPantalla("goals", goalsHtml, wireGoals);

alIniciar(() => {
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.getElementById("metas-fondo")) cerrarVentanaMetas();
  });
});
