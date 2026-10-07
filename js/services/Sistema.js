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

  #almacen;
  #clientes = [];
  #administrador = null;

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
    const estado = { version: 1, administrador: this.#administrador, clientes: this.#clientes };
    this.#almacen.setItem(Sistema.CLAVE_ALMACEN, JSON.stringify(estado)); // usa el toJSON() de cada clase
  }

  // Lee localStorage y reconstruye objetos reales (JSON.parse solo devuelve objetos simples, sin métodos).
  cargar() {
    this.#clientes = [];
    this.#administrador = null;
    const texto = this.#almacen.getItem(Sistema.CLAVE_ALMACEN);
    if (texto) {
      try {
        const estado = JSON.parse(texto);
        this.#clientes = (estado.clientes || []).map((datos) => Cliente.fromJSON(datos));
        if (estado.administrador) {
          this.#administrador = new Administrador(estado.administrador, this);
        }
      } catch (error) {
        console.error("No se pudieron leer los datos guardados:", error);
        this.#clientes = [];
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
  #crearProducto(codigo) {
    const Clase = Cliente.CLASES_PRODUCTO[codigo];
    if (!Clase) {
      throw new Error("El tipo de producto no es válido.");
    }
    return new Clase(this.#generarNumero());
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
  #validarDuplicados(datos, excepto = null) {
    if (datos.userName !== undefined) {
      const otro = this.buscarCliente(datos.userName);
      if (otro && otro !== excepto) {
        throw new Error("El nombre de usuario ya está en uso.");
      }
    }
    if (datos.identificacion !== undefined) {
      const id = Sistema.normalizar(datos.identificacion);
      const repetido = this.#clientes.find((c) => c !== excepto && Sistema.normalizar(c.identificacion) === id);
      if (repetido) {
        throw new Error("Ya existe un cliente con esa identificación.");
      }
    }
  }
}
