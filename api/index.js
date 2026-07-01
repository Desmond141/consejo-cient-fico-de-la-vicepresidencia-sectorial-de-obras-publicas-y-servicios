const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Middleware para inicializar DB de forma lazy (solo la primera vez)
let dbInitialized = false;
let dbInitPromise = null;

app.use(async (req, res, next) => {
  if (!dbInitialized) {
    if (!dbInitPromise) {
      dbInitPromise = db.initDB()
        .then(() => { dbInitialized = true; })
        .catch(err => console.error('Error inicializando BD:', err));
    }
    await dbInitPromise;
  }
  next();
});

// --- API ROUTES ---
const router = express.Router();

// GET: Prueba de conexión
router.get('/test', (req, res) => {
  res.json({ 
    status: 'ok', 
    dbInitialized,
    hasPostgresUrl: !!process.env.POSTGRES_URL,
    hasDatabaseUrl: !!process.env.DATABASE_URL
  });
});

// GET: Obtener todos los capítulos con su historial
router.get('/capitulos', async (req, res) => {
  try {
    const capsResult = await db.query('SELECT * FROM capitulos ORDER BY orden ASC');
    const histResult = await db.query('SELECT * FROM historial ORDER BY fecha DESC');
    
    // Anidar historial dentro de capítulos
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
  const { nombre, progreso, historial } = req.body;
  
  try {
    // Obtener max orden
    const maxOrdenRes = await db.query('SELECT MAX(orden) FROM capitulos');
    const nextOrden = (maxOrdenRes.rows[0].max !== null ? parseInt(maxOrdenRes.rows[0].max) : -1) + 1;

    const newCap = await db.query(
      'INSERT INTO capitulos (nombre, progreso, orden) VALUES ($1, $2, $3) RETURNING *',
      [nombre, progreso, nextOrden]
    );
    
    const capId = newCap.rows[0].id;
    
    // Si viene con historial (creación inicial)
    if (historial && historial.length > 0) {
      const h = historial[0];
      await db.query(
        'INSERT INTO historial (capitulo_id, fecha, descripcion, progreso_anterior, progreso_nuevo) VALUES ($1, $2, $3, $4, $5)',
        [capId, h.fecha, h.descripcion, h.progresoAnterior, h.progresoNuevo]
      );
    }
    
    res.json({ success: true, id: capId });
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

// Vercel maneja el frontend, así que quitamos el fallback manual de index.html

// Montar router en diferentes prefijos por si Vercel altera el req.url
app.use('/api', router);
app.use('/', router);

module.exports = app;
