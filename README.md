# Dashboard — Control de Avance de Obra

**Consejo Científico de la Vicepresidencia Sectorial de Obras Públicas y Servicios**

Panel administrativo web para supervisar el avance de obra de la **Remodelación Integral de la Plaza Las Delicias, Caracas**. Combina una interfaz visual moderna con una capa de persistencia en backend y un flujo básico de gestión de usuarios y proyectos.

---

## Tabla de contenidos

1. [Descripción General](#descripción-general)
2. [Tecnologías](#tecnologías)
3. [Arquitectura](#arquitectura)
4. [Estructura del Proyecto](#estructura-del-proyecto)
5. [Instalación y ejecución](#instalación-y-ejecución)
6. [Autenticación y permisos](#autenticación-y-permisos)
7. [Gestión de proyectos y capítulos](#gestión-de-proyectos-y-capítulos)
8. [Gestión de usuarios](#gestión-de-usuarios)
9. [Persistencia y sincronización](#persistencia-y-sincronización)
10. [Páginas principales](#páginas-principales)
11. [Mejoras futuras](#mejoras-futuras)

---

## Descripción General

Este proyecto ofrece un dashboard para visualizar el estado de avance de obras y gestionar su información desde un panel administrativo.

El frontend muestra:

- Avance global y desglose por capítulo.
- Gráficos interactivos en barras y pastel.
- Vista de notas y video de seguimiento.
- Formularios para agregar capítulos, eliminar capítulos, crear proyectos y gestionar usuarios.
- Un selector de proyectos con proyecto activo persistido en `localStorage`.

El backend soporta:

- Persistencia en PostgreSQL/Neon.
- API REST para capítulos, proyectos y usuarios.
- Historial de cambios de progreso por capítulo.

---

## Tecnologías

- HTML5
- CSS con Tailwind CDN
- JavaScript Vanilla
- Node.js + Express
- PostgreSQL / Neon DB
- `localStorage` para estado de sesión y fallback local

---

## Arquitectura

El proyecto está dividido en:

- `index.html`: Dashboard principal.
- `login.html`: Pantalla de login para superadmins.
- `js/auth.js`: Control de sesión, protección de vistas y logout.
- `js/dashboard-data.js`: Capa de datos que maneja proyectos, usuarios y capítulos con sincronización local/backend.
- `js/app.js`: Lógica de renderizado del dashboard, gráficos, formularios y navegación entre secciones.
- `js/data/superadmins.js`: Gestión de credenciales de superadministradores.
- `api/index.js`: API REST de Express para la app y la ruta `/api`.
- `api/db.js`: Conexión a la base de datos PostgreSQL.

---

## Estructura del Proyecto

```
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
│       ├── superadmins.js
│       └── superadmins.local.js
├── index.html
├── login.html
├── README.md
└── RESUMEN_PROYECTO.md
```

---

## Instalación y ejecución

### Requisitos

- Node.js
- PostgreSQL / Neon DB o una base de datos compatible con `pg`

### Uso local

1. Instalar dependencias si no están instaladas:

```bash
npm install
```

2. Configurar la variable de entorno `DATABASE_URL` con la conexión PostgreSQL.

3. Iniciar el servidor backend:

```bash
node api/index.js
```

> En este repositorio la lógica del backend está dentro de `api/index.js` y se puede ejecutar como un servidor Express o desplegar en Vercel.

4. Abrir el frontend en el navegador:

- `login.html` para el inicio de sesión.
- `index.html` para el dashboard.

---

## Autenticación y permisos

El login se gestiona en `js/auth.js` con sesiones guardadas en `localStorage`.

- `login.html` permite autenticarse con correo o nombre de usuario.
- Las credenciales iniciales se definen en `js/data/superadmins.js` y pueden combinarse con `js/data/superadmins.local.js`.
- La sesión activa se guarda bajo `obras_dashboard_session`.
- El dashboard protege `index.html` y redirige a `login.html` si no hay sesión válida.

### Permisos especiales

- Solo los superadmins y el usuario `Gingerlin Molina` pueden:
  - Ver la vista de administración.
  - Crear proyectos.
  - Crear, editar y eliminar usuarios.

---

## Gestión de proyectos y capítulos

La aplicación permite:

- Crear proyectos nuevos con nombre, descripción y progreso.
- Seleccionar el proyecto actualmente activo.
- Agregar capítulos a ese proyecto.
- Actualizar el progreso de capítulos existentes.
- Eliminar capítulos.
- Borrar proyectos desde una vista de prueba.

### Capítulos vinculados al proyecto seleccionado

Al agregar un capítulo, el formulario usa el proyecto activo (`selectedProject.id`).
Esto garantiza que el capítulo se cree siempre en el proyecto abierto, no en un proyecto por defecto.

---

## Gestión de usuarios

La vista de gestión de usuarios permite:

- Crear usuarios con rol `Admin` o `Usuario`.
- Asignar usuarios a un proyecto.
- Editar usuarios existentes.
- Eliminar usuarios.
- Cambiar proyecto asignado y rol.

### Flujo de edición

- El botón `Editar` carga el usuario en el formulario.
- El botón `Cancelar edición` restablece el formulario a modo creación.

---

## Persistencia y sincronización

### Backend persistente

El backend ofrece rutas para:

- `GET /api/capitulos` — obtiene capítulos por proyecto y su historial.
- `POST /api/capitulos` — crea un capítulo nuevo.
- `PUT /api/capitulos/:id` — actualiza el progreso y agrega historial.
- `DELETE /api/capitulos/:id` — elimina un capítulo.
- `GET /api/proyectos` — lista proyectos.
- `PUT /api/proyectos` — sincroniza proyectos completos.
- `GET /api/usuarios` — lista usuarios.
- `PUT /api/usuarios` — sincroniza usuarios completos.
- `POST /api/usuarios` — crea un usuario.
- `PUT /api/usuarios/:id` — actualiza un usuario.
- `DELETE /api/usuarios/:id` — elimina un usuario.

### Sincronización local/backend

`js/dashboard-data.js` mantiene datos en `localStorage` y sincroniza con la API cuando está disponible.

- Proyectos y usuarios se hidratan desde el servidor al inicio.
- Los capítulos se cargan desde la API en función del proyecto activo.
- Si la API no responde, se usa un fallback local.

---

## Páginas principales

### `login.html`

- Pantalla de inicio de sesión.
- Franja superior con tres logos institucionales integrados.
- Formulario de acceso con validación de credenciales.

### `index.html`

- Dashboard principal con:
  - Vista de progreso global.
  - Selector de proyectos.
  - Panel de navegación entre secciones.
  - Formulario de creación/edición de datos.
  - Gestión de usuarios y proyectos.

---

## Mejoras futuras

- Integrar el backend de forma nativa con un despliegue en Vercel/Neon.
- Agregar validación de formularios más estricta en el frontend.
- Añadir roles más granulares y permisos dinámicos.
- Permitir editar capítulos y proyectos desde el backend.
- Implementar carga de archivos e imágenes para cada proyecto.

---

## Nota final

Este dashboard ya no depende únicamente de `localStorage` para su persistencia. El proyecto ahora soporta almacenamiento real en PostgreSQL y sincronización cliente-servidor para proyectos, usuarios y capítulos.
