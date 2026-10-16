/* MOVA — js/ui/extracto.js  (CORRECCIONES: extracto mensual en PDF)
   El botón "Descargar extracto" del Inicio abre una ventana para elegir el mes
   (por defecto el actual) y genera un extracto con formato de banco.
   No usa librerías: arma una página imprimible y abre el diálogo de impresión,
   donde se elige "Guardar como PDF". */

/* ===================== CLASE: Extracto ===================== */
class Extracto {
  static MESES = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

  #cliente;
  #desde; // primer instante del mes
  #hasta; // primer instante del mes siguiente

  constructor(cliente, anio, mes) {
    this.#cliente = cliente;
    this.#desde = new Date(anio, mes, 1);
    this.#hasta = new Date(anio, mes + 1, 1);
  }

  get cliente() { return this.#cliente; }
  get desde() { return this.#desde; }

  get nombrePeriodo() {
    return `${Extracto.MESES[this.#desde.getMonth()]} de ${this.#desde.getFullYear()}`;
  }

  // Meses que se pueden elegir: el actual y los 11 anteriores.
  static mesesDisponibles(hoy = new Date()) {
    const lista = [];
    for (let i = 0; i < 12; i++) {
      const fecha = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
      lista.push({ anio: fecha.getFullYear(), mes: fecha.getMonth() });
    }
    return lista;
  }

  // Movimientos de UN producto dentro del mes, del más antiguo al más reciente.
  #movimientosDelMes(producto) {
    return producto
      .historial()
      .filter((m) => m.fecha >= this.#desde && m.fecha < this.#hasta)
      .reverse();
  }

  // Saldo del producto al empezar el mes.
  #saldoInicial(producto, delMes) {
    if (delMes.length > 0) {
      return delMes[0].saldoResultante - delMes[0].monto;
    }
    const historial = producto.historial(); // más reciente primero
    const anterior = historial.find((m) => m.fecha < this.#desde);
    if (anterior) return anterior.saldoResultante;
    const posterior = [...historial].reverse().find((m) => m.fecha >= this.#hasta);
    if (posterior) return posterior.saldoResultante - posterior.monto;
    return producto.saldo;
  }

  // Resumen y detalle de cada producto del cliente.
  productos() {
    return this.#cliente.productos.map((producto) => {
      const movimientos = this.#movimientosDelMes(producto);
      const saldoInicial = this.#saldoInicial(producto, movimientos);
      const abonos = movimientos.filter((m) => m.monto > 0).reduce((t, m) => t + m.monto, 0);
      const cargos = movimientos.filter((m) => m.monto < 0).reduce((t, m) => t + Math.abs(m.monto), 0);
      const saldoFinal = movimientos.length > 0 ? movimientos[movimientos.length - 1].saldoResultante : saldoInicial;
      return { producto, movimientos, saldoInicial, abonos, cargos, saldoFinal };
    });
  }

  /* ---------- HTML imprimible ---------- */
  static #esc(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }

  static #descripcion(m) {
    const d = m.detalle || {};
    if (m.tipo === "Compra en cuotas") {
      return `Compra en cuotas${d.descripcion ? " · " + d.descripcion : ""}${d.cuotas ? " (" + d.cuotas + " cuotas)" : ""}`;
    }
    if (m.tipo.startsWith("Transferencia") && d.contraparte) {
      return `${m.tipo} · producto ${d.contraparte}`;
    }
    return m.tipo;
  }

