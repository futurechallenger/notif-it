import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as moment from 'moment';

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

async function query(sql: string, values?: any[]): Promise<any | undefined> {
  if (!values || !Array.isArray(values)) {
    throw new Error('Invalid values for db');
  }

  try {
    // const res = await client.query('SELECT * FROM users WHERE id = $1', [1]);
    let ret;
    if (!values) {
      ret = await pool.query(sql);
    } else {
      ret = await pool.query(sql, values);
    }
    console.log('==>Query: ', ret.rows[0]);
    return ret;
  } catch (e) {
    console.error('ERROR', e);
    return undefined;
  }
}

async function getTeamToken(teamId: string): Promise<any | null> {
  const ret = await query('select tk from team where teamId=$1', [teamId]);
  console.log('GET TOKEN ret: ', ret);
  return ret.rowCount > 0 ? ret.rows[0] : null;
}

async function getTeamHook(teamId: string): Promise<string | null> {
  const ret = await query('select hook from team where teamId=$1', [teamId]);
  console.log('get team hook', ret);
  return ret.rowCount > 0 ? ret.rows[0] : null;
}

async function storeToken(teamId: string, token: string): Promise<number> {
  const client = await pool.connect();
  try {
    const ret = await client.query('select 1 from team where teamId=$1', [
      teamId,
    ]);

    let opRet;
    // Update
    if (ret.rowCount > 0) {
      opRet = await client.query(
        `update team set tk=$1, updatedAt=$2 where teamId='${teamId}'`,
        [token, +moment.utc().format('X')],
      );
    } else {
      // Insert
      opRet = await client.query(
        'insert into team (teamId, tk, createdAt) values ($1, $2, $3)',
        [teamId, token, +moment.utc().format('X')],
      );
    }

    return opRet.rowCount;
  } catch (e) {
    console.error('OP ERROR', e);
  } finally {
    client.release();
  }

  return -1;
}

async function storeEnvets(teamId: string, events: string[]): Promise<number> {
  const ret = await query(
    'update team set events=$1, updatedAt=$2 where teamId=$3',
    [events.join(','), +moment.utc().format('X'), teamId],
  );

  return ret.rowCount;
}

export { query, storeToken, storeEnvets, getTeamToken, getTeamHook };
