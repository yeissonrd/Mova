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
| [`docs/HISTORIAS_DE_USUARIO.md`](docs/HISTORIAS_DE_USUARIO.md) | Historias de usuario HU-01 a HU-08 con criterios de aceptación |
| [`docs/UML.md`](docs/UML.md) | Diagrama UML de clases (con imagen en `docs/uml/`) |
| [`docs/maqueta/MAQUETA.md`](docs/maqueta/MAQUETA.md) | Maqueta: las 10 pantallas de la aplicación |
| [`docs/ROLES.md`](docs/ROLES.md) | Roles del equipo y reparto de historias |
| [`docs/MOVA_Proyecto_Integrador.docx`](docs/MOVA_Proyecto_Integrador.docx) | Documento completo del proyecto integrador |

## Estructura del código

```
index.html            Interfaz
styles.css            Estilos
js/ui/                Interfaz, un archivo por área (ver abajo)
                      comun.js, navegacion.js (no se edita), resumen.js (HU-03),
                      cuentas.js (HU-04/05), tarjeta.js (HU-06), transferencias.js (HU-07),
                      perfil.js (HU-08), admin.js (HU-01), sesion.js (HU-02)
js/models/            Clases: Movimiento, Cuenta, CuentaAhorros, CuentaCorriente,
                      TarjetaCredito, Cliente, Administrador
js/services/Sistema.js  Coordina todo: login, operaciones y guardado en localStorage
menu.js               Versión de consola (fase 1)
```

## Cómo ejecutarlo

Abrir `index.html` en el navegador (no necesita instalación). Administrador inicial: usuario `admin`, clave `Admin1234`.

## Flujo de trabajo en Git

`feature/hu-XX-nombre` → Pull Request → `develop` → `main` (al final). Nadie hace push directo a `main` ni a `develop`.
