# Resumen del Proyecto: Dashboard de Obras

Este repositorio contiene un **Dashboard administrativo** para el seguimiento de la obra de la Plaza Las Delicias en Caracas.

## Qué hace el proyecto

- Presenta un dashboard visual con el avance global de los capítulos de obra.
- Permite ver el progreso por capítulo en gráficos de barras y pastel.
- Incluye una pantalla de login para superadministradores.
- Permite crear proyectos, capítulos y usuarios con roles.
- Vincula capítulos al proyecto actualmente seleccionado.

## Arquitectura

El proyecto está diseñado con una doble capa:

- **Frontend** en HTML/CSS/JavaScript puro.
- **Backend** en Node.js + Express con endpoints REST.

## Persistencia actual

- Usa **PostgreSQL / Neon** para almacenar:
  - proyectos,
  - capítulos,
  - historial de avances,
  - usuarios.
- `js/dashboard-data.js` ofrece una capa de datos que sincroniza el estado local con el servidor.
- El login se gestiona en el navegador, y la validación de usuarios incorpora tanto superadmins como usuarios creados desde el dashboard.

## Estado actual

- El proyecto ya no funciona solo como una SPA local.
- Los cambios de capítulos se guardan en el backend por proyecto abierto.
- La creación y edición de usuarios está habilitada y persiste en la base de datos.
- La vista de proyectos mantiene el proyecto activo en `localStorage`.

## Ventajas clave

- No pierde datos al cambiar de navegador o dispositivo cuando hay backend disponible.
- El histórico de progreso de capítulos se maneja con una tabla de historial en la base de datos.
- El dashboard tiene una estructura clara que soporta expansión futura.
