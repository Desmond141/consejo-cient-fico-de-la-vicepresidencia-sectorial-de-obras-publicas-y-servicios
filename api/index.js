const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// Middleware para inicializar DB de forma lazy (solo la primera vez)
let dbInitialized = false;
let dbInitPromise = null;

app.use(async (req, res, next) => {
  if (!dbInitialized) {
    if (!dbInitPromise) {
      dbInitPromise = db.initDB().then(() => { dbInitialized = true; });
    }
    try {
      await dbInitPromise;
      next();
    } catch (err) {
      console.error('Error inicializando BD:', err);
      return res.status(500).json({ error: 'Error inicializando la base de datos' });
    }
  } else {
    next();
  }
});

// --- API ROUTES ---
const router = express.Router();

function mapProjectRow(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    descripcion: row.descripcion,
    progreso: Number(row.progreso) || 0,
    estado: row.estado,
    creadoPor: row.creado_por,
    creadoEn: row.creado_en,
    codigo: row.codigo
  };
}

function mapUserRow(row) {
  return {
    id: row.id,
    nombre: row.nombre,
    username: row.username,
    email: row.email,
    rol: row.rol,
    passwordHash: row.password_hash,
    proyectoId: row.proyecto_id,
    proyectoNombre: row.proyecto_nombre,
    proyectoCodigo: row.proyecto_codigo,
    creadoPor: row.creado_por,
    creadoEn: row.creado_en
  };
}

// GET: Ruta raíz de API
router.get('/', (req, res) => {
  res.json({
    status: 'ok',
    api: true,
    message: 'API activa. Usa /api/test para verificar la DB, /api/capitulos para los datos.'
  });
});

// GET: Prueba de conexión
router.get('/test', async (req, res) => {
  try {
    if (!dbInitialized) {
      await db.initDB();
      dbInitialized = true;
    }
    const pingResult = await db.query('SELECT 1 AS ok');
    const dbAlive = Array.isArray(pingResult.rows) && pingResult.rows[0] && pingResult.rows[0].ok === 1;

    res.json({
      status: 'ok',
      api: true,
      dbInitialized,
      dbAlive,
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL
    });
  } catch (error) {
    console.error('Error en /api/test:', error);
    res.status(500).json({
      status: 'error',
      message: 'No se pudo conectar con la base de datos',
      hasPostgresUrl: !!process.env.POSTGRES_URL,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      error: error.message
    });
  }
});

