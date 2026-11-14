/* MOVA — HU-16: consulta de la bitácora administrativa (solo admin principal). */
function pintarBitacoraAdmin() {
  const filas = document.getElementById("admin-bitacora-rows");
  if (!filas) return;
  if (!adminActual || adminActual instanceof Subadministrador) {
    filas.replaceChildren();
    const persona = document.getElementById("bitacora-filtro-persona");
    const accion = document.getElementById("bitacora-filtro-accion");
    if (persona) persona.innerHTML = '<option value="">Todas las personas</option>';
    if (accion) accion.innerHTML = '<option value="">Todas las acciones</option>';
    return;
  }

  const registros = sistema.bitacora;
  const persona = document.getElementById("bitacora-filtro-persona");
  const accion = document.getElementById("bitacora-filtro-accion");
  const actualizarOpciones = (select, valores, etiqueta) => {
    const anterior = select.value;
    select.innerHTML = `<option value="">${etiqueta}</option>${valores.map((v) => `<option value="${escaparHtml(v)}">${escaparHtml(v)}</option>`).join("")}`;
    if (valores.includes(anterior)) select.value = anterior;
  };
  actualizarOpciones(persona, [...new Set(registros.map((r) => `${r.actor} · ${r.rol}`))].sort(), "Todas las personas");
  actualizarOpciones(accion, [...new Set(registros.map((r) => r.accion))].sort(), "Todas las acciones");

  const elegidos = registros.filter((r) =>
    (!persona.value || `${r.actor} · ${r.rol}` === persona.value) && (!accion.value || r.accion === accion.value)
  );
  filas.innerHTML = elegidos.length
    ? elegidos.map((r) => `<div class="client-row bitacora-row"><span>${escaparHtml(new Date(r.fecha).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" }))}</span><span>${escaparHtml(r.actor)}<small>${escaparHtml(r.rol)}</small></span><span>${escaparHtml(r.accion)}</span><span>${escaparHtml(r.detalle)}</span></div>`).join("")
    : `<p class="empty">${registros.length ? "No hay acciones que coincidan con esos filtros." : "Aún no hay acciones registradas."}</p>`;
}

alIniciar(() => {
  ["bitacora-filtro-persona", "bitacora-filtro-accion"].forEach((id) => {
    const select = document.getElementById(id);
    if (select) select.addEventListener("change", pintarBitacoraAdmin);
  });
});
