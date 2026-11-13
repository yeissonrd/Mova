/* MOVA — js/ui/admin-graficos.js  (CORRECCIONES: gráficos del Resumen del administrador)
   Gráficos hechos a mano en SVG (sin librerías) con los datos reales del banco:
   - Dinero en el banco: total en ahorros y en corriente al cierre de cada periodo.
   - Movimientos del banco: entradas y salidas de dinero de todos los productos.
   - Clientes registrados: clientes nuevos por periodo y total acumulado.
   Se agrupan por día (últimos 14), mes (últimos 12) o año (últimos 5). */

/* ===================== CLASE: EstadisticasBanco ===================== */
// Calcula las cifras de los gráficos. No dibuja nada: solo devuelve datos.
class EstadisticasBanco {
  static PERIODOS = Object.freeze({
    dia: { cantidad: 14, nombre: "día" },
    mes: { cantidad: 12, nombre: "mes" },
    anio: { cantidad: 5, nombre: "año" },
  });

  #clientes;
  #ahora;

  constructor(clientes, ahora = new Date()) {
    this.#clientes = clientes;
    this.#ahora = ahora;
  }

  // Lista de periodos [{ inicio, fin, etiqueta }], del más antiguo al más reciente. "fin" no se incluye.
  periodos(escala) {
    const config = EstadisticasBanco.PERIODOS[escala];
    if (!config) throw new Error("La escala debe ser dia, mes o anio.");
    const lista = [];
    const hoy = this.#ahora;
    for (let i = config.cantidad - 1; i >= 0; i--) {
      let inicio;
      let fin;
      if (escala === "dia") {
        inicio = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - i);
        fin = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() - i + 1);
      } else if (escala === "mes") {
        inicio = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1);
        fin = new Date(hoy.getFullYear(), hoy.getMonth() - i + 1, 1);
      } else {
        inicio = new Date(hoy.getFullYear() - i, 0, 1);
        fin = new Date(hoy.getFullYear() - i + 1, 0, 1);
      }
      lista.push({ inicio, fin, etiqueta: EstadisticasBanco.#etiqueta(inicio, escala) });
    }
    return lista;
  }

  static #etiqueta(fecha, escala) {
    if (escala === "dia") return fecha.toLocaleDateString("es-CO", { day: "numeric", month: "short" }).replace(".", "");
    if (escala === "mes") return fecha.toLocaleDateString("es-CO", { month: "short", year: "2-digit" }).replace(".", "").replace(" de ", " ");
    return String(fecha.getFullYear());
  }

  #cuentas(codigo) {
    return this.#clientes.flatMap((c) => c.productos).filter((p) => p.codigo === codigo);
  }

  // Saldo de una cuenta en un momento dado: el saldo que dejó su último movimiento antes de esa fecha.
  static #saldoEn(cuenta, momento) {
    const anterior = cuenta.historial().find((m) => m.fecha < momento); // historial va del más reciente al más antiguo
    return anterior ? anterior.saldoResultante : 0;
  }

  // HU-17: dinero que la cuenta tenía apartado en metas en ese momento (sigue siendo del cliente y del banco).
  static #enMetas(cuenta, momento) {
    return cuenta.historial()
      .filter((m) => m.esInterno && m.fecha < momento)
      .reduce((total, m) => total - m.monto, 0);
  }

  // Dinero en ahorros (incluye lo apartado en metas) y en corriente al cierre de cada periodo (el último usa el saldo actual).
  dinero(escala) {
    const ahorros = this.#cuentas("ahorros");
    const corrientes = this.#cuentas("corriente");
    const lista = this.periodos(escala);
    return lista.map((p, i) => {
      const ultimo = i === lista.length - 1;
      const suma = (cuentas) =>
        cuentas.reduce((total, c) => total + (ultimo ? c.saldo : EstadisticasBanco.#saldoEn(c, p.fin)) + EstadisticasBanco.#enMetas(c, p.fin), 0);
      const a = suma(ahorros);
      const c = suma(corrientes);
      return { etiqueta: p.etiqueta, ahorros: a, corriente: c, total: a + c };
    });
  }

  // Entradas (montos positivos) y salidas (montos negativos) de todos los productos en cada periodo.
  movimientos(escala) {
    // Los movimientos neutros (por ejemplo, un ajuste de cupo) no son dinero que entra ni sale.
    // HU-17: los aportes y devoluciones de metas tampoco (el dinero sigue en el banco).
    const todos = this.#clientes.flatMap((c) => c.productos).flatMap((p) => p.historial()).filter((m) => !m.esNeutro && !m.esInterno);
    return this.periodos(escala).map((p) => {
      const delPeriodo = todos.filter((m) => m.fecha >= p.inicio && m.fecha < p.fin);
      return {
        etiqueta: p.etiqueta,
        entradas: delPeriodo.filter((m) => m.monto > 0).reduce((s, m) => s + m.monto, 0),
        salidas: delPeriodo.filter((m) => m.monto < 0).reduce((s, m) => s - m.monto, 0),
        cantidad: delPeriodo.length,
      };
    });
  }

  // Clientes nuevos en cada periodo y total de clientes al cierre.
  clientes(escala) {
    return this.periodos(escala).map((p) => ({
      etiqueta: p.etiqueta,
      nuevos: this.#clientes.filter((c) => c.fechaRegistro >= p.inicio && c.fechaRegistro < p.fin).length,
      total: this.#clientes.filter((c) => c.fechaRegistro < p.fin).length,
    }));
  }
}

/* ===================== DIBUJO EN SVG ===================== */
let periodoGraficos = "mes";

const COLORES_GRAFICO = {
  ahorros: "#20a995",
  corriente: "#4d7fe5",
  total: "#123f48",
  entradas: "#20a995",
  salidas: "#d95762",
  nuevos: "#7a66d9",
  rejilla: "#e3ecea",
  texto: "#6b8287",
};

// Dinero corto para los ejes: $ 1,2 M, $ 350 mil, $ 900.
function dineroCorto(valor) {
  const abs = Math.abs(valor);
  const signo = valor < 0 ? "−" : "";
  if (abs >= 1e9) return `${signo}$ ${(abs / 1e9).toLocaleString("es-CO", { maximumFractionDigits: 1 })} mil M`;
  if (abs >= 1e6) return `${signo}$ ${(abs / 1e6).toLocaleString("es-CO", { maximumFractionDigits: 1 })} M`;
  if (abs >= 1e3) return `${signo}$ ${Math.round(abs / 1e3).toLocaleString("es-CO")} mil`;
  return `${signo}$ ${Math.round(abs).toLocaleString("es-CO")}`;
}

// Máximo "redondo" del eje Y y sus divisiones (por ejemplo 0, 500 mil, 1 M, 1,5 M, 2 M).
function escalaRedonda(maximo, divisiones = 4) {
  if (maximo <= 0) return { max: divisiones, paso: 1 };
  const bruto = maximo / divisiones;
  const potencia = Math.pow(10, Math.floor(Math.log10(bruto)));
  const paso = [1, 2, 2.5, 5, 10].map((f) => f * potencia).find((p) => p >= bruto);
  return { max: paso * divisiones, paso };
}

// Marco común: rejilla, etiquetas del eje Y y del eje X. Devuelve funciones para ubicar puntos.
function marcoGrafico({ ancho, alto, etiquetas, maximo, formatoY }) {
  const margen = { arriba: 14, derecha: 12, abajo: 30, izquierda: formatoY === "dinero" ? 74 : 36 };
  const anchoUtil = ancho - margen.izquierda - margen.derecha;
  const altoUtil = alto - margen.arriba - margen.abajo;
  const { max, paso } = escalaRedonda(maximo);
  const y = (valor) => margen.arriba + altoUtil - (Math.max(0, valor) / max) * altoUtil;
  const banda = anchoUtil / etiquetas.length;
  const x = (i) => margen.izquierda + banda * i + banda / 2;

  let svg = "";
  for (let v = 0; v <= max + paso / 2; v += paso) {
    const texto = formatoY === "dinero" ? dineroCorto(v) : Math.round(v).toLocaleString("es-CO");
    svg += `<line x1="${margen.izquierda}" x2="${ancho - margen.derecha}" y1="${y(v)}" y2="${y(v)}" stroke="${COLORES_GRAFICO.rejilla}" />`;
    svg += `<text x="${margen.izquierda - 8}" y="${y(v) + 4}" text-anchor="end" class="eje">${texto}</text>`;
  }
  // Si no caben todas las etiquetas del eje X, se muestra una de cada "salto" (contando desde la más reciente).
  const salto = Math.ceil(etiquetas.length / Math.max(1, Math.floor(anchoUtil / 50)));
  etiquetas.forEach((etiqueta, i) => {
    if ((etiquetas.length - 1 - i) % salto === 0) {
      svg += `<text x="${x(i)}" y="${alto - 9}" text-anchor="middle" class="eje">${escaparHtml(etiqueta)}</text>`;
    }
  });
  return { svg, x, y, banda, base: y(0) };
}

function envolverSvg(ancho, alto, descripcion, contenido) {
  return `<svg class="grafico-svg" width="${ancho}" height="${alto}" viewBox="0 0 ${ancho} ${alto}" role="img" aria-label="${escaparHtml(descripcion)}">${contenido}</svg>`;
}

function leyendaHtml(series) {
  return `<div class="grafico-leyenda">${series
    .map((s) => `<span><i style="background:${s.color}"></i>${s.nombre}</span>`)
    .join("")}</div>`;
}

// Gráfico de líneas con área: dinero en ahorros, corriente y total.
function graficoDinero(datos, ancho, alto) {
  const maximo = Math.max(...datos.map((d) => d.total));
  const m = marcoGrafico({ ancho, alto, etiquetas: datos.map((d) => d.etiqueta), maximo, formatoY: "dinero" });
  const linea = (campo) => datos.map((d, i) => `${i === 0 ? "M" : "L"}${m.x(i).toFixed(1)},${m.y(d[campo]).toFixed(1)}`).join(" ");
  const area = `${linea("total")} L${m.x(datos.length - 1).toFixed(1)},${m.base} L${m.x(0).toFixed(1)},${m.base} Z`;
  let svg = m.svg;
  svg += `<path d="${area}" fill="${COLORES_GRAFICO.total}" opacity=".07" />`;
  svg += `<path d="${linea("total")}" fill="none" stroke="${COLORES_GRAFICO.total}" stroke-width="2.5" stroke-linejoin="round" />`;
  svg += `<path d="${linea("ahorros")}" fill="none" stroke="${COLORES_GRAFICO.ahorros}" stroke-width="2" stroke-linejoin="round" />`;
  svg += `<path d="${linea("corriente")}" fill="none" stroke="${COLORES_GRAFICO.corriente}" stroke-width="2" stroke-dasharray="5 4" stroke-linejoin="round" />`;
  datos.forEach((d, i) => {
    svg += `<g class="punto"><circle cx="${m.x(i)}" cy="${m.y(d.total)}" r="4" fill="#fff" stroke="${COLORES_GRAFICO.total}" stroke-width="2" />
      <rect x="${m.x(i) - m.banda / 2}" y="0" width="${m.banda}" height="${alto}" fill="transparent">
        <title>${d.etiqueta}\nTotal: ${formatMoney(d.total)}\nAhorros: ${formatMoney(d.ahorros)}\nCorriente: ${formatMoney(d.corriente)}</title>
      </rect></g>`;
  });
  return envolverSvg(ancho, alto, "Dinero total en cuentas de ahorro y corrientes por periodo", svg);
}

// Barras agrupadas: entradas y salidas de dinero.
function graficoMovimientos(datos, ancho, alto) {
  const maximo = Math.max(...datos.map((d) => Math.max(d.entradas, d.salidas)));
  const m = marcoGrafico({ ancho, alto, etiquetas: datos.map((d) => d.etiqueta), maximo, formatoY: "dinero" });
  const anchoBarra = Math.max(3, Math.min(18, m.banda * 0.32));
  let svg = m.svg;
  datos.forEach((d, i) => {
    const barra = (valor, desplazamiento, color) =>
      `<rect x="${m.x(i) + desplazamiento}" y="${m.y(valor)}" width="${anchoBarra}" height="${Math.max(0, m.base - m.y(valor))}" rx="3" fill="${color}" />`;
    svg += `<g>${barra(d.entradas, -anchoBarra - 1, COLORES_GRAFICO.entradas)}${barra(d.salidas, 1, COLORES_GRAFICO.salidas)}
      <rect x="${m.x(i) - m.banda / 2}" y="0" width="${m.banda}" height="${alto}" fill="transparent">
        <title>${d.etiqueta}\nEntradas: ${formatMoney(d.entradas)}\nSalidas: ${formatMoney(d.salidas)}\n${d.cantidad} movimiento(s)</title>
      </rect></g>`;
  });
  return envolverSvg(ancho, alto, "Entradas y salidas de dinero por periodo", svg);
}

// Barras de clientes nuevos con la línea del total acumulado.
function graficoClientes(datos, ancho, alto) {
  const maximo = Math.max(...datos.map((d) => d.total));
  const m = marcoGrafico({ ancho, alto, etiquetas: datos.map((d) => d.etiqueta), maximo, formatoY: "numero" });
  const anchoBarra = Math.max(4, Math.min(26, m.banda * 0.5));
  let svg = m.svg;
  datos.forEach((d, i) => {
    svg += `<rect x="${m.x(i) - anchoBarra / 2}" y="${m.y(d.nuevos)}" width="${anchoBarra}" height="${Math.max(0, m.base - m.y(d.nuevos))}" rx="3" fill="${COLORES_GRAFICO.nuevos}" opacity=".85" />`;
  });
  const linea = datos.map((d, i) => `${i === 0 ? "M" : "L"}${m.x(i).toFixed(1)},${m.y(d.total).toFixed(1)}`).join(" ");
  svg += `<path d="${linea}" fill="none" stroke="${COLORES_GRAFICO.total}" stroke-width="2" stroke-linejoin="round" />`;
  datos.forEach((d, i) => {
    svg += `<g><circle cx="${m.x(i)}" cy="${m.y(d.total)}" r="3" fill="${COLORES_GRAFICO.total}" />
      <rect x="${m.x(i) - m.banda / 2}" y="0" width="${m.banda}" height="${alto}" fill="transparent">
        <title>${d.etiqueta}\nClientes nuevos: ${d.nuevos}\nTotal de clientes: ${d.total}</title>
      </rect></g>`;
  });
  return envolverSvg(ancho, alto, "Clientes nuevos y total de clientes por periodo", svg);
}

// Ancho real disponible para un gráfico (se mide en pantalla para que el texto no se vea diminuto en celular).
function anchoDe(id, respaldo) {
  const el = document.getElementById(id);
  const ancho = el ? el.clientWidth : 0;
  return ancho > 120 ? Math.floor(ancho) : respaldo;
}

function pintarGraficosAdmin() {
  const zona = document.getElementById("admin-graficos");
  if (!zona) return;
  const est = new EstadisticasBanco(sistema.clientes);
  const escala = periodoGraficos;
  const nombre = EstadisticasBanco.PERIODOS[escala].nombre;
  const dinero = est.dinero(escala);
  const movimientos = est.movimientos(escala);
  const clientes = est.clientes(escala);
  const actual = dinero[dinero.length - 1];
  const totalEntradas = movimientos.reduce((s, d) => s + d.entradas, 0);
  const totalSalidas = movimientos.reduce((s, d) => s + d.salidas, 0);
  const cantidadMovimientos = movimientos.reduce((s, d) => s + d.cantidad, 0);
  const nuevos = clientes.reduce((s, d) => s + d.nuevos, 0);

  // Primero el esqueleto (para medir el ancho de cada caja) y luego los SVG.
  if (!document.getElementById("graf-dinero")) {
    zona.innerHTML = `
      <section class="panel grafico-panel grafico-ancho">
        <div class="panel-title">
          <div><h2>Dinero en el banco</h2><p id="graf-dinero-nota"></p></div>
          <div class="grafico-total"><small>Total actual</small><b id="graf-dinero-total"></b></div>
        </div>
        <div class="grafico-caja" id="graf-dinero"></div>
        <div id="graf-dinero-leyenda"></div>
      </section>
      <div class="graficos-fila">
        <section class="panel grafico-panel">
          <div class="panel-title"><div><h2>Movimientos del banco</h2><p id="graf-mov-nota"></p></div></div>
          <div class="grafico-caja" id="graf-movimientos"></div>
          <div id="graf-mov-leyenda"></div>
        </section>
        <section class="panel grafico-panel">
          <div class="panel-title"><div><h2>Clientes registrados</h2><p id="graf-cli-nota"></p></div></div>
          <div class="grafico-caja" id="graf-clientes"></div>
          <div id="graf-cli-leyenda"></div>
        </section>
      </div>`;
  }

  ponerTextoAdmin("graf-dinero-total", formatMoney(actual.total));
  ponerTextoAdmin("graf-dinero-nota", `Ahorros ${formatMoney(actual.ahorros)} · Corriente ${formatMoney(actual.corriente)} · al cierre de cada ${nombre}`);
  ponerTextoAdmin("graf-mov-nota", `${cantidadMovimientos} movimiento(s): entraron ${formatMoney(totalEntradas)} y salieron ${formatMoney(totalSalidas)}`);
  ponerTextoAdmin("graf-cli-nota", `${nuevos} cliente(s) nuevo(s) en el periodo · ${sistema.clientes.length} en total`);

  document.getElementById("graf-dinero").innerHTML = graficoDinero(dinero, anchoDe("graf-dinero", 900), 250);
  document.getElementById("graf-movimientos").innerHTML = graficoMovimientos(movimientos, anchoDe("graf-movimientos", 440), 220);
  document.getElementById("graf-clientes").innerHTML = graficoClientes(clientes, anchoDe("graf-clientes", 440), 220);
  document.getElementById("graf-dinero-leyenda").innerHTML = leyendaHtml([
    { nombre: "Total", color: COLORES_GRAFICO.total },
    { nombre: "Ahorros", color: COLORES_GRAFICO.ahorros },
    { nombre: "Corriente", color: COLORES_GRAFICO.corriente },
  ]);
  document.getElementById("graf-mov-leyenda").innerHTML = leyendaHtml([
    { nombre: "Entradas", color: COLORES_GRAFICO.entradas },
    { nombre: "Salidas", color: COLORES_GRAFICO.salidas },
  ]);
  document.getElementById("graf-cli-leyenda").innerHTML = leyendaHtml([
    { nombre: "Clientes nuevos", color: COLORES_GRAFICO.nuevos },
    { nombre: "Total acumulado", color: COLORES_GRAFICO.total },
  ]);
}

alIniciar(() => {
  // Botones Día / Mes / Año.
  document.querySelectorAll("#screen-admin [data-periodo]").forEach((btn) => {
    btn.addEventListener("click", () => {
      periodoGraficos = btn.dataset.periodo;
      document.querySelectorAll("#screen-admin [data-periodo]").forEach((b) => b.classList.toggle("active", b === btn));
      pintarGraficosAdmin();
    });
  });

  // Al cambiar el tamaño de la ventana se vuelven a medir los gráficos.
  let espera = null;
  window.addEventListener("resize", () => {
    clearTimeout(espera);
    espera = setTimeout(() => {
      const visible = document.querySelector('#screen-admin.active .admin-vista[data-vista="resumen"]:not([hidden])');
      if (visible && adminActual) pintarGraficosAdmin();
    }, 150);
  });
});