  static #valor(monto) {
    return (monto > 0 ? "+ " : "− ") + formatMoney(Math.abs(monto));
  }

  toHtml(fechaEmision = new Date()) {
    const esc = Extracto.#esc;
    const datos = this.productos();
    const c = this.#cliente;
    const emision = fechaEmision.toLocaleDateString("es-CO", { day: "numeric", month: "long", year: "numeric" });

    const resumen = datos
      .map(
        (d) => `
        <tr>
          <td>${esc(d.producto.tipo)}</td>
          <td>${esc(d.producto.numero)}</td>
          <td class="num">${formatMoney(d.saldoInicial)}</td>
          <td class="num">${formatMoney(d.abonos)}</td>
          <td class="num">${formatMoney(d.cargos)}</td>
          <td class="num"><b>${formatMoney(d.saldoFinal)}</b></td>
        </tr>`,
      )
      .join("");

    const detalle = datos
      .map((d) => {
        const esTarjeta = d.producto.codigo === "tarjeta";
        const filas = d.movimientos
          .map(
            (m) => `
          <tr>
            <td>${m.fecha.toLocaleString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}</td>
            <td>${esc(Extracto.#descripcion(m))}</td>
            <td class="num ${m.monto > 0 ? "pos" : "neg"}">${Extracto.#valor(m.monto)}</td>
            <td class="num">${formatMoney(m.saldoResultante)}</td>
          </tr>`,
          )
          .join("");
        return `
        <section class="producto">
          <h3>${esc(d.producto.tipo)} · ${esc(d.producto.numero)}</h3>
          ${
            d.movimientos.length === 0
              ? `<p class="vacio">Sin movimientos en este periodo.</p>`
              : `<table>
                  <thead><tr><th>Fecha</th><th>Descripción</th><th class="num">Valor</th><th class="num">${esTarjeta ? "Cupo disponible" : "Saldo"}</th></tr></thead>
                  <tbody>${filas}</tbody>
                </table>`
          }
        </section>`;
      })
      .join("");

    return `<!doctype html>
<html lang="es"><head><meta charset="UTF-8" />
<title>Extracto MOVA - ${esc(this.nombrePeriodo)} - ${esc(c.nombre)}</title>
<style>
  @page { size: A4; margin: 16mm; }
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #112d34; font-size: 12px; margin: 0; }
  header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 3px solid #20a995; padding-bottom: 12px; margin-bottom: 18px; }
  .marca { font-size: 26px; font-weight: 800; letter-spacing: .14em; color: #123f48; }
  .marca small { display: block; font-size: 10px; letter-spacing: 0; font-weight: 400; color: #557078; margin-top: 2px; }
  header h1 { margin: 0; font-size: 16px; text-align: right; }
  header p { margin: 3px 0 0; text-align: right; color: #557078; }
  .cliente { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 24px; background: #f1faf7; border: 1px solid #dff5ef; border-radius: 8px; padding: 12px 14px; margin-bottom: 20px; }
  .cliente span { color: #557078; }
  h2 { font-size: 13px; margin: 20px 0 8px; color: #123f48; text-transform: uppercase; letter-spacing: .06em; }
  h3 { font-size: 12px; margin: 0 0 6px; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; background: #123f48; color: white; font-size: 10px; padding: 6px 8px; }
  td { padding: 6px 8px; border-bottom: 1px solid #e3ecea; vertical-align: top; }
  .num { text-align: right; white-space: nowrap; }
  .pos { color: #168c7b; } .neg { color: #d95762; }
  .producto { margin-bottom: 18px; break-inside: avoid-page; }
  .vacio { color: #557078; margin: 4px 0; }
  tr { break-inside: avoid; }
  footer { margin-top: 24px; padding-top: 10px; border-top: 1px solid #dfe8e6; color: #557078; font-size: 10px; line-height: 1.5; }
</style></head>
<body>
  <header>
    <div class="marca">MOVA<small>Mueve tu dinero. Maneja tu futuro.</small></div>
    <div><h1>Extracto de cuenta</h1><p>${esc(this.nombrePeriodo)}</p></div>
  </header>
  <div class="cliente">
    <div><span>Cliente: </span><b>${esc(c.nombre)}</b></div>
    <div><span>Identificación: </span><b>${esc(c.identificacion)}</b></div>
    <div><span>Correo: </span>${esc(c.correo)}</div>
    <div><span>Fecha de emisión: </span>${esc(emision)}</div>
  </div>
  <h2>Resumen del periodo</h2>
  <table>
    <thead><tr><th>Producto</th><th>Número</th><th class="num">Saldo inicial</th><th class="num">Abonos</th><th class="num">Cargos</th><th class="num">Saldo final</th></tr></thead>
    <tbody>${resumen}</tbody>
  </table>
  <h2>Detalle de movimientos</h2>
  ${detalle}
  <footer>Para la tarjeta de crédito, el saldo corresponde al cupo disponible. Este extracto es informativo y fue generado por MOVA, proyecto académico de CESDE. Si encuentras alguna diferencia, crea una solicitud en el Centro de ayuda.</footer>
</body></html>`;
  }
}

