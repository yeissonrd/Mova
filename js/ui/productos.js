/* MOVA — js/ui/productos.js  (CORRECCIONES: descripción de productos en el registro)
   Cuando el visitante pulsa "Conocer más" en la portada, llega al registro con ese producto
   elegido y ve en el panel izquierdo los beneficios del producto. Si cambia el producto en
   el formulario, la descripción cambia con él. En celular el panel izquierdo se oculta, así que
   los beneficios también se muestran debajo del selector de producto. */

/* ===================== CLASE: CatalogoProductos ===================== */
class CatalogoProductos {
  // La clave coincide con el value de <select id="reg-producto">.
  static PRODUCTOS = {
    ahorros: {
      nombre: "Cuenta de ahorros",
      resumen: "Haz crecer tu dinero y úsalo cuando lo necesites.",
      beneficios: () => [
        "Consigna y retira cuando quieras, desde tu panel.",
        "Puedes retirar hasta tu saldo disponible.",
        "Cada retiro cobra un 1,5 % de interés, que ves claro como un movimiento aparte.",
        "Transfiere a otros productos MOVA en segundos.",
        "Consulta tu historial completo y descarga tu extracto del mes.",
      ],
    },
    corriente: {
      nombre: "Cuenta corriente",
      resumen: "Flexibilidad para moverte, incluso cuando necesitas un poco más.",
      beneficios: () => [
        "Sobregiro de hasta 20 % sobre tu saldo para retirar con tranquilidad.",
        "Sin intereses por retiro.",
        "Transfiere a otros clientes y a tus otros productos MOVA.",
        "Consulta tu historial completo y descarga tu extracto del mes.",
      ],
    },
    credito: {
      nombre: "Tarjeta de crédito",
      resumen: "Compra a tu ritmo con tasas claras según tus cuotas.",
      beneficios: () => [
        `Cupo inicial de ${formatMoney(TarjetaCredito.CUPO_INICIAL)}.`,
        "Compra de 1 a 36 cuotas y ve al instante cuánto pagarás cada mes.",
        "Sin intereses en compras a 1 o 2 cuotas.",
        "Cada pago que haces libera cupo para volver a comprar.",
        "Todo tu plan de pagos visible en Mi tarjeta.",
      ],
    },
  };

  static porCodigo(codigo) {
    return CatalogoProductos.PRODUCTOS[codigo] || CatalogoProductos.PRODUCTOS.ahorros;
  }

  static html(codigo) {
    const p = CatalogoProductos.porCodigo(codigo);
    return `
      <span class="auth-producto-etiqueta">${p.nombre}</span>
      <p>${p.resumen}</p>
      <ul>${p.beneficios().map((b) => `<li>${b}</li>`).join("")}</ul>`;
  }
}

/* ===================== PANTALLA DE REGISTRO ===================== */
function pintarInfoProducto() {
  const select = document.getElementById("reg-producto");
  if (!select) return;
  const html = CatalogoProductos.html(select.value);
  // El panel izquierdo (computador) y el bloque bajo el selector (celular) muestran lo mismo
  ["reg-producto-info", "reg-producto-info-movil"].forEach((id) => {
    const caja = document.getElementById(id);
    if (caja) caja.innerHTML = html;
  });
}

alIniciar(() => {
  const select = document.getElementById("reg-producto");
  if (!select) return;

  select.addEventListener("change", pintarInfoProducto);

  // Los botones "Conocer más" de la portada llevan el producto en data-producto
  document.querySelectorAll("[data-producto]").forEach((boton) => {
    boton.addEventListener("click", () => {
      select.value = boton.dataset.producto;
      pintarInfoProducto();
    });
  });

  // Al limpiar el formulario (después de registrarse) el select vuelve al primer producto
  const formulario = document.getElementById("register-form");
  if (formulario) formulario.addEventListener("reset", () => setTimeout(pintarInfoProducto, 0));

  pintarInfoProducto();
});
