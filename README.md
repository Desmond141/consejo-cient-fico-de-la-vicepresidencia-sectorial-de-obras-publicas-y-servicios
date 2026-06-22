# Dashboard - Documentación y guía de credenciales locales

Resumen rápido
- Proyecto: panel administrativo (Dashboard) estático.
- Objetivo de este cambio: evitar que credenciales en texto plano queden versionadas en Git manteniendo las mismas contraseñas existentes.

Estructura relevante
- `js/data/superadmins.js`: Módulo que expone `SuperadminsDB` (lectura, validación y persistencia en localStorage).
- `js/data/superadmins.local.js`: Archivo local (git-ignored) que define `window.LOCAL_SUPERADMINS` con las entradas de superadministradores. NO debería commitearse.

Qué hace cada parte
- `SuperadminsDB.getAll()` — devuelve la lista de administradores desde `localStorage` o desde `DEFAULT_SUPERADMINS` si no existe nada.
- `SuperadminsDB.findByCredential(credential)` — busca un admin por `email` o `username` (case-insensitive).
- `SuperadminsDB.validateCredentials(credential, password)` — compara el `password` provisto codificado con `btoa(password)` y lo compara con `passwordHash` guardado.
- `SuperadminsDB.saveAdmins(admins)` — guarda la lista en `localStorage` bajo la clave `obras_dashboard_superadmins`.

Cómo ocultamos las credenciales sin cambiarlas
- En lugar de dejar las contraseñas en texto plano dentro del repositorio, ahora se recomienda crear el archivo `js/data/superadmins.local.js` en el proyecto local. Este archivo ya está en `.gitignore`.
- El formato es: `window.LOCAL_SUPERADMINS = [ { id, nombre, username, email, rol, passwordHash } ];` donde `passwordHash` es la codificación base64 de la contraseña original. Las contraseñas en texto plano NO se modifican en el servicio: siguen siendo las mismas que tenías.
- `js/data/superadmins.js` detecta `window.LOCAL_SUPERADMINS` y lo usa como `DEFAULT_SUPERADMINS` si está presente. Si no existe, el módulo usa el fallback incorporado (compatibilidad).

Instrucciones prácticas (pasos)
1. Crear el archivo local (ya hemos añadido un ejemplo `js/data/superadmins.local.js` en tu copia local). Verifica que contiene las mismas `passwordHash` en base64 que antes.
2. Asegúrate de que `js/data/superadmins.local.js` esté incluido antes de `js/data/superadmins.js` en tu `index.html` (si cargas scripts de forma explícita). Por ejemplo:

```html
<script src="js/data/superadmins.local.js"></script>
<script src="js/data/superadmins.js"></script>
```

3. Comprueba el funcionamiento: abre la página y prueba iniciar sesión con las contraseñas originales.

Nota de seguridad y mejoras recomendadas
- Base64 (`btoa`) NO es un hash seguro: es sólo una codificación reversible. Se usa aquí para mantener compatibilidad y las mismas contraseñas (como pediste), pero no protege contra un atacante con acceso al repositorio local o al archivo.
- Para mayor seguridad en el futuro (recomendado):
  - Mover la autenticación a servidor y almacenar sólo hashes seguros (bcrypt/argon2).
  - Usar variables de entorno o secretos gestionados por el servidor en lugar de archivos dentro del proyecto.
  - Implementar un proveedor de identidad (OAuth2, OpenID Connect) si procede.

Alternativas de implementación
- Opción A — Variables de entorno / archivo `.env` en entorno de servidor: no exponer credenciales en el cliente.
- Opción B — Servidor de autenticación: el frontend delega en una API que valida credenciales y devuelve un token (JWT o sesión).
- Opción C — Uso de un almacén de secretos (HashiCorp Vault, AWS Secrets Manager): para proyectos desplegados en infra nube.

Cambios recientes en la interfaz del dashboard
- Archivos afectados: `index.html`, `login.html`, `css/styles.css`.
- Ajustes aplicados:
  - Se mejoró la escala interna de los logos en los contenedores sin aumentar el tamaño total de la caja.
  - Se redujo el `padding` de `.logo-card` y `.logo-card-dashboard` para que la imagen del logo ocupe más área visible.
  - Se amplió el `max-width` de las imágenes a `90%`/`95%` y se forzó un `max-height` mayor con `!important` para que el logo luzca más grande.
  - Se sustituyó la clase `logo-card-dashboard--large` por `logo-card-dashboard--emphasis` y se eliminó la necesidad de agrandar la tarjeta principal.
- Motivo de los cambios:
  - El logo de `Consejo Científico` estaba listo y visible, pero demasiado pequeño dentro del mismo contenedor.
  - El objetivo era lograr legibilidad y presencia sin romper el diseño general del dashboard ni alterar el tamaño de las tarjetas.
  - El login también requería que el logo fuera más visible en su tarjeta de credenciales, manteniendo el mismo layout.

Advertencias finales
- Aunque el archivo local está git-ignored, cualquier persona con acceso al sistema de archivos del servidor/PC donde se aloje el proyecto podrá leerlo. Para producción, usar siempre autenticación basada en servidor.

Si quieres, puedo:
- Automatizar la inclusión del `js/data/superadmins.local.js` en `index.html`.
- Migrar la validación a una pequeña API local que use hashing seguro (bcrypt).
