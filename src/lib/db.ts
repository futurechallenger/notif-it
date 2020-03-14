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

async function getTokenByRID(rid: number): Promise<any | null> {
  const ret = await query('select tk from team where id=$1', [rid]);
  console.log('GET TOKEN ret: ', ret);
  return ret.rowCount > 0 ? ret.rows[0] : null;
}

async function getTeamHook(teamId: string): Promise<string | null> {
  const ret = await query('select hook from team where teamId=$1', [teamId]);
  console.log('get team hook', ret);
  return ret.rowCount > 0 ? ret.rows[0] : null;
}

async function getHookByRID(rid: number): Promise<any | null> {
  const ret = await query('select hook from team where id=$1', [rid]);
  console.log('==>get the hook result: ', ret);
  return ret.rowCount > 0 ? ret.rows[0] : null;
}

async function setTeamHook(teamId: string, hook: string): Promise<boolean> {
  const ret = await query('update team set hook=$1 where teamId=$2', [
    hook,
    teamId,
  ]);

  return ret.rowCount > 0;
}

async function storeToken(teamId: string, token: string): Promise<number> {
  const client = await pool.connect();
  try {
    const ret = await client.query('select id from team where teamId=$1', [
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

async function storeTokenByID(
  webhook: string,
  token: string,
  id?: number,
): Promise<{ id: number } | null> {
  const client = await pool.connect();
  try {
    let opRet;

    if (!id) {
      // Insert
      opRet = await client.query(
        'insert into team (hook, tk , createdAt) values ($1, $2, $3) returning id',
        [webhook, token, +moment.utc().format('X')],
      );
      return opRet.rowCount > 0 ? opRet.rows[0] : null;
    } else {
      if (!token) {
        opRet = await client.query(
          `update team set hook=$1, updatedAt=$2  where id=${id}`,
          [webhook, +moment.utc().format('X')],
        );
      } else {
        opRet = await client.query(
          `update team set tk=$1, updatedAt=$2  where id='${id}`,
          [token, +moment.utc().format('X')],
        );
      }

      return opRet.rowCount > 0 ? { id } : null;
    }
  } catch (e) {
    console.error('OP ERROR', e);
  } finally {
    client.release();
  }

  return null;
}

async function storeEnvets(teamId: string, events: string[]): Promise<number> {
  const ret = await query(
    'update team set events=$1, updatedAt=$2 where teamId=$3',
    [events.join(','), +moment.utc().format('X'), teamId],
  );

  return ret.rowCount;
}

async function storeEnvetsByRID(
  rid: number,
  events: string[],
): Promise<number> {
  const ret = await query(
    'update team set events=$1, updatedAt=$2 where id=$3',
    [events.join(','), +moment.utc().format('X'), rid],
  );

  return ret.rowCount;
}

async function getTeamEvents(teamId: string): Promise<any | null> {
  const ret = await query('select events from team where teamId=$1', [teamId]);
  if (ret.rowCount > 0) {
    return ret.rows[0];
  }
  return null;
}

async function getEventsByRID(rid: number): Promise<any | null> {
  const ret = await query('select events from team where id=$1', [rid]);
  if (ret.rowCount > 0) {
    return ret.rows[0];
  }
  return null;
}

async function getEventsHookByRID(rid: number): Promise<any | null> {
  try {
    const ret = await query('select events, hook from team where id=$1', [rid]);
    return ret.rowCount > 0 ? ret.rows[0] : null;
  } catch (e) {
    console.error('ERROR in getting events and hook', e);
    return null;
  }
}

export {
  query,
  storeToken,
  storeTokenByID,
  getTeamEvents,
  storeEnvets,
  getTeamToken,
  getTeamHook,
  setTeamHook,
  getEventsByRID,
  getEventsHookByRID,
  getTokenByRID,
  getHookByRID,
  storeEnvetsByRID,
};
