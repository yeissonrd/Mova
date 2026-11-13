# Historias de usuario — MOVA

Historias de usuario del proyecto integrador (CESDE · Desarrollo de Software). Etapa 1: HU-01 a HU-08. Etapa 2 (panel del administrador y mejoras): HU-09 a HU-17. El seguimiento de avance está en el Excel del equipo `MOVA_Historias_Pendientes.xlsx`.

| HU | Historia | Como |
|---|---|---|
| HU-01 | Administrador — gestión de clientes | Administrador del sistema MOVA |
| HU-02 | Cliente — registro y autenticación | usuario nuevo de MOVA |
| HU-03 | Cuenta — clase abstracta | cliente de MOVA con uno o más productos bancarios |
| HU-04 | CuentaAhorros | cliente con una Cuenta de Ahorros |
| HU-05 | CuentaCorriente | cliente con una Cuenta Corriente |
| HU-06 | TarjetaCredito | cliente con una Tarjeta de Crédito |
| HU-07 | Transferencias | cliente con más de un producto, o que desea enviar dinero a otro cliente |
| HU-08 | Perfil y seguridad | cliente autenticado en MOVA |
| HU-09 | Gestión de tickets | administrador de MOVA |
| HU-10 | Solicitudes de apertura | administrador de MOVA |
| HU-11 | Cupo de la tarjeta de crédito | administrador de MOVA |
| HU-12 | Extracto en PDF por cliente | administrador de MOVA |
| HU-13 | Configuración: cambiar contraseña del administrador | administrador de MOVA |
| HU-14 | Subadministradores con permisos | administrador de MOVA |
| HU-15 | Recuperar contraseña | cliente que olvidó su contraseña |
| HU-16 | Bitácora de acciones | administrador de MOVA |
| HU-17 | Metas de ahorro | cliente con cuenta de ahorros |

## HU-01 · Administrador — gestión de clientes

**Como:** Administrador del sistema MOVA.

**Quiero:** registrar, editar, buscar y eliminar clientes desde un panel de administración.

**Para:** mantener una base de clientes confiable y actualizada, sin acceder directamente al almacenamiento de datos.

**Criterios de aceptación:**

1. El administrador puede registrar un nuevo cliente con sus datos básicos.
2. El administrador puede editar los datos de un cliente existente.
3. El administrador puede eliminar un cliente, previa confirmación.
4. El sistema impide registrar un nombre de usuario duplicado.

## HU-02 · Cliente — registro y autenticación

**Como:** usuario nuevo de MOVA.

**Quiero:** registrarme con mis datos (identificación, nombre, teléfono, userName, correo y clave) e iniciar sesión de forma segura.

**Para:** acceder a mi panel de transacciones y gestionar mis productos bancarios.

**Criterios de aceptación:**

1. El registro valida que la clave y su confirmación coincidan.
2. El inicio de sesión permite un máximo de tres intentos fallidos antes de bloquear la cuenta.
3. El contador de intentos fallidos es visible para el usuario.
4. Tras iniciar sesión correctamente, el cliente accede al panel de transacciones.

## HU-03 · Cuenta — clase abstracta

**Como:** cliente de MOVA con uno o más productos bancarios.

**Quiero:** que todos mis productos registren mis movimientos y muestren mi historial de forma consistente, sin importar el tipo de cuenta.

**Para:** llevar un control claro y confiable de mis transacciones.

**Criterios de aceptación:**

1. Todo producto hereda el registro de movimientos con fecha, tipo y valor.
2. El historial de movimientos puede consultarse ordenado por fecha descendente.
3. El saldo consultado siempre refleja el estado más reciente del producto.

## HU-04 · CuentaAhorros

**Como:** cliente con una Cuenta de Ahorros.

**Quiero:** consignar y retirar dinero, y recibir automáticamente un rendimiento del 1.5% en el primer retiro de cada mes.

**Para:** hacer crecer mis ahorros mientras uso mi cuenta con normalidad.

**Criterios de aceptación:**

1. El retiro no puede superar el saldo disponible.
2. El rendimiento del 1.5% se calcula sobre el monto retirado en el primer retiro de cada mes y se abona a la cuenta como movimiento positivo.
3. El nuevo saldo se muestra al finalizar la operación.

