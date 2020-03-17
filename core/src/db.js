"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const dotenv = require("dotenv");
const moment = require("moment");
dotenv.config();
let pool = process.env.NODE_ENV === 'development'
    ? new pg_1.Pool({
        connectionString: 'postgresql://postgres@localhost:5432/notification-app',
    })
    : new pg_1.Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    });
console.log('DB running');
pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
async function query(sql, values) {
    if (!values || !Array.isArray(values)) {
        throw new Error('Invalid values for db');
    }
    try {
        let ret;
        if (!values) {
            ret = await pool.query(sql);
        }
        else {
            ret = await pool.query(sql, values);
        }
        console.log('==>Query: ', ret.rows[0]);
        return ret;
    }
    catch (e) {
        console.error('ERROR', e);
        return undefined;
    }
}
exports.query = query;
async function getTeamToken(teamId) {
    const ret = await query('select tk from team where teamId=$1', [teamId]);
    console.log('GET TOKEN ret: ', ret);
    return ret.rowCount > 0 ? ret.rows[0] : null;
}
exports.getTeamToken = getTeamToken;
async function getTokenByRID(rid) {
    const ret = await query('select tk from team where id=$1', [rid]);
    console.log('GET TOKEN ret: ', ret);
    return ret.rowCount > 0 ? ret.rows[0] : null;
}
exports.getTokenByRID = getTokenByRID;
async function getTeamHook(teamId) {
    const ret = await query('select hook from team where teamId=$1', [teamId]);
    console.log('get team hook', ret);
    return ret.rowCount > 0 ? ret.rows[0] : null;
}
exports.getTeamHook = getTeamHook;
async function getHookByRID(rid) {
    const ret = await query('select hook from team where id=$1', [rid]);
    console.log('==>get the hook result: ', ret);
    return ret.rowCount > 0 ? ret.rows[0] : null;
}
exports.getHookByRID = getHookByRID;
async function setTeamHook(teamId, hook) {
    const ret = await query('update team set hook=$1 where teamId=$2', [
        hook,
        teamId,
    ]);
    return ret.rowCount > 0;
}
exports.setTeamHook = setTeamHook;
async function storeToken(teamId, token) {
    const client = await pool.connect();
    try {
        const ret = await client.query('select id from team where teamId=$1', [
            teamId,
        ]);
        let opRet;
        // Update
        if (ret.rowCount > 0) {
            opRet = await client.query(`update team set tk=$1, updatedAt=$2 where teamId='${teamId}'`, [token, +moment.utc().format('X')]);
        }
        else {
            // Insert
            opRet = await client.query('insert into team (teamId, tk, createdAt) values ($1, $2, $3)', [teamId, token, +moment.utc().format('X')]);
        }
        return opRet.rowCount;
    }
    catch (e) {
        console.error('OP ERROR', e);
    }
    finally {
        client.release();
    }
    return -1;
}
exports.storeToken = storeToken;
async function storeTokenByID(webhook, token, id) {
    const client = await pool.connect();
    try {
        let opRet;
        if (!id) {
            // Insert
            opRet = await client.query('insert into team (hook, tk , createdAt) values ($1, $2, $3) returning id', [webhook, token, +moment.utc().format('X')]);
            return opRet.rowCount > 0 ? opRet.rows[0] : null;
        }
        else {
            if (!token) {
                opRet = await client.query(`update team set hook=$1, updatedAt=$2  where id=${id}`, [webhook, +moment.utc().format('X')]);
            }
            else {
                opRet = await client.query(`update team set tk=$1, updatedAt=$2  where id='${id}`, [token, +moment.utc().format('X')]);
            }
            return opRet.rowCount > 0 ? { id } : null;
        }
    }
    catch (e) {
        console.error('OP ERROR', e);
    }
    finally {
        client.release();
    }
    return null;
}
exports.storeTokenByID = storeTokenByID;
async function storeEnvets(teamId, events) {
    const ret = await query('update team set events=$1, updatedAt=$2 where teamId=$3', [events.join(','), +moment.utc().format('X'), teamId]);
    return ret.rowCount;
}
exports.storeEnvets = storeEnvets;
async function storeEnvetsByRID(rid, events) {
    const ret = await query('update team set events=$1, updatedAt=$2 where id=$3 returning id', [events.join(','), +moment.utc().format('X'), rid]);
    return !ret ? -1 : ret.rowCount;
}
exports.storeEnvetsByRID = storeEnvetsByRID;
async function getTeamEvents(teamId) {
    const ret = await query('select events from team where teamId=$1', [teamId]);
    if (ret.rowCount > 0) {
        return ret.rows[0];
    }
    return null;
}
exports.getTeamEvents = getTeamEvents;
async function getEventsByRID(rid) {
    const ret = await query('select events from team where id=$1', [rid]);
    if (ret.rowCount > 0) {
        return ret.rows[0];
    }
    return null;
}
exports.getEventsByRID = getEventsByRID;
async function getEventsHookByRID(rid) {
    try {
        const ret = await query('select events, hook from team where id=$1', [rid]);
        return ret.rowCount > 0 ? ret.rows[0] : null;
    }
    catch (e) {
        console.error('ERROR in getting events and hook', e);
        return null;
    }
}
exports.getEventsHookByRID = getEventsHookByRID;
//# sourceMappingURL=db.js.map