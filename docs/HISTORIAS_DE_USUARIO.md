# Historias de usuario — MOVA

Historias de usuario del proyecto integrador (CESDE · Desarrollo de Software). El seguimiento de avance está en el Excel del equipo `MOVA_Historias_Pendientes.xlsx`.

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

**Quiero:** consignar y retirar dinero, y que se me aplique automáticamente un interés del 1.5% en cada retiro.

**Para:** hacer crecer mis ahorros mientras uso mi cuenta con normalidad.

**Criterios de aceptación:**

1. El retiro no puede superar el saldo disponible.
2. El interés del 1.5% se calcula y aplica automáticamente en cada retiro.
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
