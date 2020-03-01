import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

let pool =
  process.env.NODE_ENV === 'development'
    ? new Pool({
        connectionString:
          'postgresql://postgres@localhost:5432/notification-app',
      })
    : new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
      });

console.log('DB running');

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function query(sql: string, values?: any[]): Promise<any | null> {
  try {
    // const res = await client.query('SELECT * FROM users WHERE id = $1', [1]);
    let ret;
    if (!values) {
      ret = await pool.query(sql);
    } else {
      ret = await pool.query(sql, values || []);
    }
    console.log(ret.rows[0]);
    return ret.rows[0];
  } catch (e) {
    console.error('ERROR', e);
  }

  return null;
}

export { query };