## HU-05 · CuentaCorriente

**Como:** cliente con una Cuenta Corriente.

**Quiero:** poder retirar hasta un 20% adicional sobre mi saldo disponible (sobregiro).

**Para:** cubrir gastos imprevistos sin que la operación se rechace de inmediato.

**Criterios de aceptación:**

1. El sistema permite retiros hasta el saldo disponible más un 20% de sobregiro.
2. Un retiro que exceda ese límite se rechaza con un mensaje claro.
3. La Cuenta Corriente no genera intereses.

## HU-06 · TarjetaCredito

**Como:** cliente con una Tarjeta de Crédito.

**Quiero:** realizar compras a cuotas y conocer el valor de mi cuota mensual según la tasa correspondiente.

**Para:** financiar mis compras de forma informada.

**Criterios de aceptación:**

1. Las compras en 2 cuotas o menos no generan interés.
2. De 3 a 6 cuotas se aplica una tasa del 1.9% mensual; desde 7 cuotas, del 2.3% mensual.
3. El sistema muestra el valor de la cuota mensual en cada compra.
4. La Tarjeta de Crédito no permite transferencias, ni como origen ni como destino.

## HU-07 · Transferencias

**Como:** cliente con más de un producto, o que desea enviar dinero a otro cliente.

**Quiero:** transferir dinero entre mis propios productos de distinto tipo, o hacia la cuenta de otro cliente.

**Para:** mover mi dinero libremente dentro de la plataforma.

**Criterios de aceptación:**

1. No se permiten transferencias entre productos del mismo tipo del mismo cliente.
2. Se permiten transferencias hacia cuentas de otros clientes.
3. La Tarjeta de Crédito queda excluida de cualquier transferencia.

## HU-08 · Perfil y seguridad

**Como:** cliente autenticado en MOVA.

**Quiero:** editar mis datos de perfil y cambiar mi contraseña de forma segura.

**Para:** mantener mi información actualizada y proteger el acceso a mi cuenta.

**Criterios de aceptación:**

1. El cambio de clave exige ingresar la clave actual antes de permitir una nueva.
2. La nueva clave debe confirmarse antes de guardarse.
3. Los cambios de perfil se reflejan de inmediato en el sistema.

## HU-09 · Gestión de tickets

**Como:** administrador de MOVA.

**Quiero:** revisar, gestionar, resolver y eliminar los tickets que crean los clientes desde el centro de ayuda, en la vista "Gestión de tickets" del panel.

**Para:** atender las solicitudes de los clientes y dejarles una respuesta.

**Criterios de aceptación:**

1. El botón "Gestión de tickets" del menú abre la vista de tickets.
2. La lista muestra número, cliente, categoría, fecha y estado, con filtro por estado y buscador.
3. El estado cambia de Abierto a En revisión y a Resuelto; para marcarlo Resuelto se exige una respuesta.
4. El cliente ve el estado y la respuesta en Mis solicitudes.
5. El administrador puede eliminar un ticket con confirmación, y su número no se vuelve a usar.

## HU-10 · Solicitudes de apertura

**Como:** administrador de MOVA.

**Quiero:** recibir las solicitudes de apertura de los clientes nuevos y aprobarlas o denegarlas.

**Para:** controlar quién se vuelve cliente del banco.

**Criterios de aceptación:**

1. El registro desde la página crea una solicitud pendiente (SOL-0001…), no un cliente.
2. Mientras la solicitud está pendiente o fue denegada, el login se lo informa al usuario.
3. La pestaña Solicitudes de la vista Clientes muestra las pendientes.
4. Al revisar una solicitud se ven sus datos y los tres productos, con los botones Aprobar y Denegar (motivo opcional).
5. Al aprobarla se crea el cliente y ya puede iniciar sesión.

## HU-11 · Cupo de la tarjeta de crédito

**Como:** administrador de MOVA.

**Quiero:** definir el cupo de la tarjeta al aprobar una apertura y ajustarlo después.

**Para:** adaptar el crédito de cada cliente.

**Criterios de aceptación:**

