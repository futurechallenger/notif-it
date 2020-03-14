import { Config } from '@lib/config';
import Axios from 'axios';
import * as dotenv from 'dotenv';
import * as Express from 'express';
import * as jwt from 'jsonwebtoken';
import * as qs from 'query-string';
import { get } from 'lodash';
import { EventHook } from '../services/eventService';
import { EventService, HookService, MessageService } from './common';
import {
  getEventsByRID,
  getEventsHookByRID,
  getTokenByRID,
  storeEnvetsByRID,
  storeTokenByID,
} from './db';
import { Context, OAuthConfig, Request, Response } from './types';

dotenv.config();

let context: Context = {};

function configRouter(
  hookService: HookService,
  eventHandler: EventService,
  messageService: MessageService,
  authConfig: OAuthConfig,
): Express.Router {
  console.log('AUTH CONFIG', authConfig);

  const router = Express.Router();
  context.host = authConfig.hostURL;
  context.authType = authConfig.authType;
  context.tokenURL = authConfig.tokenURL;
  context.serviceURL = authConfig.serviceURL;
  context.service = authConfig.service;
  const config = new Config();
  const authUrl = config.getOAuth2URL(authConfig);

  router.get('/', (_: Request, res: Response) => {
    res.render('index');
  });

  router.get('/auth', async (_: Request, res: Response) => {
    // TODO: Generate auth url corresponding to the service
    console.log('==>auth get url: ', authUrl);
    res.redirect(authUrl);
  });

  router.post('/auth', async (req: Request, res: Response) => {
    try {
      if (!req.decoded.rtk) {
        throw new Error('not authed');
      }

      const { rid } = req.decoded;
      const ret = await getTokenByRID(rid);

      if (!ret) {
        throw new Error('No token found');
      }

      res.json({ status: 'OK' });
    } catch (e) {
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
  router.get('/callback', async (req: Request, res: Response) => {
    console.log('==>Callback', req.query);
    // Deal with oauth2.0: code => token
    try {
      if (context.authType === 'oauth2.0') {
        // TODO: state
        const { code } = req.query;
        const ret = await Axios.post(context.tokenURL, {
          client_id: process.env[`${context.service.toUpperCase()}_KEY`],
          client_secret: process.env[`${context.service.toUpperCase()}_SECRET`],
          code,
          redirect_uri: `${context.host}/callback`,
        });
        console.log('get token', ret);
        if (ret.status === 200) {
          const { access_token: token } = qs.parse(ret.data);
          const tk = Array.isArray(token) ? token[0] : token;
          const qRet = await storeTokenByID('', tk);
          const encodedKey = jwt.sign({ rid: qRet.id }, process.env.JWT_SALT);

          res.redirect(`/success.html#rtk=${encodedKey}`);
          return;
        }
      }

      res.redirect(`/success.html`);
    } catch (e) {
      console.error('===>callback error:', e);
      res.redirect('/failed.html');
    }
  });

  router.post('/callback', (req: Request, res: Response) => {
    console.log(req.body);
    // res.json({ status: 'OK' });
    res.redirect('/success.html');
  });

  router.post('/auth/token', async (req: Request, res: Response) => {
    try {
      const { token, webhook } = req.body;
      const { rid = null } = req.decoded;

      console.log('===>/callback, REQ BODY', req.body);
      console.log('===>/callback, decoded', req.decoded);
      console.log(`===>/callback, webhook: ${webhook}, `);

      const ret = await storeTokenByID(webhook, token, rid);
      if (!ret) {
        throw new Error('DB error to keep tk');
      }

      const encodedKey = jwt.sign({ rid: ret.id }, process.env.JWT_SALT);
      res.json({ status: 'OK', rtk: encodedKey });
    } catch (e) {
      console.error('ERROR: ', e);
      res.status(500).json({ message: 'Failed' });
    }
  });

  router.get('/events', async (req: Request, res: Response) => {
    try {
      // const rid = req.params.rid;
      const { rid } = req.decoded;
      console.log('===>events id:', rid);

      const boards = await eventHandler.getAllEvents({ rid, ...context });

      // Get selected from DB
      const selRet = await getEventsByRID(+rid);
      console.log('===>Selected events', selRet);

      res.json({
        boards,
        selected: (selRet.events && selRet.events.split(',')) || '',
      });
    } catch (e) {
      console.error('ERROR: ', e);
      res.status(500).json({ message: 'Failed' });
    }
  });

  router.post('/subscribe', async (req: Request, res: Response) => {
    try {
      const { events } = req.body;
      const { rid } = req.decoded;

      console.log('==>Events', events);
      console.log('==>RID', rid, req.decoded);

      // Store events
      const ret = await storeEnvetsByRID(rid, events);
      if (ret <= 0) {
        throw new Error('DB error in keep events');
      }

      // get token
      console.log('===>events rid:', rid);
      const tokenRet = await getTokenByRID(rid);
      const token = get(tokenRet, 'tk', null);
      if (!token) {
        throw new Error('Cannot get token for team');
      }

      console.log('===>Context ', context);
      const parsedEvents: EventHook[] = await eventHandler.parseHooks({
        rid,
        currentEvents: events,
        ...context,
      });
      console.log('==>Parsed events', parsedEvents);

      await hookService.setHooksForEvents(parsedEvents, { rid, ...context });

      res.json({ status: 'OK' });
    } catch (e) {
      console.error('ERROR: ', e);
      res.status(500).json({ status: 'Failed' });
    }
  });

  // Reponse the head request to satisfy some of the 3rd services
  router.head('/service/hook/:rid', async (req: Request, res: Response) => {
    const rid = req.params.rid;
    console.log(`Webhook req: ${req.url} of team : ${rid}`);
    res.status(200).json({ message: 'OK' });
  });

  router.post('/service/hook/:rid', async (req: Request, res: Response) => {
    const { rid } = req.params;

    console.log(`===>HOOK BODY of rid: ${rid}`, JSON.stringify(req.body));

    // Find hook to send data to
    const hookRet = await getEventsHookByRID(+rid);
    const messageHook = get(hookRet, 'hook', null);
    const events = get(hookRet, 'events', null);
    if (!messageHook) {
      throw new Error('Cannot get platform HOOK to proceed');
    }

    try {
      const eventsRet = req.body;
      console.log('===>Hook context: ', context);
      const hookNormalized = messageService.parseEvent(eventsRet, { events });

      const ret = await Axios.post(messageHook, hookNormalized);

      console.log('===>POST RET', ret);

      res.status(200).json({ status: 'OK' });
    } catch (e) {
      console.error('ERROR: ', e);
      res.status(200).json({ message: e.message });
    }
  });

  return router;
}

export { configRouter };
