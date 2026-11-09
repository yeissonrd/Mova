# Roles del equipo — MOVA

Proyecto integrador de **Desarrollo de Software** · CESDE · Docente: Jorge Albeiro Muriel Vélez.

| Integrante | Rol principal | Rol técnico |
|---|---|---|
| Yully Milena Varela Isaza | Análisis / QA | Developer |
| Cristian Camilo Cano Tejada | Product Owner | Developer |
| Yeisson Fernando Mora Rodríguez | Scrum Master | Developer |

## Qué hace cada rol

**Análisis / QA (Yully):** revisa que cada historia de usuario cumpla sus criterios de aceptación, define y ejecuta las pruebas del flujo (registro, login, operaciones, transferencias) y reporta errores al equipo.

**Product Owner (Cristian):** representa al cliente y al docente; prioriza las historias de usuario, decide qué entra en cada entrega y aprueba que una historia se dé por terminada.

**Scrum Master (Yeisson):** facilita el trabajo del equipo, cuida el flujo de ramas y Pull Requests en GitHub, mantiene el seguimiento de avance y ayuda a resolver bloqueos.

**Developer (los tres):** todos programan. Cada uno toma historias de usuario, las desarrolla en su propia rama `feature/hu-XX-...` y las sube con Pull Request a `develop`.

## Reparto de historias de usuario

**Etapa 1 (terminada)**

| Integrante | Historias |
|---|---|
| Yully | HU-01 (panel del administrador), HU-02 (registro e inicio de sesión) |
| Yeisson | HU-03 (resumen y movimientos), HU-04 y HU-05 (cuentas de ahorros y corriente) |
| Cristian | HU-06 (tarjeta de crédito), HU-07 (transferencias), HU-08 (perfil y seguridad) |

**Etapa 2 (panel del administrador y mejoras)**

| Integrante | Historias |
|---|---|
| Yeisson | HU-09 (gestión de tickets), HU-10 (solicitudes de apertura), HU-11 (cupo de la tarjeta) — terminadas; HU-12 (extracto en PDF por cliente), HU-17 (metas de ahorro) |
| Cristian | HU-13 (configuración del administrador), HU-16 (bitácora de acciones) |
| Yully | HU-14 (subadministradores), HU-15 (recuperar contraseña) |

## Flujo de trabajo en Git

`feature/hu-XX-nombre` → Pull Request → `develop` → (al final, entre los tres) → `main`.
Nadie hace push directo a `main` ni a `develop`.
