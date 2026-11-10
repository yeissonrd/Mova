/* ============================================================
   Sistema — el coordinador. Es lo único que la interfaz (app.js) debe usar.

   Hace tres cosas:
   1. Guarda y recupera TODO en localStorage (reconstruyendo objetos reales).
   2. Autentica: login con 3 intentos y bloqueo (reglas rescatadas de menu.js).
   3. Coordina operaciones que involucran varios objetos (transferencias)
      y guarda después de cada cambio.

   Todos los errores de negocio se lanzan con throw new Error("mensaje claro"),
   así que la pantalla solo necesita un try/catch y mostrar error.message.
   ============================================================ */
class Sistema {
  static CLAVE_ALMACEN = "mova.datos";

  // Administrador que se crea la primera vez (cámbialo si el equipo lo decide).
  static ADMIN_INICIAL = { nombre: "Administrador MOVA", userName: "admin", clave: "Admin1234" };

  // Límites del cupo que el administrador puede asignar al aprobar una tarjeta.
  static CUPO_MINIMO = 500000;
  static CUPO_MAXIMO = 20000000;

  #almacen;
  #clientes = [];
  #solicitudes = [];
  #administrador = null;
  #restablecimientos = [];

  constructor(almacen = Sistema.almacenPorDefecto()) {
    this.#almacen = almacen;
    this.cargar();
  }

  // localStorage si existe; si el navegador lo bloquea, un respaldo en memoria.
  static almacenPorDefecto() {
    try {
      if (typeof localStorage !== "undefined") {
        return localStorage;
      }
    } catch (error) {
      // localStorage bloqueado: se usa el respaldo en memoria.
    }
    const datos = {};
    return {
      getItem: (clave) => (clave in datos ? datos[clave] : null),
      setItem: (clave, valor) => {
        datos[clave] = String(valor);
      },
    };
  }

  // ---------- Persistencia ----------
  guardar() {
    const estado = {
      version: 1,
      administrador: this.#administrador,
      clientes: this.#clientes,
      solicitudes: this.#solicitudes,
      restablecimientos: this.#restablecimientos,
    };
    this.#almacen.setItem(Sistema.CLAVE_ALMACEN, JSON.stringify(estado)); // usa el toJSON() de cada clase
  }

  // Lee localStorage y reconstruye objetos reales (JSON.parse solo devuelve objetos simples, sin métodos).
  cargar() {
    this.#clientes = [];
    this.#solicitudes = [];
    this.#administrador = null;
    const texto = this.#almacen.getItem(Sistema.CLAVE_ALMACEN);
    if (texto) {
      try {
        const estado = JSON.parse(texto);
        this.#clientes = (estado.clientes || []).map((datos) => Cliente.fromJSON(datos));
        this.#solicitudes = (estado.solicitudes || []).map((datos) => Solicitud.fromJSON(datos));
        this.#restablecimientos = (estado.restablecimientos || []).map((datos) => Restablecimiento.fromJSON(datos));
        if (estado.administrador) {
          this.#administrador = new Administrador(estado.administrador, this);
        }
      } catch (error) {
        console.error("No se pudieron leer los datos guardados:", error);
        this.#clientes = [];
        this.#solicitudes = [];
      }
    }
    if (!this.#administrador) {
      this.#administrador = new Administrador(Sistema.ADMIN_INICIAL, this);
      this.guardar();
    }
  }

