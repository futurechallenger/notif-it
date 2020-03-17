"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const axios_1 = require("axios");
const dotenv = require("dotenv");
const Express = require("express");
const jwt = require("jsonwebtoken");
const qs = require("query-string");
const lodash_1 = require("lodash");
const db_1 = require("./db");
dotenv.config();
let context = {};
function configRouter(hookService, eventHandler, messageService, authConfig) {
    console.log('AUTH CONFIG', authConfig);
    const router = Express.Router();
    context.host = authConfig.hostURL;
    context.authType = authConfig.authType;
    context.tokenURL = authConfig.tokenURL;
    context.serviceURL = authConfig.serviceURL;
    context.service = authConfig.service;
    const config = new config_1.Config();
    const authUrl = config.getOAuth2URL(authConfig);
    router.get('/', (_, res) => {
        res.render('index');
    });
    router.get('/auth', async (_, res) => {
        // TODO: Generate auth url corresponding to the service
        console.log('==>auth get url: ', authUrl);
        res.redirect(authUrl);
    });
    router.post('/auth', async (req, res) => {
        try {
            if (!req.decoded.rtk) {
                throw new Error('not authed');
            }
            const { rid } = req.decoded;
            const ret = await db_1.getTokenByRID(rid);
            if (!ret) {
                throw new Error('No token found');
            }
            res.json({ status: 'OK' });
        }
        catch (e) {
            const message = e.message;
            if (message === 'not authed') {
                res.status(403).json({ status: 'not_authed' });
                return;
            }
            if (message === 'No token found') {
                res.status(401).json({ status: 'not_authed' });
                return;
            }
            console.error('===>post auth error', e);
            res.status(500).json({ staus: 'failed', message: 'something wrong' });
        }
    });
    // Auth callback url
    router.get('/callback', async (req, res) => {
        console.log('==>Callback', req.query);
        // Deal with oauth2.0: code => token
        try {
            if (context.authType === 'oauth2.0') {
                // TODO: state
                const { code } = req.query;
                const ret = await axios_1.default.post(context.tokenURL, {
                    client_id: process.env[`${context.service.toUpperCase()}_KEY`],
                    client_secret: process.env[`${context.service.toUpperCase()}_SECRET`],
                    code,
                    redirect_uri: `${context.host}/callback`,
                });
                console.log('get token', ret);
                if (ret.status === 200) {
                    const { access_token: token } = qs.parse(ret.data);
                    const tk = Array.isArray(token) ? token[0] : token;
                    const qRet = await db_1.storeTokenByID('', tk);
                    const encodedKey = jwt.sign({ rid: qRet.id }, process.env.JWT_SALT);
                    res.redirect(`/success.html#rtk=${encodedKey}`);
                    return;
                }
            }
            res.redirect(`/success.html`);
        }
        catch (e) {
            console.error('===>callback error:', e);
            res.redirect('/failed.html');
        }
    });
    router.post('/callback', (req, res) => {
        console.log(req.body);
        // res.json({ status: 'OK' });
        res.redirect('/success.html');
    });
    router.post('/auth/token', async (req, res) => {
        try {
            const { token, webhook } = req.body;
            const { rid = null } = req.decoded;
            console.log('===>/callback, REQ BODY', req.body);
            console.log('===>/callback, decoded', req.decoded);
            console.log(`===>/callback, webhook: ${webhook}, `);
            const ret = await db_1.storeTokenByID(webhook, token, rid);
            if (!ret) {
                throw new Error('DB error to keep tk');
            }
            const encodedKey = jwt.sign({ rid: ret.id }, process.env.JWT_SALT);
            res.json({ status: 'OK', rtk: encodedKey });
        }
        catch (e) {
            console.error('ERROR: ', e);
            res.status(500).json({ message: 'Failed' });
        }
    });
    router.get('/events', async (req, res) => {
        try {
            // const rid = req.params.rid;
            const { rid } = req.decoded;
            console.log('===>events id:', rid);
            const boards = await eventHandler.getAllEvents({ rid, ...context });
            // Get selected from DB
            const selRet = await db_1.getEventsByRID(+rid);
            console.log('===>Selected events', selRet);
            res.json({
                boards,
                selected: (selRet.events && selRet.events.split(',')) || '',
            });
        }
        catch (e) {
            console.error('ERROR: ', e);
            res.status(500).json({ message: 'Failed' });
        }
    });
    router.post('/subscribe', async (req, res) => {
        try {
            const { events } = req.body;
            const { rid } = req.decoded;
            console.log('==>Events', events);
            console.log('==>RID', rid, req.decoded);
            // Store events
            const ret = await db_1.storeEnvetsByRID(rid, events);
            if (ret < 0) {
                throw new Error('DB error in keep events');
            }
            // get token
            console.log('===>events rid:', rid);
            const tokenRet = await db_1.getTokenByRID(rid);
            const token = lodash_1.get(tokenRet, 'tk', null);
            if (!token) {
                throw new Error('Cannot get token for team');
            }
            console.log('===>Context ', context);
            const parsedEvents = await eventHandler.parseHooks({
                rid,
                token,
                currentEvents: events,
                ...context,
            });
            console.log('==>Parsed events', parsedEvents);
            await hookService.setHooksForEvents(parsedEvents, { rid, ...context });
            res.json({ status: 'OK' });
        }
        catch (e) {
            console.error('ERROR: ', e);
            res.status(500).json({ status: 'Failed' });
        }
    });
    // Reponse the head request to satisfy some of the 3rd services
    router.head('/service/hook/:rid', async (req, res) => {
        const rid = req.params.rid;
        console.log(`Webhook req: ${req.url} of team : ${rid}`);
        res.status(200).json({ message: 'OK' });
    });
    router.post('/service/hook/:rid', async (req, res) => {
        const { rid } = req.params;
        console.log(`===>HOOK BODY of rid: ${rid}`, JSON.stringify(req.body));
        // Find hook to send data to
        const hookRet = await db_1.getEventsHookByRID(+rid);
        const messageHook = lodash_1.get(hookRet, 'hook', null);
        const events = lodash_1.get(hookRet, 'events', null);
        if (!messageHook) {
            throw new Error('Cannot get platform HOOK to proceed');
        }
        try {
            const eventsRet = req.body;
            console.log('===>Hook context: ', context);
            const hookNormalized = messageService.parseEvent(eventsRet, { events });
            const ret = await axios_1.default.post(messageHook, hookNormalized);
            console.log('===>POST RET', ret);
            res.status(200).json({ status: 'OK' });
        }
        catch (e) {
            console.error('ERROR: ', e);
            res.status(200).json({ message: e.message });
        }
    });
    return router;
}
exports.configRouter = configRouter;
//# sourceMappingURL=routes.js.map