// GET: Obtener todos los capítulos con su historial
router.get('/capitulos', async (req, res) => {
  const { projectId } = req.query;
  try {
    const capsResult = await db.query(
      projectId
        ? 'SELECT * FROM capitulos WHERE project_id = $1 ORDER BY orden ASC'
        : 'SELECT * FROM capitulos ORDER BY orden ASC',
      projectId ? [projectId] : []
    );
    const histResult = await db.query('SELECT * FROM historial ORDER BY fecha DESC');

    const capitulos = capsResult.rows.map(cap => {
      const historial = histResult.rows.filter(h => h.capitulo_id === cap.id);
      return { ...cap, historial };
    });

    res.json(capitulos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error del servidor' });
  }
});

// POST: Crear un nuevo capítulo
router.post('/capitulos', async (req, res) => {
  const { nombre, progreso, historial, projectId } = req.body;
  const targetProjectId = projectId || 'project-las-delicias';

  try {
    const maxOrdenRes = await db.query('SELECT MAX(orden) FROM capitulos WHERE project_id = $1', [targetProjectId]);
    const nextOrden = (maxOrdenRes.rows[0].max !== null ? parseInt(maxOrdenRes.rows[0].max) : -1) + 1;

    const newCap = await db.query(
      'INSERT INTO capitulos (nombre, progreso, orden, project_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [nombre, progreso, nextOrden, targetProjectId]
    );

    const capId = newCap.rows[0].id;
    if (historial && historial.length > 0) {
      const h = historial[0];
      await db.query(
        'INSERT INTO historial (capitulo_id, fecha, descripcion, progreso_anterior, progreso_nuevo) VALUES ($1, $2, $3, $4, $5)',
        [capId, h.fecha, h.descripcion, h.progresoAnterior, h.progresoNuevo]
      );
    }

    res.json({ success: true, id: capId, capitulo: newCap.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear capítulo' });
  }
});

// PUT: Actualizar un capítulo y agregar historial
router.put('/capitulos/:id', async (req, res) => {
  const { id } = req.params;
  const { progreso, nuevoHistorial } = req.body;

  try {
    await db.query('UPDATE capitulos SET progreso = $1 WHERE id = $2', [progreso, id]);

    if (nuevoHistorial) {
      await db.query(
        'INSERT INTO historial (capitulo_id, fecha, descripcion, progreso_anterior, progreso_nuevo) VALUES ($1, $2, $3, $4, $5)',
        [id, nuevoHistorial.fecha, nuevoHistorial.descripcion, nuevoHistorial.progresoAnterior, nuevoHistorial.progresoNuevo]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar capítulo' });
  }
});

// DELETE: Eliminar un capítulo
router.delete('/capitulos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await db.query('DELETE FROM capitulos WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar capítulo' });
  }
});

// Proyectos
router.get('/proyectos', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM proyectos ORDER BY creado_en ASC, nombre ASC');
    res.json(result.rows.map(mapProjectRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al leer proyectos' });
  }
});

router.put('/proyectos', async (req, res) => {
  const projects = Array.isArray(req.body) ? req.body : [];

  try {
    await db.query('DELETE FROM proyectos');
    for (const project of projects) {
      await db.query(
        'INSERT INTO proyectos (id, nombre, descripcion, progreso, estado, creado_por, creado_en, codigo) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [
          project.id,
          project.nombre,
          project.descripcion,
          Number(project.progreso) || 0,
          project.estado,
          project.creadoPor,
          project.creadoEn || new Date().toISOString(),
          project.codigo
        ]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar proyectos' });
  }
});

// Usuarios
router.get('/usuarios', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM usuarios ORDER BY creado_en ASC, nombre ASC');
    res.json(result.rows.map(mapUserRow));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al leer usuarios' });
  }
});

router.put('/usuarios', async (req, res) => {
  const users = Array.isArray(req.body) ? req.body : [];

  try {
    await db.query('DELETE FROM usuarios');
    for (const user of users) {
      await db.query(
        'INSERT INTO usuarios (id, nombre, username, email, rol, password_hash, proyecto_id, proyecto_nombre, proyecto_codigo, creado_por, creado_en) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
        [
          user.id,
          user.nombre,
          user.username,
          user.email,
          user.rol,
          user.passwordHash,
          user.proyectoId || '',
          user.proyectoNombre || '',
          user.proyectoCodigo || '',
          user.creadoPor,
          user.creadoEn || new Date().toISOString()
        ]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar usuarios' });
  }
});

router.post('/usuarios', async (req, res) => {
  const user = req.body;
  if (!user || !user.id || !user.email || !user.username) {
    return res.status(400).json({ error: 'Datos de usuario incompletos' });
  }

  try {
    await db.query(
      'INSERT INTO usuarios (id, nombre, username, email, rol, password_hash, proyecto_id, proyecto_nombre, proyecto_codigo, creado_por, creado_en) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)',
      [
        user.id,
        user.nombre,
        user.username,
        user.email,
        user.rol,
        user.passwordHash,
        user.proyectoId || '',
        user.proyectoNombre || '',
        user.proyectoCodigo || '',
        user.creadoPor,
        user.creadoEn || new Date().toISOString()
      ]
    );
    res.json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
});

router.put('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const user = req.body;
  if (!user) {
    return res.status(400).json({ error: 'Datos de usuario incompletos' });
  }

  try {
    await db.query(
      'UPDATE usuarios SET nombre = $1, username = $2, email = $3, rol = $4, password_hash = $5, proyecto_id = $6, proyecto_nombre = $7, proyecto_codigo = $8 WHERE id = $9',
      [
        user.nombre,
        user.username,
        user.email,
        user.rol,
        user.passwordHash,
        user.proyectoId || '',
        user.proyectoNombre || '',
        user.proyectoCodigo || '',
        id
      ]
    );
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
});

router.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM usuarios WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
});

// Montar router en /api para que las peticiones Vercel se resuelvan correctamente.
app.use('/api', router);

module.exports = app;