/* ===================== VENTANA PARA ELEGIR EL MES ===================== */
function cerrarVentanaExtracto() {
  const fondo = document.getElementById("extracto-fondo");
  if (fondo) fondo.remove();
}

function abrirVentanaExtracto() {
  if (!clienteActual) return;
  cerrarVentanaExtracto();
  const meses = Extracto.mesesDisponibles();
  const opciones = meses
    .map((m, i) => {
      const nombre = Extracto.MESES[m.mes];
      return `<option value="${m.anio}-${m.mes}"${i === 0 ? " selected" : ""}>${nombre.charAt(0).toUpperCase() + nombre.slice(1)} ${m.anio}${i === 0 ? " (mes actual)" : ""}</option>`;
    })
    .join("");

  const fondo = document.createElement("div");
  fondo.id = "extracto-fondo";
  fondo.className = "extracto-fondo";
  fondo.innerHTML = `
    <div class="extracto-modal" role="dialog" aria-modal="true" aria-labelledby="extracto-titulo">
      <h2 id="extracto-titulo">Descargar extracto</h2>
      <p>Elige el mes. Se abrirá la ventana de impresión: selecciona <b>Guardar como PDF</b> como destino.</p>
      <label class="field"><span>Mes del extracto</span><div class="field-control"><select id="extracto-mes">${opciones}</select></div></label>
      <div class="extracto-acciones">
        <button class="btn btn-secondary" type="button" id="extracto-cancelar"><span>Cancelar</span></button>
        <button class="btn btn-primary" type="button" id="extracto-generar"><span>Generar PDF</span></button>
      </div>
    </div>`;
  document.body.appendChild(fondo);

  fondo.addEventListener("click", (e) => {
    if (e.target === fondo) cerrarVentanaExtracto();
  });
  document.getElementById("extracto-cancelar").addEventListener("click", cerrarVentanaExtracto);
  document.getElementById("extracto-generar").addEventListener("click", () => {
    const [anio, mes] = document.getElementById("extracto-mes").value.split("-").map(Number);
    imprimirExtracto(new Extracto(clienteActual, anio, mes));
    cerrarVentanaExtracto();
  });
}

// Pinta el extracto en un marco oculto y abre la impresión del navegador.
function imprimirExtracto(extracto) {
  const marco = document.createElement("iframe");
  marco.style.cssText = "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
  document.body.appendChild(marco);
  marco.srcdoc = extracto.toHtml();
  marco.addEventListener("load", () => {
    const tituloOriginal = document.title;
    // Chrome sugiere el título de la página como nombre del archivo PDF
    document.title = `Extracto MOVA - ${extracto.nombrePeriodo}`;
    const limpiar = () => {
      document.title = tituloOriginal;
      marco.remove();
    };
    marco.contentWindow.addEventListener("afterprint", limpiar);
    window.addEventListener("afterprint", limpiar, { once: true }); // respaldo según el navegador
    marco.contentWindow.focus();
    marco.contentWindow.print();
  });
}

/* ===================== INICIO ===================== */
alIniciar(() => {
  // El botón se vuelve a dibujar cada vez que se muestra el Inicio, por eso se escucha en el contenedor.
  const contenido = document.getElementById("client-content");
  if (!contenido) return;
  contenido.addEventListener("click", (e) => {
    if (e.target.closest("#btn-extracto")) abrirVentanaExtracto();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") cerrarVentanaExtracto();
  });
});