  // ---------- Consultas ----------
  get clientes() {
    return [...this.#clientes];
  }

  // Todas las solicitudes (pendientes, aprobadas y denegadas), la más reciente primero.
  get solicitudes() {
    return [...this.#solicitudes].sort((a, b) => b.fecha - a.fecha);
  }

  get solicitudesPendientes() {
    return this.solicitudes.filter((solicitud) => solicitud.pendiente);
  }

  buscarSolicitud(id) {
    return this.#solicitudes.find((solicitud) => solicitud.id === id) || null;
  }

  // Búsqueda libre de solicitudes pendientes (nombre, usuario, identificación o correo).
  buscarSolicitudesPendientes(texto) {
    const buscado = Sistema.normalizar(texto);
    const pendientes = this.solicitudesPendientes;
    if (!buscado) return pendientes;
    return pendientes.filter((solicitud) =>
      [solicitud.nombre, solicitud.userName, solicitud.identificacion, solicitud.correo].some((campo) =>
        Sistema.normalizar(campo).includes(buscado)
      )
    );
  }
  // HU-15: solicitudes de restablecimiento de clave (la más reciente primero).
  get restablecimientos() {
    return [...this.#restablecimientos].sort((a, b) => b.fecha - a.fecha);
  }

  get restablecimientosPendientes() {
    return this.restablecimientos.filter((restablecimiento) => restablecimiento.pendiente);
  }

  get administrador() {
    return this.#administrador;
  }

  static normalizar(texto) {
    return String(texto).trim().toLowerCase();
  }

  buscarCliente(userName) {
    const buscado = Sistema.normalizar(userName);
    return this.#clientes.find((cliente) => Sistema.normalizar(cliente.userName) === buscado) || null;
  }

  // Búsqueda libre para el panel del administrador (nombre, usuario, identificación o correo).
  buscarClientes(texto) {
    const buscado = Sistema.normalizar(texto);
    if (!buscado) return this.clientes;
    return this.#clientes.filter((cliente) =>
      [cliente.nombre, cliente.userName, cliente.identificacion, cliente.correo].some((campo) =>
        Sistema.normalizar(campo).includes(buscado)
      )
    );
  }

  // Busca un producto (de cualquier cliente) por su número. Se usa para transferir.
  buscarProductoPorNumero(numero) {
    for (const cliente of this.#clientes) {
      const producto = cliente.buscarProducto(String(numero).trim());
      if (producto) return { cliente, producto };
    }
    return null;
  }

  // ---------- Registro y gestión de clientes (HU-01 y HU-02) ----------
  registrarCliente(datos, productoInicial = "ahorros") {
    Cliente.validar(datos);
    this.#validarDuplicados(datos);
    const cliente = new Cliente(datos);
    cliente.agregarProducto(this.#crearProducto(productoInicial));
    this.#clientes.push(cliente);
    this.guardar();
    return cliente;
  }

  // ---------- Solicitudes de clientes nuevos ----------
  // El registro desde la página crea una solicitud pendiente, no un cliente.
  registrarSolicitud(datos, productoElegido = "ahorros") {
    Cliente.validar(datos);
    this.#validarDuplicados(datos);
    const numero = String(this.#solicitudes.length + 1).padStart(4, "0");
    const solicitud = new Solicitud({ ...datos, id: `SOL-${numero}`, productoElegido });
    this.#solicitudes.push(solicitud);
    this.guardar();
    return solicitud;
  }

  // El administrador aprueba: se crea el cliente con los productos elegidos.
  aprobarSolicitud(id, productos, cupoTarjeta = TarjetaCredito.CUPO_INICIAL) {
    const solicitud = this.#exigirSolicitudPendiente(id);
    const elegidos = Solicitud.PRODUCTOS.filter((codigo) => productos.includes(codigo));
    if (elegidos.length === 0) {
      throw new Error("Elige al menos un producto para aprobar la solicitud.");
    }
    const cupo = Number(cupoTarjeta);
    if (elegidos.includes("tarjeta") && (!Number.isInteger(cupo) || cupo < Sistema.CUPO_MINIMO || cupo > Sistema.CUPO_MAXIMO)) {
      throw new Error(
        `El cupo de la tarjeta debe estar entre ${Cuenta.formatear(Sistema.CUPO_MINIMO)} y ${Cuenta.formatear(Sistema.CUPO_MAXIMO)}.`
      );
    }
    const datos = solicitud.datosCliente();
    // Se revisa otra vez por si alguien tomó el usuario o la identificación mientras tanto.
    this.#validarDuplicados(datos, null, solicitud);
    const cliente = new Cliente(datos);
    elegidos.forEach((codigo) => cliente.agregarProducto(this.#crearProducto(codigo, cupo)));
    solicitud.aprobar(elegidos, cupo);
    this.#clientes.push(cliente);
    this.guardar();
    return cliente;
  }

  denegarSolicitud(id, motivo = "") {
    const solicitud = this.#exigirSolicitudPendiente(id);
    solicitud.denegar(motivo);
    this.guardar();
    return solicitud;
  }
    // ---------- Recuperar contraseña (HU-15) ----------
  // El cliente olvidó su clave: usuario, identificación y correo deben coincidir con un cliente.
  solicitarRestablecimiento(userName, identificacion, correo) {
    const cliente = this.buscarCliente(userName);
    const coincide =
      cliente &&
      Sistema.normalizar(cliente.identificacion) === Sistema.normalizar(identificacion) &&
      Sistema.normalizar(cliente.correo) === Sistema.normalizar(correo);
    if (!coincide) {
      throw new Error("Los datos no coinciden con ningún cliente.");
    }
    const yaPendiente = this.#restablecimientos.some(
      (r) => r.pendiente && Sistema.normalizar(r.userName) === Sistema.normalizar(cliente.userName)
    );
    if (yaPendiente) {
      throw new Error("Ya tienes una solicitud de restablecimiento en revisión.");
    }
    const numero = String(this.#restablecimientos.length + 1).padStart(4, "0");
    const restablecimiento = new Restablecimiento({
      id: `REC-${numero}`,
      userName: cliente.userName,
      nombre: cliente.nombre,
      identificacion: cliente.identificacion,
      correo: cliente.correo,
    });
    this.#restablecimientos.push(restablecimiento);
    this.guardar();
    return restablecimiento;
  }

  // El administrador aprueba: se genera una clave temporal y el cliente deberá cambiarla al entrar.
  aprobarRestablecimiento(id) {
    const restablecimiento = this.#exigirRestablecimientoPendiente(id);
    const cliente = this.#exigirCliente(restablecimiento.userName);
    const claveTemporal = this.#generarClaveTemporal();
    cliente.restablecerClave(claveTemporal);
    cliente.reiniciarIntentos();
    restablecimiento.aprobar();
    this.guardar();
    return { cliente, claveTemporal };
  }

  denegarRestablecimiento(id) {
    const restablecimiento = this.#exigirRestablecimientoPendiente(id);
    restablecimiento.denegar();
    this.guardar();
    return restablecimiento;
  }

  actualizarCliente(userName, cambios) {
    const cliente = this.#exigirCliente(userName);
    this.#validarDuplicados(cambios, cliente);
    cliente.actualizarPerfil(cambios);
    this.guardar();
    return cliente;
  }

  eliminarCliente(userName) {
    const cliente = this.#exigirCliente(userName);
    this.#clientes = this.#clientes.filter((c) => c !== cliente);
    this.guardar();
  }

  bloquearCliente(userName) {
    const cliente = this.#exigirCliente(userName);
    cliente.bloquearPorAdmin();
    this.guardar();
    return cliente;
  }

  desbloquearCliente(userName) {
    const cliente = this.#exigirCliente(userName);
    cliente.desbloquear();
    this.guardar();
    return cliente;
  }

  // Abre un producto nuevo a un cliente que ya existe.
  abrirProducto(cliente, codigo) {
    cliente.agregarProducto(this.#crearProducto(codigo));
    this.guardar();
  }

  // HU-11: el administrador ajusta el cupo de una tarjeta que ya existe.
  ajustarCupo(cliente, numero, nuevoCupo) {
    const tarjeta = this.#exigirProducto(cliente, numero);
    if (!(tarjeta instanceof TarjetaCredito)) {
      throw new Error("El producto elegido no es una tarjeta de crédito.");
    }
    const cupo = Number(nuevoCupo);
    if (!Number.isInteger(cupo) || cupo < Sistema.CUPO_MINIMO || cupo > Sistema.CUPO_MAXIMO) {
      throw new Error(
        `El cupo de la tarjeta debe estar entre ${Cuenta.formatear(Sistema.CUPO_MINIMO)} y ${Cuenta.formatear(Sistema.CUPO_MAXIMO)}.`
      );
    }
    const movimiento = tarjeta.ajustarCupo(cupo);
    this.guardar();
    return movimiento;
  }

  // HU-08: cambio de clave (guarda al terminar).
  cambiarClave(cliente, claveActual, claveNueva, confirmacion) {
    cliente.cambiarClave(claveActual, claveNueva, confirmacion);
    this.guardar();
  }

  // HU-08: edición de perfil por parte del propio cliente.
  actualizarPerfil(cliente, cambios) {
    return this.actualizarCliente(cliente.userName, cambios);
  }

  // ---------- Autenticación (HU-02) — reglas de menu.js: iniciar() ----------
  // Devuelve el Cliente si la clave es correcta; si no, lanza un Error con el mensaje para la pantalla.
  autenticar(userName, clave) {
    const cliente = this.buscarCliente(userName);
    if (!cliente) {
      this.#avisarEstadoSolicitud(userName, clave);
      throw new Error("El usuario o la clave no son correctos.");
    }
    if (cliente.bloqueadoPorAdmin) {
      throw new Error("Cuenta bloqueada. Comunícate con tu banco.");
    }
    if (cliente.estaBloqueado()) {
      throw new Error("Cuenta bloqueada por 24 horas. Comunícate con tu banco.");
    }
    cliente.liberarBloqueoVencido();

    if (cliente.verificarClave(clave)) {
      cliente.reiniciarIntentos();
      this.guardar();
      return cliente;
    }

    const restantes = cliente.registrarIntentoFallido();
    this.guardar();
    if (restantes === 0) {
      throw new Error("Cuenta bloqueada por 24 horas. Comunícate con tu banco.");
    }
    throw new Error(`Clave incorrecta. Te quedan ${restantes} de ${Cliente.MAX_INTENTOS} intentos.`);
  }

  // HU-02 criterio 3: contador visible. Intentos que le quedan a ese usuario.
  intentosRestantes(userName) {
    const cliente = this.buscarCliente(userName);
    if (!cliente) return Cliente.MAX_INTENTOS;
    return Math.max(0, Cliente.MAX_INTENTOS - cliente.intentosFallidos);
  }

  autenticarAdministrador(userName, clave) {
    const admin = this.#administrador;
    if (Sistema.normalizar(userName) !== Sistema.normalizar(admin.userName) || !admin.verificarClave(clave)) {
      throw new Error("El usuario o la clave no son correctos.");
    }
    return admin;
  }

  // ---------- Operaciones sobre productos (cada una guarda al terminar) ----------
  consignar(cliente, numero, valor) {
    const movimiento = this.#exigirProducto(cliente, numero).consignar(valor);
    this.guardar();
    return movimiento;
  }

  retirar(cliente, numero, valor) {
    const movimiento = this.#exigirProducto(cliente, numero).retirar(valor);
    this.guardar();
    return movimiento;
  }

  // HU-06: compra a cuotas con la tarjeta. Devuelve { cuotaMensual, tasaMensual, totalAPagar, ... }.
  comprarConTarjeta(cliente, numero, valor, cuotas, descripcion) {
    const tarjeta = this.#exigirProducto(cliente, numero);
    if (!(tarjeta instanceof TarjetaCredito)) {
      throw new Error("El producto elegido no es una tarjeta de crédito.");
    }
    const resultado = tarjeta.comprar(valor, cuotas, descripcion);
    this.guardar();
    return resultado;
  }

  pagarTarjeta(cliente, numero, valor) {
    const tarjeta = this.#exigirProducto(cliente, numero);
    if (!(tarjeta instanceof TarjetaCredito)) {
      throw new Error("El producto elegido no es una tarjeta de crédito.");
    }
    const movimiento = tarjeta.pagar(valor);
    this.guardar();
    return movimiento;
  }

  // ---------- Transferencias (HU-07) ----------
  transferir(clienteOrigen, numeroOrigen, numeroDestino, valor) {
    const origen = this.#exigirProducto(clienteOrigen, numeroOrigen);
    const encontrado = this.buscarProductoPorNumero(numeroDestino);
    if (!encontrado) {
      throw new Error("La cuenta de destino no existe.");
    }
    const { cliente: clienteDestino, producto: destino } = encontrado;

    // Regla HU-07 criterio 1: no entre productos del mismo tipo del mismo cliente.
    if (clienteDestino === clienteOrigen && origen.codigo === destino.codigo) {
      throw new Error("No puedes transferir entre productos del mismo tipo. Elige un producto diferente.");
    }
    // Criterio 2: hacia otros clientes sí se puede (no hay restricción de tipo).
    // Criterio 3: la tarjeta queda excluida; lo revisa Cuenta.transferir() y TarjetaCredito.transferir().
    const movimiento = origen.transferir(destino, valor);
    this.guardar();
    return { movimiento, destinatario: clienteDestino.nombre };
  }

  // ---------- Internos ----------
  // La tarjeta puede abrirse con un cupo distinto al inicial (lo decide el administrador).
  #crearProducto(codigo, cupoTarjeta = TarjetaCredito.CUPO_INICIAL) {
    const Clase = Cliente.CLASES_PRODUCTO[codigo];
    if (!Clase) {
      throw new Error("El tipo de producto no es válido.");
    }
    if (Clase === TarjetaCredito) {
      return new TarjetaCredito(this.#generarNumero(), cupoTarjeta);
    }
    return new Clase(this.#generarNumero());
  }
    #exigirRestablecimientoPendiente(id) {
    const restablecimiento = this.#restablecimientos.find((r) => r.id === id);
    if (!restablecimiento) {
      throw new Error("La solicitud de restablecimiento no existe.");
    }
    if (!restablecimiento.pendiente) {
      throw new Error(`La solicitud ${id} ya fue ${restablecimiento.estado.toLowerCase()}.`);
    }
    return restablecimiento;
  }

  // Clave temporal de 10 caracteres (cumple el mínimo de 8). El cliente deberá cambiarla al entrar.
  #generarClaveTemporal() {
    return "Mova" + String(Math.floor(Math.random() * 9e5) + 1e5);
  }

  #exigirSolicitudPendiente(id) {
    const solicitud = this.buscarSolicitud(id);
    if (!solicitud) {
      throw new Error("La solicitud no existe.");
    }
    if (!solicitud.pendiente) {
      throw new Error(`La solicitud ${id} ya fue ${solicitud.estado.toLowerCase()}.`);
    }
    return solicitud;
  }

  // Si el usuario aún no es cliente pero tiene una solicitud (y la clave coincide), se le dice en qué va.
  #avisarEstadoSolicitud(userName, clave) {
    const buscado = Sistema.normalizar(userName);
    const solicitud = this.solicitudes.find(
      (s) => Sistema.normalizar(s.userName) === buscado && s.verificarClave(clave)
    );
    if (!solicitud) return;
    if (solicitud.pendiente) {
      throw new Error("Tu solicitud de apertura está en revisión. Podrás ingresar cuando el banco la apruebe.");
    }
    if (solicitud.estado === Solicitud.ESTADOS.DENEGADA) {
      throw new Error("Tu solicitud de apertura fue denegada. Comunícate con el banco para más información.");
    }
  }

  // Número de 10 dígitos que no se repite con ningún otro producto.
  #generarNumero() {
    let numero;
    do {
      numero = String(Math.floor(Math.random() * 9e9) + 1e9);
    } while (this.buscarProductoPorNumero(numero));
    return numero;
  }

  #exigirCliente(userName) {
    const cliente = this.buscarCliente(userName);
    if (!cliente) {
      throw new Error("El cliente no existe.");
    }
    return cliente;
  }

  #exigirProducto(cliente, numero) {
    const producto = cliente.buscarProducto(numero);
    if (!producto) {
      throw new Error("El producto no pertenece a este cliente.");
    }
    return producto;
  }

  // HU-01 criterio 4: userName e identificación únicos ("excepto" evita chocar consigo mismo al editar).
  // También se revisan las solicitudes pendientes ("solicitudPropia" es la que se está aprobando).
  #validarDuplicados(datos, excepto = null, solicitudPropia = null) {
    const pendientes = this.#solicitudes.filter((s) => s.pendiente && s !== solicitudPropia);
    if (datos.userName !== undefined) {
      const usuario = Sistema.normalizar(datos.userName);
      const otro = this.buscarCliente(datos.userName);
      if ((otro && otro !== excepto) || pendientes.some((s) => Sistema.normalizar(s.userName) === usuario)) {
        throw new Error("El nombre de usuario ya está en uso.");
      }
    }
    if (datos.identificacion !== undefined) {
      const id = Sistema.normalizar(datos.identificacion);
      const repetido = this.#clientes.find((c) => c !== excepto && Sistema.normalizar(c.identificacion) === id);
      if (repetido) {
        throw new Error("Ya existe un cliente con esa identificación.");
      }
      if (pendientes.some((s) => Sistema.normalizar(s.identificacion) === id)) {
        throw new Error("Ya hay una solicitud en revisión con esa identificación.");
      }
    }
  }
}
