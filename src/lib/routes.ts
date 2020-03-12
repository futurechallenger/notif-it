import { Config } from '@lib/config';
import Axios from 'axios';
import * as dotenv from 'dotenv';
import * as Express from 'express';
import * as jwt from 'jsonwebtoken';
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

let context: Context;

function configRouter(
  hookService: HookService,
  eventHandler: EventService,
  messageService: MessageService,
  authConfig: OAuthConfig,
): Express.Router {
  const router = Express.Router();

  const config = new Config();
  const authUrl = config.getOAuth2URL(authConfig);

  router.get('/', (_: Request, res: Response) => {
    res.render('index');
  });

  router.get('/auth', async (_: Request, res: Response) => {
    // TODO: Generate auth url corresponding to the service
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

      context = {
        rid: `${rid}`,
        token: ret.tk,
        serviceURL: authConfig.serviceURL,
      };

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
    res.redirect('/success.html');
  });

  router.post('/callback', async (req: Request, res: Response) => {
    try {
      const { t, webhook } = req.body;
      // const { t, teamId, apptype: service } = req.body;
      const { rid = null } = req.decoded;

      console.log('===>/callback, REQ BODY', req.body);
      console.log(`===>/callback, webhook: ${webhook}, `);

      const ret = await storeTokenByID(webhook, t, rid);
      if (!ret) {
        throw new Error('DB error to keep tk');
      }

      context = {
        rid: `${rid}`,
        token: t,
        serviceURL: authConfig.serviceURL,
      };

      // TODO: We dont have to sign every call of this api
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

      const tokenRet = await getTokenByRID(+rid);
      const token = get(tokenRet, 'tk', null);
      if (!token) {
        throw new Error('Cannot get token for team');
      }

      console.log('===>Events context: ', context);
      const boards = await eventHandler.getAllEvents(context);

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

      context.currentEvents = events;
      console.log('===>Context ', context);
      const parsedEvents: EventHook[] = await eventHandler.parseHooks(context);
      console.log('==>Parsed events', parsedEvents);

      await hookService.setHooksForEvents(parsedEvents, context);

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
    const { service, rid } = req.params;
    console.log(
      `===>HOOK BODY of service: ${service} team: ${rid}`,
      JSON.stringify(req.body),
    );

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
      const hookNormalized = messageService.parseEvent(eventsRet, context);

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
