# MOVA — Mueve tu dinero. Maneja tu futuro.

Aplicación bancaria web (HTML, CSS y JavaScript con Programación Orientada a Objetos) del proyecto integrador de **Desarrollo de Software** · CESDE.
Docente: Jorge Albeiro Muriel Vélez.

## Equipo y roles

| Integrante | Rol |
|---|---|
| Yully Milena Varela Isaza | Análisis / QA · Developer |
| Cristian Camilo Cano Tejada | Product Owner · Developer |
| Yeisson Fernando Mora Rodríguez | Scrum Master · Developer |

Detalle en [`docs/ROLES.md`](docs/ROLES.md).

## Documentación

| Documento | Contenido |
|---|---|
| [`docs/HISTORIAS_DE_USUARIO.md`](docs/HISTORIAS_DE_USUARIO.md) | Historias de usuario HU-01 a HU-17 con criterios de aceptación |
| [`docs/UML.md`](docs/UML.md) | Diagrama UML de clases (con imagen en `docs/uml/`) |
| [`docs/maqueta/MAQUETA.md`](docs/maqueta/MAQUETA.md) | Maqueta: las 10 pantallas de la aplicación |
| [`docs/ROLES.md`](docs/ROLES.md) | Roles del equipo y reparto de historias |

El seguimiento de todas las historias (HU-01 a HU-17) está en el Excel del equipo `MOVA_Historias_Pendientes.xlsx`.

## Qué hace la aplicación

**Cliente**
- Registro (queda como solicitud hasta que el banco la aprueba) e inicio de sesión con bloqueo de 24 horas tras 3 claves incorrectas.
- Resumen con saldo total, productos y últimos movimientos; historial con filtros.
- Cuenta de ahorros (retiro con interés del 1,5 %), cuenta corriente (sobregiro del 20 %) y tarjeta de crédito (compras de 1 a 36 cuotas y abonos).
- Transferencias entre cuentas.
- Perfil y seguridad: editar datos, cambiar y ver la contraseña, menú de cuenta con cierre de sesión.
- Campana de notificaciones con los movimientos nuevos.
- Extracto mensual en PDF con selector de mes.
- Centro de ayuda: preguntas frecuentes y tickets de soporte con la respuesta del banco.

**Administrador**
- Resumen con métricas y gráficos (dinero en el banco, movimientos y clientes) por día, mes o año.
- Clientes: lista, búsqueda, registrar, editar, eliminar, bloquear y desbloquear; detalle con sus tres productos y ajuste del cupo de la tarjeta.
- Solicitudes de apertura: aprobar (eligiendo productos y cupo de la tarjeta) o denegar.
- Gestión de tickets: cambiar estado, responder y eliminar.

## Estructura del código

```
index.html               Interfaz (todas las pantallas)
styles.css               Estilos generales
css/                     Estilos de cada función nueva
                         encabezado.css, ayuda.css, extracto.css, productos.css, admin.css
js/models/               Clases: Movimiento, Cuenta, CuentaAhorros, CuentaCorriente,
                         TarjetaCredito, Cliente, Solicitud, Administrador
js/services/Sistema.js   Coordina todo: login, solicitudes, operaciones y guardado en localStorage
js/ui/                   Interfaz, un archivo por área:
  comun.js               Utilidades compartidas (íconos, formato de dinero, sesión)
  navegacion.js          Navegación entre pantallas (no se edita)
  resumen.js             Resumen y movimientos (HU-03)
  extracto.js            Extracto mensual en PDF
  cuentas.js             Mis cuentas: ahorros y corriente (HU-04 / HU-05)
  productos.js           Beneficios de cada producto en la portada y el registro
  tarjeta.js             Tarjeta de crédito (HU-06)
  ayuda.js               Centro de ayuda y tickets
  transferencias.js      Transferencias (HU-07)
  perfil.js              Perfil y seguridad (HU-08)
  admin.js               Panel del admin: clientes y su detalle (HU-01)
  admin-panel.js         Menú del panel y cuadros (modales)
  admin-solicitudes.js   Solicitudes de clientes nuevos (HU-10 / HU-11)
  admin-tickets.js       Gestión de tickets (HU-09)
  admin-graficos.js      Gráficos del resumen del admin
  encabezado.js          Campana de notificaciones y menú de cuenta
  sesion.js              Login, registro y cierre de sesión (HU-02). Se carga de último
menu.js                  Versión de consola (fase 1)
```

## Cómo ejecutarlo

Abrir `index.html` en el navegador (no necesita instalación). Los datos se guardan en el `localStorage` del navegador; para empezar de cero, en la consola: `localStorage.clear()`.

## Flujo de trabajo en Git

`feature/hu-XX-nombre` → Pull Request → `develop` → `main` (al final). Nadie hace push directo a `main` ni a `develop`, y cada PR lo mezcla un compañero distinto a quien lo creó.
