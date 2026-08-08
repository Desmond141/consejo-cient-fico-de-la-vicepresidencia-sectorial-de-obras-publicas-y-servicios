const { Pool } = require('pg');

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
const hasHostConfig = process.env.PGHOST && process.env.PGUSER && process.env.PGPASSWORD && process.env.PGDATABASE;

if (!connectionString && !hasHostConfig) {
  throw new Error('No se ha configurado la conexión a la base de datos. Configure POSTGRES_URL o DATABASE_URL, o PGHOST/PGUSER/PGPASSWORD/PGDATABASE.');
}

const poolConfig = {
  ssl: {
    rejectUnauthorized: false
  }
};

if (connectionString) {
  poolConfig.connectionString = connectionString;
} else {
  poolConfig.host = process.env.PGHOST;
  poolConfig.user = process.env.PGUSER;
  poolConfig.password = process.env.PGPASSWORD;
  poolConfig.database = process.env.PGDATABASE;
  if (process.env.PGPORT) poolConfig.port = Number(process.env.PGPORT);
}

const pool = new Pool(poolConfig);

async function initDB() {
  const client = await pool.connect();
  try {
    console.log('Verificando base de datos...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS capitulos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        progreso INTEGER NOT NULL DEFAULT 0,
        orden INTEGER DEFAULT 0,
        project_id VARCHAR(255) NOT NULL DEFAULT 'project-las-delicias'
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS historial (
        id SERIAL PRIMARY KEY,
        capitulo_id INTEGER REFERENCES capitulos(id) ON DELETE CASCADE,
        fecha TIMESTAMP NOT NULL,
        descripcion TEXT,
        progreso_anterior INTEGER NOT NULL,
        progreso_nuevo INTEGER NOT NULL
      );
    `);

    await client.query(`
      ALTER TABLE capitulos ADD COLUMN IF NOT EXISTS project_id VARCHAR(255) NOT NULL DEFAULT 'project-las-delicias';
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS proyectos (
        id VARCHAR(255) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        descripcion TEXT,
        progreso INTEGER NOT NULL DEFAULT 0,
        estado VARCHAR(100),
        creado_por VARCHAR(255),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        codigo VARCHAR(50)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS usuarios (
        id VARCHAR(255) PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        rol VARCHAR(100),
        password_hash TEXT,
        proyecto_id VARCHAR(255),
        proyecto_nombre TEXT,
        proyecto_codigo VARCHAR(50),
        creado_por VARCHAR(255),
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const res = await client.query('SELECT COUNT(*) FROM capitulos');
    if (parseInt(res.rows[0].count) === 0) {
      console.log('Insertando datos por defecto...');
      const defaultCapitulos = [
        { nombre: 'Obras preliminares', progreso: 100 },
        { nombre: 'Movimiento de tierra', progreso: 100 },
        { nombre: 'Construcción de fundaciones', progreso: 70 },
        { nombre: 'Construcción de super estructura', progreso: 60 },
        { nombre: 'Instalación eléctrica', progreso: 70 },
        { nombre: 'Instalación sanitaria (riego)', progreso: 60 },
        { nombre: 'Intervención de exteriores', progreso: 40 },
      ];

      for (let i = 0; i < defaultCapitulos.length; i++) {
        await client.query(
          'INSERT INTO capitulos (nombre, progreso, orden) VALUES ($1, $2, $3)',
          [defaultCapitulos[i].nombre, defaultCapitulos[i].progreso, i]
        );
      }
    }

    const projectsCount = await client.query('SELECT COUNT(*) FROM proyectos');
    if (parseInt(projectsCount.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO proyectos (id, nombre, descripcion, progreso, estado, creado_por, creado_en, codigo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `, [
        'project-las-delicias',
        'Remodelación integral Plaza Las Delicias Caracas',
        'Proyecto principal de seguimiento del avance de obra.',
        60,
        'En ejecución',
        'Sistema',
        new Date().toISOString(),
        'DEL-1000'
      ]);
    }

    console.log('Base de datos inicializada con éxito.');
  } catch (err) {
    console.error('Error inicializando base de datos:', err);
    throw err;
  } finally {
    client.release();
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDB
};
