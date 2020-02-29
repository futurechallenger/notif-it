import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function query(sql: string, values?: any[]): Promise<any | null> {
  try {
    // const res = await client.query('SELECT * FROM users WHERE id = $1', [1]);
    const res = await pool.query(sql, values || []);
    console.log(res.rows[0]);
    return res;
  } catch (e) {
    console.error('ERROR', e);
  }

  return null;
}
