# Resumen del Proyecto: Dashboard de Obras

Este repositorio contiene un **dashboard administrativo** para el seguimiento del avance de obra de la **Remodelación Integral de la Plaza Las Delicias, Caracas**. El proyecto ya no es solo una vista visual: incorpora autenticación, gestión de proyectos, control de capítulos, administración de usuarios y persistencia en base de datos.

## Qué hace el proyecto

- Muestra el avance general de la obra con indicadores visuales.
- Presenta gráficos de barras y pastel por capítulo o fase.
- Permite acceder mediante login con validación de usuarios y superadmins.
- Mantiene el proyecto activo seleccionado en `localStorage` y lo recupera al entrar.
- Permite crear, editar y eliminar proyectos, capítulos y usuarios.
- Registra el historial de cambios de progreso por capítulo.
- Guarda y sincroniza datos con PostgreSQL cuando la API está disponible.

## Arquitectura actual

El sistema está dividido en dos capas principales:

- **Frontend**: HTML, CSS y JavaScript vanilla para la interfaz, el dashboard y la lógica de vistas.
- **Backend**: Node.js + Express con endpoints REST para proyectos, capítulos y usuarios.

La lógica clave está en:

- `js/app.js`: renderizado del dashboard, formularios y lógica de negocio.
- `js/auth.js`: inicio de sesión, logout y protección de páginas.
- `js/dashboard-data.js`: sincronización entre `localStorage` y la API.
- `api/index.js`: endpoints y lógica del servidor.
- `api/db.js`: conexión y esquema de datos.

## Funcionalidades ya implementadas

El proyecto incluye los siguientes cambios funcionales integrados:

- Login con validación de credenciales.
- Protección del dashboard según sesión activa.
- Contraseñas y usuarios gestionados con credenciales base y usuarios creados desde la app.
- Gestión de proyectos con código, estado, descripción y progreso.
- Gestión de capítulos vinculados al proyecto activo.
- Actualización del progreso con historial de cambios.
- CRUD de usuarios con rol y proyecto asignado.
- Persistencia real en PostgreSQL / Neon.
- Fallback local cuando no hay conexión a la API.

## Persistencia y sincronización

La persistencia funciona de la siguiente manera:

- Los proyectos, usuarios y capítulos se pueden guardar en PostgreSQL.
- La capa de datos sincroniza los cambios locales con la API.
- Si la API no responde, la aplicación usa los datos guardados en `localStorage`.
- El historial del progreso por capítulo se mantiene en la base de datos y se muestra en la vista detallada.

## Estado actual

El proyecto ya no funciona únicamente como una SPA local. Ahora tiene una arquitectura funcional y completa para:

- controlar el avance de obra;
- gestionar la información operativa del proyecto;
- mantener usuarios con permisos;
- persistir los datos de forma real y segura.

## Ventajas clave

- Mantiene continuidad en la sesión con proyecto activo persistido.
- Evita la pérdida de información cuando la API está disponible.
- Permite ampliar el sistema con más roles, validaciones y módulos del proyecto.
- Tiene una base sólida para seguir desarrollando la administración del dashboard.

## Conclusión

La funcionalidad ya implementada se configura como un dashboard administrativo operativo, con backend, sincronización y gestión de contenido real. La documentación debe reflejar este estado actual y no limitarse a la versión inicial visual del proyecto.
