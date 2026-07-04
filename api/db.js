const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.POSTGRES_URL || process.env.DATABASE_URL,
  host: process.env.PGHOST,
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  ssl: {
    rejectUnauthorized: false
  }
});

async function initDB() {
  const client = await pool.connect();
  try {
    console.log('Verificando base de datos...');
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS capitulos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        progreso INTEGER NOT NULL DEFAULT 0,
        orden INTEGER DEFAULT 0
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

    // Comprobar si hay datos iniciales
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
    
    console.log('Base de datos inicializada con éxito.');
  } catch (err) {
    console.error('Error inicializando base de datos:', err);
  } finally {
    client.release();
  }
}

module.exports = {
  query: (text, params) => pool.query(text, params),
  initDB
};
