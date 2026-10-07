# Diagrama UML de clases — MOVA

Modelo de clases real del proyecto (carpeta `js/models` y `js/services`).
Imagen: [`uml/mova-uml.png`](uml/mova-uml.png) · Diagrama original de la fase de diseño: [`uml/mova-uml-original.pdf`](uml/mova-uml-original.pdf)

```mermaid
classDiagram
direction TB

class Movimiento {
  -tipo
  -monto
  -saldoResultante
  -detalle
  -fecha
  +esIngreso() boolean
  +toJSON()
  +fromJSON(datos)$ Movimiento
}

class Cuenta {
  <<abstract>>
  -numero
  -saldo
  -movimientos
  +codigo()
  +tipo()
  +permiteTransferencias() boolean
  +consultarSaldo() number
  +historial() Movimiento[]
  +consignar(valor) Movimiento
  +retirar(valor) Movimiento
  +transferir(destino, valor) Movimiento
  +limiteRetiro() number
  +descripcionLimite() string
  +formatear(valor)$ string
}

class CuentaAhorros {
  +TASA_RETIRO = 0.015$
  +retirar(valor) Movimiento
}

class CuentaCorriente {
  +SOBREGIRO = 0.2$
  +limiteRetiro() number
  +descripcionLimite() string
}

class TarjetaCredito {
  -cupoTotal
  +CUPO_INICIAL = 2000000$
  +cupoDisponible() number
  +deuda() number
  +comprar(valor, cuotas, descripcion)
  +pagar(valor) Movimiento
  +consignar(valor) Movimiento
  +retirar(valor) bloqueado
  +transferir(destino, valor) bloqueado
  +tasaPorCuotas(cuotas)$ number
  +calcularCuota(valor, cuotas)$ number
}

class Cliente {
  -identificacion
  -nombre
  -telefono
  -userName
  -correo
  -clave
  -productos
  -intentosFallidos
  -bloqueadoHasta
  -bloqueadoPorAdmin
  +MAX_INTENTOS = 3$
  +saldoTotal() number
  +agregarProducto(producto)
  +buscarProducto(numero) Cuenta
  +buscarProductoPorCodigo(codigo) Cuenta
  +verificarClave(clave) boolean
  +cambiarClave(actual, nueva, confirmacion)
  +actualizarPerfil(cambios)
  +estaBloqueado() boolean
  +registrarIntentoFallido() number
  +reiniciarIntentos()
  +bloquearPorAdmin()
  +desbloquear()
  +validar(datos)$
}

class Administrador {
  +nombre
  +userName
  -clave
  +verificarClave(clave) boolean
  +registrarCliente(datos, producto)
  +editarCliente(userName, cambios)
  +eliminarCliente(userName, confirmado)
  +buscarClientes(texto)
  +listarClientes()
  +bloquearCliente(userName)
  +desbloquearCliente(userName)
}

class Sistema {
  -almacen
  -clientes
  -administrador
  +guardar()
  +cargar()
  +autenticar(userName, clave) Cliente
  +autenticarAdministrador(userName, clave)
  +intentosRestantes(userName) number
  +registrarCliente(datos, producto) Cliente
  +buscarCliente(userName) Cliente
  +buscarProductoPorNumero(numero)
  +abrirProducto(cliente, codigo)
  +consignar(cliente, numero, valor)
  +retirar(cliente, numero, valor)
  +comprarConTarjeta(cliente, numero, valor, cuotas, descripcion)
  +pagarTarjeta(cliente, numero, valor)
  +transferir(origen, numeroOrigen, numeroDestino, valor)
  +cambiarClave(cliente, actual, nueva, confirmacion)
  +actualizarPerfil(cliente, cambios)
}

Cuenta <|-- CuentaAhorros
Cuenta <|-- CuentaCorriente
Cuenta <|-- TarjetaCredito
Cuenta "1" *-- "0..*" Movimiento : registra
Cliente "1" *-- "0..3" Cuenta : tiene
Sistema "1" o-- "0..*" Cliente : guarda
Sistema "1" *-- "1" Administrador
Administrador ..> Sistema : usa
```

## Pilares de POO que muestra el diagrama

- **Abstracción:** `Cuenta` es una clase abstracta (no se puede instanciar directamente).
- **Encapsulamiento:** saldo, movimientos, clave e intentos son atributos privados (`-`); solo se cambian con métodos.
- **Herencia:** `CuentaAhorros`, `CuentaCorriente` y `TarjetaCredito` extienden `Cuenta`.
- **Polimorfismo:** `retirar()` y `transferir()` se comportan distinto según el producto (interés en ahorros, sobregiro en corriente, bloqueo en tarjeta).
