# Dashboard — Control de Avance de Obra

**Consejo Científico de la Vicepresidencia Sectorial de Obras Públicas y Servicios**

Panel administrativo web diseñado para monitorear y visualizar el avance de la **Remodelación Integral de la Plaza Las Delicias, Caracas**. Provee una interfaz moderna, interactiva y responsiva para que los superadministradores del proyecto consulten el estado de cada capítulo de obra, revisen notas técnicas y reproduzcan material audiovisual de seguimiento.

---

## Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Tecnologías Utilizadas](#tecnologías-utilizadas)
3. [Estructura del Proyecto](#estructura-del-proyecto)
4. [Requisitos Previos](#requisitos-previos)
5. [Instalación y Puesta en Marcha](#instalación-y-puesta-en-marcha)
6. [Interfaz de Login (login.html)](#interfaz-de-login-loginhtml)
7. [Interfaz del Dashboard (index.html)](#interfaz-del-dashboard-indexhtml)
   - [Barra Lateral de Navegación (Sidebar)](#barra-lateral-de-navegación-sidebar)
   - [Encabezado Superior con Logos y Sesión](#encabezado-superior-con-logos-y-sesión)
   - [Vista Principal: Dashboard](#vista-principal-dashboard)
   - [Vista Pin 1: Notas Técnicas](#vista-pin-1-notas-técnicas)
   - [Vista Pin 2: Avance Global](#vista-pin-2-avance-global)
   - [Vista Pin 3: Desglose por Capítulos](#vista-pin-3-desglose-por-capítulos)
8. [Sistema de Autenticación](#sistema-de-autenticación)
   - [Flujo de Inicio de Sesión](#flujo-de-inicio-de-sesión)
   - [Protección del Dashboard](#protección-del-dashboard)
   - [Cierre de Sesión](#cierre-de-sesión)
9. [Gestión de Credenciales](#gestión-de-credenciales)
   - [Archivo Local de Credenciales](#archivo-local-de-credenciales)
   - [Base de Datos de Superadministradores](#base-de-datos-de-superadministradores)
10. [Funcionalidades Detalladas](#funcionalidades-detalladas)
    - [Gráfico de Barras de Progreso](#gráfico-de-barras-de-progreso)
    - [Gráfico de Pastel (Donut)](#gráfico-de-pastel-donut)
    - [Anillo de Avance Global](#anillo-de-avance-global)
    - [Tabla de Desglose por Capítulos](#tabla-de-desglose-por-capítulos)
    - [Reproductor de Video](#reproductor-de-video)
    - [Elementos Arrastrables (Drag & Drop)](#elementos-arrastrables-drag--drop)
    - [Animaciones y Transiciones](#animaciones-y-transiciones)
11. [Diseño Visual y Estética](#diseño-visual-y-estética)
12. [Notas de Seguridad](#notas-de-seguridad)
13. [Mejoras Recomendadas para el Futuro](#mejoras-recomendadas-para-el-futuro)

---

## Descripción General

Este proyecto es un **panel administrativo estático (sin Backend/servidor)** que funciona completamente en el navegador. Su propósito principal es ofrecer a los superadministradores del Consejo Científico una herramienta visual para:

- **Consultar el avance global** del proyecto de obra (actualmente al 60%).
- **Revisar el progreso individual** de cada uno de los 7 capítulos de la obra.
- **Visualizar gráficos interactivos** de barras y de pastel con los datos de avance.
- **Reproducir un video** de seguimiento semanal de la obra.
- **Leer notas técnicas** relevantes sobre decisiones de diseño del proyecto.
- **Controlar el acceso** mediante un sistema de login con usuarios predefinidos.

---

## Tecnologías Utilizadas

| Tecnología | Uso |
|---|---|
| **HTML5** | Estructura semántica de las páginas |
| **Tailwind CSS (CDN)** | Clases utilitarias para layout, tipografía, colores y espaciado |
| **CSS personalizado** (`css/styles.css`) | Efectos Glassmorphism, animaciones, fondo animado con orbes, estilos de login, barras de progreso, gráficos y scrollbar |
| **JavaScript (Vanilla)** | Toda la lógica de la aplicación: autenticación, renderizado dinámico de gráficos, navegación por vistas, drag & drop y control de video |
| **SVG** | Gráfico de anillo (avance global) y gráfico de donut/pastel generados dinámicamente |
| **Google Fonts** | Tipografía *Plus Jakarta Sans* para una apariencia moderna |
| **localStorage** | Persistencia de sesión de usuario y datos de administradores en el navegador |

---

## Estructura del Proyecto

```
Dashboard/
├── index.html                          # Página principal del Dashboard (protegida)
├── login.html                          # Página de inicio de sesión
├── README.md                           # Este archivo de documentación
├── .gitignore                          # Archivos excluidos del repositorio
│
├── css/
│   └── styles.css                      # Estilos personalizados (glassmorphism, animaciones, layout)
│
├── js/
│   ├── app.js                          # Lógica principal: gráficos, navegación, video, drag & drop
│   ├── auth.js                         # Sistema de autenticación y manejo de sesión
│   └── data/
│       ├── superadmins.js              # Módulo de gestión de superadministradores
│       └── superadmins.local.js        # Credenciales locales (git-ignored, NO se sube al repositorio)
│
└── assets/
    ├── logos/
    │   ├── Consejo Cientifico.png       # Logo del Consejo Científico
    │   ├── Obras Publicas.png           # Logo de Obras Públicas
    │   └── Vicepresidencia de servicio.png  # Logo de la Vicepresidencia de Servicios
    │
    └── Videos/
        ├── las_delicias_semana_13_20_jun_compressed.mp4  # Video comprimido (~55 MB, usado en la web)
        └── las delicias semana del 13 al 20 jun final.mp4  # Video original (~675 MB, git-ignored)
```

---

## Requisitos Previos

Este proyecto **no requiere instalación de dependencias ni servidor**. Solo necesitas:

1. Un **navegador web moderno** (Chrome, Firefox, Edge o Safari en sus versiones recientes).
2. **Conexión a internet** (solo para cargar Tailwind CSS desde CDN y la fuente Google Fonts). Si se despliega sin conexión, esos recursos no cargarán.
3. Tener los archivos del proyecto descargados o clonados localmente.

---

## Instalación y Puesta en Marcha

### Paso 1 — Clonar o descargar el repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd Dashboard
```

### Paso 2 — Crear el archivo de credenciales locales (si no existe)

Crea el archivo `js/data/superadmins.local.js` con el siguiente contenido para mantener las credenciales fuera del repositorio:

```javascript
window.LOCAL_SUPERADMINS = [
  { id: 'sa1', nombre: 'Trino Baloa', username: 'Trino.B', email: 'trino.b@obras.gob.ve', rol: 'Superadmin', passwordHash: 'VHJpbm9CMTIz' },
  { id: 'sa2', nombre: 'Alexander Marin', username: 'Alexander.M', email: 'alexander.m@obras.gob.ve', rol: 'Superadmin', passwordHash: 'QWxleGFuZGVyTTEyMw==' },
  // ... agregar más administradores según sea necesario
];
```

> **Nota**: El `passwordHash` es la contraseña codificada en Base64 usando `btoa('contraseña')`. Este archivo está incluido en `.gitignore` y **no debe subirse** al repositorio.

### Paso 3 — Abrir la aplicación

Abre el archivo `login.html` directamente en tu navegador, o usa un servidor local:

```bash
# Opción 1: abrir directamente
xdg-open login.html       # Linux
open login.html            # macOS
start login.html           # Windows

# Opción 2: servidor local con Python
python3 -m http.server 8080
# Luego abre http://localhost:8080/login.html en tu navegador
```

### Paso 4 — Iniciar sesión

Ingresa con cualquiera de los usuarios registrados usando su **correo electrónico o nombre de usuario** y su contraseña.

---

## Interfaz de Login (`login.html`)

La página de login es el punto de entrada a la aplicación. Presenta una interfaz oscura, elegante y centrada con los siguientes elementos:

### Elementos Visuales

1. **Fondo animado con orbes**: Tres esferas con difuminado (`blur`) que flotan suavemente creando un efecto de malla dinámica de color azul y gris.
2. **Franja institucional (Brand Strip)**: Barra superior que contiene:
   - El título **"Panel de Superadmins"** con la etiqueta "Acceso seguro".
   - Una descripción: *"Inicia sesión para acceder al dashboard..."*.
   - **Tres logos institucionales** dispuestos en una cuadrícula: Vicepresidencia de Servicios, Consejo Científico y Obras Públicas.
3. **Panel de formulario de login**: Tarjeta centrada con efecto glass que incluye:
   - Título: **"Bienvenido de nuevo"**.
   - Campo de texto para **usuario o correo electrónico**.
   - Campo de contraseña.
   - Botón **"Iniciar sesión"** en color azul cielo (`sky-400`).
   - Mensaje de error (oculto por defecto) que aparece al ingresar credenciales incorrectas.
   - Indicador de estado de autenticación: *"Validando credenciales de Usuario"*.

### Flujo Paso a Paso del Login

1. El usuario abre `login.html` en el navegador.
2. El sistema verifica si ya existe una sesión activa en `localStorage`. Si existe, **redirige automáticamente** a `index.html`.
3. Si no hay sesión activa, se muestra el formulario de login.
4. El usuario ingresa su **correo electrónico o nombre de usuario** (ej: `trino.b@obras.gob.ve` o `Trino.B`).
5. El usuario ingresa su **contraseña**.
6. Al hacer clic en **"Iniciar sesión"**, el sistema:
   - Muestra el mensaje *"Validando credenciales de Usuario"*.
   - Busca al usuario en la base de datos de superadministradores (búsqueda insensible a mayúsculas/minúsculas).
   - Codifica la contraseña ingresada con `btoa()` y la compara con el `passwordHash` almacenado.
   - **Si las credenciales son correctas**: guarda la sesión en `localStorage` y redirige al dashboard (`index.html`).
   - **Si las credenciales son incorrectas**: muestra el mensaje de error *"Usuario o contraseña incorrectos"* en color rojo.

---

## Interfaz del Dashboard (`index.html`)

El dashboard es la interfaz principal de la aplicación. Está organizado en un layout de dos columnas (sidebar + contenido principal) que se adapta a diferentes tamaños de pantalla.

---

### Barra Lateral de Navegación (Sidebar)

Ubicada a la izquierda en pantallas grandes (o como barra horizontal superior en móviles), contiene:

1. **Encabezado con ícono**: Logo de edificio con el título **"Control de Avance"** y subtítulo *"Obra en curso"*.
2. **Cuatro botones de navegación** que permiten cambiar entre las vistas del dashboard:
   - **Remodelación integral Plaza Las Delicias Caracas** → Vista Dashboard principal.
   - **Pin 1: Notas** → Vista de notas técnicas.
   - **Pin 2: Avance Global** → Vista enfocada del porcentaje global.
   - **Pin 3: Desglose por Capítulos** → Vista con tabla detallada.
3. **Indicador de estado** (solo visible en escritorio): Muestra un punto azul pulsante con el texto *"En ejecución — Estado activo"*.

**Cómo funciona la navegación**:
- Al hacer clic en cualquiera de los 4 botones, se activa la vista correspondiente.
- El botón activo se resalta con un fondo azul brillante con borde luminoso.
- Las barras de progreso y el anillo circular se reinician y se vuelven a animar cada vez que se cambia de vista, creando un efecto visual atractivo.

---

### Encabezado Superior con Logos y Sesión

En la parte superior del contenido principal se muestra:

1. **Tres logos institucionales** en tarjetas con fondo claro y bordes redondeados:
   - Vicepresidencia de Servicios.
   - Consejo Científico (con énfasis visual — tamaño más grande).
   - Obras Públicas.
2. **Información de sesión**:
   - Texto: *"Sesión activa para administración de superadmins"*.
   - Nombre del usuario autenticado (ej: *"Bienvenido, Trino Baloa"*).
   - Botón **"Cerrar sesión"** que limpia la sesión y redirige al login.

---

### Vista Principal: Dashboard

Esta es la vista por defecto al entrar al panel. Contiene las siguientes secciones de arriba a abajo:

#### 1. Encabezado de la Vista
- Etiqueta: **"Panel de control"**.
- Título: **"Remodelación integral Plaza Las Delicias Caracas"**.
- Subtítulo: *"Vista integrada del avance de la obra"*.
- Indicador de fecha actual (se actualiza automáticamente, formato largo en español: ej. *"Martes, 24 de junio de 2026"*).

#### 2. Reproductor de Video de Seguimiento
- Tarjeta con el título **"Video de la obra — Seguimiento Visual — Semana actual"**.
- Reproductor de video HTML5 embebido con:
  - **Controles nativos** del navegador (play, pausa, fullscreen).
  - **Reproducción en bucle** (el video se repite automáticamente al terminar).
  - **Audio silenciado por defecto** para no molestar al abrir la página.
- Controles personalizados debajo del video:
  - Botón **"Activar audio"** / **"Silenciar"** que alterna el mute del video.
  - **Deslizador de volumen** (0% a 100%) con etiqueta numérica que se actualiza en tiempo real.
- Si el video no puede cargarse (ej: en GitHub Pages por límite de tamaño), aparece un **mensaje de fallback** con un enlace para descargarlo directamente.

#### 3. Tarjetas KPI (Indicadores Clave)
Cuatro minitarjetas con efecto glass dispuestas en una cuadrícula:

| Indicador | Valor | Descripción |
|---|---|---|
| **Avance Global** | 60% | Con mini barra de progreso animada |
| **Capítulos** | 7 | Partidas activas |
| **Completados** | 2 | Al 100% |
| **En progreso** | 5 | Parcialmente avanzados |

#### 4. Tarjeta del Anillo de Avance Global
- Gráfico SVG circular (anillo) que se anima al cargar la vista.
- Muestra el **60%** en el centro con tipografía grande.
- El anillo se llena progresivamente con un gradiente de gris a azul cielo.
- Debajo, una etiqueta con punto pulsante: *"En ejecución"*.

#### 5. Gráfico de Progreso por Capítulo
Tarjeta con dos modos de visualización alternable mediante botones:

**Modo Barras** (por defecto):
- Muestra 7 barras de progreso horizontales, una por cada capítulo de obra.
- Cada barra se anima al cargar (crece de 0% a su valor real).
- El color de cada barra varía según el porcentaje:
  - **100%**: Azul cielo brillante (`#7dd3fc`).
  - **70–99%**: Azul medio (`#0ea5e9`).
  - **50–69%**: Azul claro (`#38bdf8`).
  - **40–49%**: Gris medio (`#94a3b8`).
  - **< 40%**: Gris oscuro (`#64748b`).
- Cada barra incluye un resplandor (glow) cuya intensidad aumenta con el progreso.

**Modo Pasteles** (gráfico de donut):
- Gráfico circular SVG tipo donut con segmentos proporcionales al progreso de cada capítulo.
- Centro del donut muestra **"7 capítulos"**.
- Cada segmento aparece con animación secuencial (fade-in uno por uno).
- Leyenda lateral con puntos de color, nombre del capítulo y su porcentaje.

**Cómo cambiar entre modos**:
- Haz clic en el botón **"Barras"** o **"Pasteles"** en la esquina superior derecha de la tarjeta.
- El botón activo se resalta con fondo azul semitransparente.

#### 6. Nota Técnica Lateral
- Tarjeta pequeña con ícono de alerta y etiqueta **"Alerta técnica"**.
- Título: *"Nota — Jardineras"*.
- Contenido: *"Las jardineras fueron diseñadas en función de las raíces de los árboles de la plaza."*.

#### Capítulos de la Obra (datos actuales)

| N.° | Capítulo | Progreso |
|---|---|---|
| 1 | Obras preliminares | 100% |
| 2 | Movimiento de tierra | 100% |
| 3 | Construcción de fundaciones | 70% |
| 4 | Construcción de super estructura | 60% |
| 5 | Instalación eléctrica | 70% |
| 6 | Instalación sanitaria (riego) | 60% |
| 7 | Intervención de exteriores | 40% |

---

### Vista Pin 1: Notas Técnicas

Se activa al hacer clic en **"Pin 1: Notas"** en la barra lateral.

- Encabezado con badge **"Pin 1"**, título **"Notas Técnicas"** y subtítulo *"Aspectos técnicos relevantes de la obra"*.
- Tarjeta grande con efecto glass fuerte y resplandor que contiene:
  - Ícono de documento.
  - Título: **"Diseño de Jardineras"**.
  - Subtítulo: *"Consideración técnica del proyecto"*.
  - Cita destacada con borde izquierdo azul:
    > *"Las jardineras fueron diseñadas en función de las raíces de los árboles de la plaza."*

---

### Vista Pin 2: Avance Global

Se activa al hacer clic en **"Pin 2: Avance Global"** en la barra lateral.

- Tarjeta centrada vertical y horizontalmente en la pantalla, con efecto glass fuerte, gradiente sutil y resplandor.
- Badge **"Pin 2"** en la parte superior.
- Etiqueta: *"Avance Global de la Obra"*.
- **Cifra gigante: 60%** con gradiente de texto de azul cielo a gris.
- Barra de progreso horizontal gruesa animada que se llena hasta el 60%.
- Nota al pie: *"Actualizado al estado actual del proyecto"*.

---

### Vista Pin 3: Desglose por Capítulos

Se activa al hacer clic en **"Pin 3: Desglose por Capítulos"** en la barra lateral.

- Encabezado con badge **"Pin 3"**, título **"Desglose por Capítulos"** y subtítulo *"Detalle del progreso de cada partida"*.
- **En pantallas medianas y grandes (≥640px)**: se muestra una **tabla HTML** con tres columnas:
  - **Capítulo**: Número (en badge cuadrado) y nombre.
  - **Progreso**: Barra de progreso animada con colores dinámicos.
  - **%**: Badge redondeado con el porcentaje, cuyo color varía según el progreso.
- **En pantallas pequeñas (<640px)**: la tabla se oculta y se muestra una **lista de tarjetas** apiladas verticalmente, con la misma información en formato compacto.

---

## Sistema de Autenticación

La autenticación se gestiona completamente en el lado del cliente (navegador) mediante el archivo `js/auth.js`.

### Flujo de Inicio de Sesión

1. El usuario accede a `login.html`.
2. `auth.js` detecta que el `<body>` tiene la clase `login-page`.
3. Se verifica si existe una sesión previa en `localStorage` (clave `obras_dashboard_session`).
4. Si ya hay sesión → redirige automáticamente a `index.html`.
5. Si no hay sesión → se muestra el formulario.
6. Al enviar el formulario:
   - Se obtiene el valor de los campos `email` y `password`.
   - Se llama a `SuperadminsDB.validateCredentials(credential, password)`.
   - Si la validación es exitosa, se guarda la sesión con `email`, `nombre`, `rol` y `loggedAt`.
   - Se redirige a `index.html`.

### Protección del Dashboard

Cuando se carga `index.html`:
1. `auth.js` detecta que **no** tiene la clase `login-page`.
2. Se ejecuta `protectDashboard()` que verifica la sesión en `localStorage`.
3. Si **no hay sesión** → redirige inmediatamente a `login.html`.
4. Si **hay sesión** → muestra el nombre del usuario y habilita el dashboard.

### Cierre de Sesión

1. El usuario hace clic en el botón **"Cerrar sesión"**.
2. Se elimina la clave `obras_dashboard_session` de `localStorage`.
3. Se redirige a `login.html`.

---

## Gestión de Credenciales

### Archivo Local de Credenciales

El archivo `js/data/superadmins.local.js` permite definir los usuarios **fuera del control de versiones**:

- Este archivo está incluido en `.gitignore` y **no se sube al repositorio**.
- Define la variable global `window.LOCAL_SUPERADMINS` con un array de objetos de administrador.
- Cada objeto contiene: `id`, `nombre`, `username`, `email`, `rol` y `passwordHash`.
- El `passwordHash` es la contraseña codificada en Base64 (ej: `btoa('MiContraseña123')` → `'TWlDb250cmFzZcOxYTEyMw=='`).

### Base de Datos de Superadministradores

El módulo `js/data/superadmins.js` expone el objeto global `window.SuperadminsDB` con los siguientes métodos:

| Método | Descripción |
|---|---|
| `getAll()` | Devuelve la lista completa de administradores desde `localStorage`, o los valores por defecto si no existen. |
| `findByCredential(credential)` | Busca un administrador por `email` o `username` (insensible a mayúsculas). |
| `validateCredentials(credential, password)` | Busca al administrador y compara el hash de la contraseña ingresada con el almacenado. Devuelve el objeto admin si es válido, o `null`. |
| `saveAdmins(admins)` | Guarda la lista de administradores en `localStorage` bajo la clave `obras_dashboard_superadmins`. |
| `hash(value)` | Codifica un valor en Base64 usando `btoa()`. |

**Orden de carga de los scripts** (importante):
```html
<!-- En index.html -->
<script src="js/data/superadmins.local.js"></script>  <!-- 1.º Define window.LOCAL_SUPERADMINS -->
<script src="js/data/superadmins.js"></script>          <!-- 2.º Lee LOCAL_SUPERADMINS si existe -->
<script src="js/auth.js"></script>                      <!-- 3.º Gestiona autenticación -->
<script src="js/app.js"></script>                       <!-- 4.º Lógica del dashboard -->
```

---

## Funcionalidades Detalladas

### Gráfico de Barras de Progreso

- **Archivo**: `js/app.js` → función `renderBarras()`.
- Genera dinámicamente las barras de progreso usando los datos del array `capitulos`.
- Cada barra tiene un gradiente lineal que va de gris oscuro a un color punta (azul o gris según el porcentaje).
- Aplica una animación de crecimiento de `width: 0%` al valor real usando una transición CSS con `cubic-bezier`.
- Incluye un resplandor (`box-shadow`) con opacidad proporcional al progreso.

### Gráfico de Pastel (Donut)

- **Archivo**: `js/app.js` → función `renderPasteles()`.
- Genera un gráfico SVG de tipo donut usando cálculos trigonométricos (`polar()` y `arcoDonut()`).
- Cada segmento es un `<path>` SVG calculado con ángulos proporcionales al progreso de cada capítulo.
- Los segmentos aparecen secuencialmente con un retraso de 80ms entre cada uno (animación de entrada).
- Incluye una leyenda con los nombres, colores y porcentajes de cada capítulo.

### Anillo de Avance Global

- **Archivo**: `js/app.js` → función `animarAnillo()`.
- Utiliza un `<circle>` SVG con `stroke-dasharray` y `stroke-dashoffset` para crear el efecto de llenado circular.
- La circunferencia se calcula como `2 × π × 52` (radio = 52).
- La animación es controlada por CSS (`transition: stroke-dashoffset 1.4s cubic-bezier`).
- Se reinicia con `resetAnillo()` cada vez que se cambia de vista.

### Tabla de Desglose por Capítulos

- **Archivo**: `js/app.js` → función `renderTabla()`.
- Genera dos versiones del listado:
  - **Versión escritorio**: Tabla HTML (`<table>`) dentro de `#tabla-capitulos`.
  - **Versión móvil**: Lista de tarjetas dentro de `#lista-capitulos`.
- Cada fila incluye un número badge, el nombre del capítulo, una barra de progreso animada y un badge de porcentaje con color dinámico.

### Reproductor de Video

- **Archivo**: `js/app.js` (líneas 354–403).
- Configuración al cargar:
  - Volumen inicial: **50%**.
  - Audio: **silenciado** por defecto.
- Eventos manejados:
  - `error` y `stalled`: Muestra el mensaje de fallback con enlace de descarga.
  - `loadeddata`: Oculta el mensaje de fallback si el video carga correctamente.
- Controles personalizados:
  - Botón de audio: alterna entre mute y unmute.
  - Deslizador de volumen: ajusta el volumen de 0 a 100% y sincroniza el estado mute.

### Elementos Arrastrables (Drag & Drop)

- **Archivo**: `js/app.js` → funciones `makeDraggable()` y `bindDraggables()`.
- Permite arrastrar libremente por la pantalla los siguientes elementos:
  - Tarjetas de barras de progreso (`.bar-row-card`).
  - Items del gráfico de barras (`.bar-chart-item`).
  - Filas de la tabla (`<tr>`).
  - Tarjetas glass (`.glass`, `.glass-strong`).
  - Tarjeta del anillo de avance global.
  - Tarjeta del Pin 2.
- Implementado con la **Pointer Events API** para compatibilidad con mouse y touch.
- Comportamiento:
  - Cursor cambia a `grab` al posarse y a `grabbing` al arrastrar.
  - Se eleva el `z-index` del elemento al arrastrarlo.
  - No interfiere con botones, links o inputs (estos se excluyen del drag).

### Animaciones y Transiciones

| Animación | Descripción |
|---|---|
| **fadeUp** | Los elementos entran desde abajo con opacidad gradual al cargar la página. Retrasos escalonados (0.1s a 0.5s). |
| **float** | Los orbes del fondo se mueven suavemente en un ciclo infinito de 12 segundos. |
| **Barras de progreso** | Crecen de 0% a su valor con `cubic-bezier(0.4, 0, 0.2, 1)` en 1.2 segundos. |
| **Anillo SVG** | Se llena progresivamente en 1.4 segundos. |
| **Segmentos de pastel** | Aparecen secuencialmente con fade-in de 0.4 segundos cada uno. |
| **Hover en barras** | Desplazamiento sutil horizontal (3px) al pasar el mouse. |
| **Punto de estado** | Pulso infinito (`animate-pulse`) del indicador "En ejecución". |

---

## Diseño Visual y Estética

El dashboard utiliza una estética **dark mode premium** con las siguientes características:

- **Paleta de colores**: Tonos `slate` (grises azulados) para fondos y texto secundario, tonos `sky` (azules cielo) para acentos, bordes luminosos y elementos activos.
- **Glassmorphism**: Tarjetas semitransparentes con `backdrop-filter: blur()` que crean un efecto de vidrio esmerilado sobre el fondo animado.
- **Fondo animado**: Tres orbes difuminadas que flotan suavemente, creando una malla de color dinámica.
- **Tipografía**: *Plus Jakarta Sans* de Google Fonts, con pesos de 400 a 800 para crear jerarquía visual clara.
- **Responsividad**: Layout adaptable que cambia de dos columnas (sidebar + contenido) en escritorio a una sola columna apilada en móvil.
- **Scrollbar personalizado**: Barras de scroll delgadas, oscuras y semitransparentes que se integran con el diseño.

---

## Notas de Seguridad

> **⚠️ Importante**: Este proyecto es un prototipo/panel estático. La autenticación se ejecuta en el navegador del cliente y **no es segura para producción**.

- **Base64 no es cifrado**: La codificación `btoa()` es completamente reversible. Cualquier persona con acceso al código fuente o a `localStorage` puede obtener las contraseñas.
- **Sin protección del lado del servidor**: No hay un backend que valide tokens, por lo que cualquier persona puede acceder al `index.html` manipulando `localStorage` directamente.
- **Credenciales visibles en el código fuente**: Aunque el archivo `superadmins.local.js` está en `.gitignore`, las credenciales fallback siguen presentes en `superadmins.js` como respaldo.

---

## Mejoras Recomendadas para el Futuro

1. **Autenticación con servidor**: Migrar la validación de credenciales a una API backend que use hashing seguro (bcrypt, argon2).
2. **Tokens JWT**: Implementar autenticación basada en tokens con expiración.
3. **Proveedor de identidad**: Integrar OAuth2 u OpenID Connect para delegar la autenticación.
4. **Datos dinámicos**: Conectar los datos de avance de obra a una base de datos real (Firestore, PostgreSQL) en lugar de tenerlos hardcodeados en el JavaScript.
5. **Hosting de video**: Mover los archivos de video a un servicio de streaming (YouTube embebido, Vimeo, o un CDN) para evitar problemas de rendimiento.
6. **Variables de entorno**: Usar un sistema de `.env` y un proceso de build para inyectar configuración sensible sin exponerla en el código.

---

*Desarrollado para el Consejo Científico de la Vicepresidencia Sectorial de Obras Públicas y Servicios.*