1. Al aprobar una solicitud la tarjeta viene con $2.000.000 y se puede cambiar entre $500.000 y $20.000.000.
2. Desde el detalle del cliente se ajusta el cupo de una tarjeta que ya existe.
3. El cupo no puede quedar por debajo de lo que el cliente ya usó.
4. El disponible cambia en la misma diferencia y el ajuste queda en el historial como movimiento neutro.

## HU-12 · Extracto en PDF por cliente

**Como:** administrador de MOVA.

**Quiero:** descargar o imprimir un PDF detallado de cualquier cliente con su extracto y sus movimientos.

**Para:** tener un soporte de la actividad de cada cliente.

**Criterios de aceptación:**

1. El detalle del cliente tiene el botón "Descargar extracto".
2. Se elige el mes (por defecto el actual) o todo el historial.
3. El PDF trae los datos del cliente, el resumen por producto (saldo inicial, abonos, cargos y saldo final), los datos de la tarjeta y el detalle de movimientos.
4. Se guarda como PDF desde la ventana de impresión con un nombre claro.

## HU-13 · Configuración: cambiar contraseña del administrador

**Como:** administrador de MOVA.

**Quiero:** gestionar mi cuenta desde el botón Configuración y cambiar mi contraseña.

**Para:** mantener seguro el acceso al panel.

**Criterios de aceptación:**

1. El botón Configuración del menú abre su vista.
2. El cambio de clave pide la actual, la nueva (mínimo 8 caracteres) y su confirmación; la nueva debe ser distinta.
3. La nueva clave se guarda y el siguiente inicio de sesión la usa.
4. Los errores y el éxito se muestran con mensajes claros.

## HU-14 · Subadministradores con permisos

**Como:** administrador de MOVA.

**Quiero:** crear y gestionar subadministradores y darles permisos limitados.

**Para:** repartir el trabajo del panel sin entregar todo el control.

**Criterios de aceptación:**

1. Se crea un subadministrador con nombre, usuario, clave y permisos: Tickets, Bloqueados y Clientes.
2. Se pueden editar sus permisos, desactivarlo o eliminarlo.
3. El subadministrador entra por el mismo botón de administrador y solo ve las vistas y botones de sus permisos.
4. Solo el administrador principal aprueba solicitudes, crea subadministradores y elimina clientes.
5. El usuario no puede repetirse con el administrador ni con otro subadministrador.

## HU-15 · Recuperar contraseña

**Como:** cliente que olvidó su contraseña.

**Quiero:** recuperar el acceso a mi cuenta.

**Para:** no perder el acceso a mis productos.

**Criterios de aceptación:**

1. "¿Olvidaste tu contraseña?" abre un formulario con usuario, identificación y correo, que deben coincidir con un cliente.
2. Se crea una solicitud de restablecimiento que le llega al administrador.
3. El administrador la aprueba y el sistema genera una clave temporal.
4. Al entrar con la clave temporal, el cliente debe cambiarla antes de usar la aplicación.
5. "Recordarme" guarda el usuario en el navegador.

## HU-16 · Bitácora de acciones

**Como:** administrador de MOVA.

**Quiero:** ver una bitácora que registre quién hizo qué y cuándo en el panel.

**Para:** tener trazabilidad de los cambios, sobre todo con subadministradores.

**Criterios de aceptación:**

1. Se registran las acciones sobre clientes (registrar, editar, eliminar, bloquear, desbloquear), solicitudes, cupos, tickets y subadministradores.
2. Cada registro guarda fecha, quién lo hizo, la acción y el detalle.
3. La vista permite filtrar por persona y por acción, con lo más reciente primero.
4. Solo la ve el administrador principal y no se puede editar ni borrar.

## HU-17 · Metas de ahorro

**Como:** cliente con cuenta de ahorros.

**Quiero:** crear metas de ahorro y ver mi avance.

**Para:** organizar mi dinero hacia objetivos concretos.

**Criterios de aceptación:**

1. Se crea una meta con nombre, valor objetivo y fecha límite opcional (máximo 5 activas).
2. Se aparta dinero de la cuenta de ahorros hacia la meta y se puede devolver, sin aplicar el rendimiento asociado a un retiro.
3. Se ve una barra de progreso, cuánto falta y el aporte mensual sugerido si hay fecha.
4. Al llegar al objetivo la meta queda Cumplida.
5. Cada aporte o devolución queda en Movimientos.
