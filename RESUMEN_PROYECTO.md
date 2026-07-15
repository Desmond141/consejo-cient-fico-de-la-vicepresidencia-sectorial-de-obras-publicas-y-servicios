# Resumen del Proyecto: Dashboard de Obras

Este documento es un resumen de alto nivel sobre la arquitectura y funcionamiento actual del Dashboard del Consejo Científico de la Vicepresidencia Sectorial de Obras Públicas y Servicios.

## 1. ¿Qué es la página?
El proyecto es el **Dashboard de Obras**. Es una aplicación web diseñada para visualizar y gestionar el progreso de diferentes "Capítulos" (fases o proyectos de obra), manteniendo un registro histórico de sus avances.

## 2. Arquitectura y Tecnologías
La aplicación está dividida en dos partes principales, preparadas para ser desplegadas en plataformas como Vercel:

*   **Frontend (Cliente):** Está construido con **HTML, CSS (Vanilla) y JavaScript**. No utiliza frameworks pesados como React o Angular, lo que lo hace muy rápido y directo.
*   **Backend (Servidor/API):** Está construido con **Node.js y Express**. Funciona como una API REST que atiende las peticiones del frontend.
*   **Base de Datos:** Utiliza **PostgreSQL** para almacenar de forma persistente la información.

## 3. ¿Cómo funciona? Funcionalidades Principales

### A. Sistema de Autenticación y Vistas (Pública vs. Privada)
*   La aplicación maneja las sesiones en el navegador usando `localStorage`.
*   **Vista Pública:** Cualquier persona que entre al Dashboard (en `index.html`) verá el estado de los proyectos y los gráficos de progreso, pero solo en modo lectura.
*   **Vista Privada (Login):** Si accedes a `login.html` e inicias sesión como administrador, el sistema guarda tu sesión. Al regresar al dashboard, el sistema detecta si eres "Superadmin" o si tienes permisos de gestión especiales como Gingerlin Molina, y habilita controles ocultos para administrar contenidos.

### B. Gestión de Capítulos y Progreso (API REST)
El backend en la carpeta `/api` proporciona rutas para comunicarse con la base de datos:
*   **Lectura (`GET /capitulos`):** El frontend llama a esta ruta para obtener todos los capítulos. El servidor consulta la tabla `capitulos` y la tabla `historial` en PostgreSQL, anidando el historial de cada capítulo para enviarlo todo estructurado al navegador.
*   **Creación y Actualización (`POST` y `PUT`):** Cuando un administrador actualiza el progreso de una obra, se envía una petición al backend. El backend no solo actualiza el porcentaje actual en la tabla `capitulos`, sino que automáticamente inserta un registro en la tabla `historial` para guardar quién, cuándo y por qué se cambió el porcentaje.

### C. Visualización de Datos (Dashboard)
*   En `js/app.js`, el frontend toma los datos de la API y calcula el **Avance Global** (promediando los porcentajes).
*   Se encarga de pintar la información en pantalla utilizando gráficos nativos hechos con HTML y SVG. Tiene la capacidad de alternar entre un estilo de gráfico de **barras** y un gráfico de **pastel/dona**, asignando colores dinámicamente según el nivel de progreso (por ejemplo, colores más brillantes para obras completadas al 100%).

### D. Gestión de Proyectos y Usuarios
*   Se incorporó una capa ligera de datos en `js/dashboard-data.js` para administrar proyectos y usuarios sin depender exclusivamente de la lógica del archivo principal.
*   Los superadmins y Gingerlin Molina pueden crear proyectos desde una vista específica.
*   También pueden registrar usuarios con rol **Admin** o **Usuario** y asignarles un proyecto.
*   La información se conserva en `localStorage` como base inicial para futuras integraciones con backend real.

## Resumen
Hemos construido un Dashboard interactivo, con un backend robusto conectado a base de datos PostgreSQL, que permite visualizar de manera pública el progreso de las obras, y administrarlo de forma privada y segura mediante autenticación, llevando un registro histórico inmutable de cada avance.
