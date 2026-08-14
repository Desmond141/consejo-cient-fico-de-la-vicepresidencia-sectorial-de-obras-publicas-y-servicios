# Dashboard — Control de Avance de Obra

**Consejo Científico de la Vicepresidencia Sectorial de Obras Públicas y Servicios**

Panel administrativo web para supervisar el avance de obra de la **Remodelación Integral de la Plaza Las Delicias, Caracas**. El proyecto ha evolucionado desde una vista estática hacia un dashboard funcional con autenticación, gestión de proyectos, control de capítulos, administración de usuarios y persistencia real en base de datos.

---

## Tabla de contenidos

1. [Descripción general](#descripción-general)
2. [Cambios funcionales implementados](#cambios-funcionales-implementados)
3. [Tecnologías](#tecnologías)
4. [Arquitectura del proyecto](#arquitectura-del-proyecto)
5. [Estructura de carpetas](#estructura-de-carpetas)
6. [Instalación y ejecución](#instalación-y-ejecución)
7. [Autenticación y permisos](#autenticación-y-permisos)
8. [Gestión de proyectos y capítulos](#gestión-de-proyectos-y-capítulos)
9. [Gestión de usuarios](#gestión-de-usuarios)
10. [Persistencia y sincronización](#persistencia-y-sincronización)
11. [Páginas principales](#páginas-principales)
12. [Estado actual](#estado-actual)

---

## Descripción general

Este dashboard permite:

- visualizar el avance global de la obra;
- consultar progreso por capítulo, fase o actividad;
- seleccionar un proyecto activo desde un menú persistido;
- registrar cambios de avance con historial;
- gestionar usuarios y permisos desde la misma aplicación;
- mantener los datos sincronizados entre `localStorage` y el backend.

La solución combina un frontend HTML/CSS/JavaScript con un backend Express y PostgreSQL, y ya no depende exclusivamente del almacenamiento local del navegador.

---

## Cambios funcionales implementados

Los cambios funcionales incorporados recientemente incluyen:

- Login con validación de credenciales para superadministradores y usuarios del dashboard.
- Protección de vistas según sesión activa y rol del usuario.
- Selección de proyecto activo persistida en `localStorage` para mantener el contexto durante la sesión del usuario.
- Creación, actualización y eliminación de capítulos asociados al proyecto seleccionado.
- Registro de historial de progreso por capítulo y visualización del mismo en la vista de detalle.
- Alta, edición y baja de usuarios con asignación a proyecto y cambio de rol.
- Gestión de proyectos con progreso, código, descripción y estado.
- Persistencia real en PostgreSQL con endpoints REST para proyectos, usuarios y capítulos.
- Sincronización local/backend con fallback automático cuando la API no responde.
- Inicialización lazy de la base de datos y monta del router tanto en `/api` como en la raíz.

---

## Tecnologías

- HTML5
- CSS con Tailwind CDN
- JavaScript Vanilla
- Node.js + Express
- PostgreSQL / Neon DB
- `localStorage` para sesión, proyecto activo y fallback local
- `pg` para conexión a la base de datos
- `cors` para integración del frontend con la API

---

## Arquitectura del proyecto

La arquitectura actual está organizada en capas:

- `index.html`: dashboard principal y panel administrativo.
- `login.html`: pantalla de acceso.
- `js/auth.js`: gestión de sesión, login, logout y protección de páginas.
- `js/dashboard-data.js`: capa de datos con hidratação, sincronización y fallback local.
- `js/app.js`: renderizado del dashboard, gráficos, formularios, selector de proyecto y lógica de negocio.
- `js/data/superadmins.js`: usuarios administradores iniciales y validación de credenciales.
- `api/db.js`: conexión y esquema de base de datos.
- `api/index.js`: endpoints REST para proyectos, capítulos y usuarios.
- `server.js`: arranque principal del backend y montaje de la API.

---

## Estructura de carpetas

```text
Dashboard/
├── api/
│   ├── db.js
│   └── index.js
├── assets/
│   ├── logos/
│   └── Videos/
├── css/
│   └── styles.css
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── dashboard-data.js
│   └── data/
│       └── superadmins.js
├── index.html
├── login.html
├── package.json
├── server.js
├── README.md
├── RESUMEN_PROYECTO.md
└── vercel.json
```

---

## Instalación y ejecución

### Requisitos

- Node.js 18 o superior
- PostgreSQL o una base compatible con `pg`
- Variable de entorno `DATABASE_URL` o `POSTGRES_URL` configurada

### Instalación

```bash
npm install
```

### Ejecución

```bash
npm start
```

El comando anterior arrancará el servidor principal en `server.js`, que monta la API en `/api`.

También se puede ejecutar directamente:

```bash
node server.js
```

Luego se puede abrir en el navegador:

- `login.html` para iniciar sesión
- `index.html` para acceder al dashboard principal

---

## Autenticación y permisos

El flujo de autenticación está implementado con sesiones en `localStorage`:

- `obras_dashboard_session` guarda nombre, usuario, correo y rol del usuario autenticado.
- `login.html` valida la información con `window.SuperadminsDB.validateCredentials()`.
- `js/auth.js` protege la vista del dashboard y redirige a login si no hay sesión válida.
- La administración del dashboard está habilitada para usuarios con roles autorizados, principalmente superadministradores y perfiles específicos del proyecto.

### Permisos básicos del sistema

- Superadmins pueden acceder a la gestión administrativa completa.
- Los usuarios registrados también pueden autenticarse en la plataforma según el sistema integrado.
- La vista de proyectos y usuarios está visible solo para cuentas con permisos adecuados.

---

## Gestión de proyectos y capítulos

La app permite:

- crear nuevos proyectos con nombre, descripción, progreso y código;
- cambiar el proyecto activo;
- asociar capítulos al proyecto seleccionado;
- crear capítulos con orden y progreso;
- modificar el progreso de un capítulo existente;
- eliminar capítulos del proyecto;
- visualizar en detalle el historial de cambios por capítulo.

El flujo principal asegúra que los capítulos se agreguen siempre al proyecto activo y no a un valor por defecto arbitrario.

---

## Gestión de usuarios

La vista de administración de usuarios actualmente permite:

- crear usuarios con nombre, email, username, contraseña y rol;
- asignar proyecto y proyecto asociado en la entidad del usuario;
- editar usuarios existentes;
- eliminar usuarios;
- cambiar rol y proyecto según el caso de uso del dashboard;
- sincronizar los usuarios con la base de datos para persistencia real.

El modelo funciona tanto con credenciales iniciales de superadmins como con usuarios creados desde la propia aplicación.

---

## Persistencia y sincronización

### Persistencia real

El backend expone rutas para persistir y recuperar información en PostgreSQL:

- `GET /api/capitulos` — obtiene capítulos y su historial.
- `POST /api/capitulos` — crea un capítulo nuevo.
- `PUT /api/capitulos/:id` — actualiza el progreso y agrega historial.
- `DELETE /api/capitulos/:id` — elimina un capítulo.
- `GET /api/proyectos` — lista proyectos.
- `PUT /api/proyectos` — sincroniza proyectos completos.
- `GET /api/usuarios` — lista usuarios.
- `POST /api/usuarios` — crea un usuario.
- `PUT /api/usuarios/:id` — actualiza un usuario.
- `DELETE /api/usuarios/:id` — elimina un usuario.

### Sincronización local/backend

`js/dashboard-data.js` mantiene dos capas de almacenamiento:

- almacenamiento local en `localStorage` para respuesta rápida y uso sin backend;
- sincronización con la API cuando está disponible;
- fallback automático a datos locales si la base de datos no responde.

Esto hace que la aplicación sea resiliente y compatible con despliegues locales y remotos.

---

## Páginas principales

### `login.html`

- pantalla de autenticación;
- validación de credenciales;
- acceso a la administración del dashboard.

### `index.html`

- vista principal del dashboard;
- selector de proyectos activos;
- KPIs del avance general;
- gráficos y tablas por capítulo;
- acceso a formularios de proyecto, capítulo y usuario;
- contenido protegido según sesión activa.

---

## Estado actual

El proyecto ya no se limita a un dashboard estático ni a un almacenamiento local aislado. Actualmente presenta una estructura funcional con:

- autenticación real en frontend;
- roles y permisos básicos;
- gestión de proyectos y capítulos;
- CRUD de usuarios;
- sincronización con PostgreSQL;
- historial de progreso por capítulo;
- soporte de fallback local para uso no conectado.

El sistema está listo para continuar ampliándose con mejoras adicionales de UX, validación, roles más granulares y despliegue productivo.

---

## Nota final

La documentación del proyecto debe reflejar que el dashboard ya está funcionando como una solución administrativa con backend, persistencia, gestión de usuarios y control de obra. Los cambios funcionales introducidos se han consolidado y ahora forman parte del comportamiento principal de la aplicación.
