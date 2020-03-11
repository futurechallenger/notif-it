import { Config } from '@lib/config';
import Axios from 'axios';
import * as dotenv from 'dotenv';
import * as Express from 'express';
import * as jwt from 'jsonwebtoken';
import { get } from 'lodash';
import {
  getEventsByRID,
  getEventsHookByRID,
  getTokenByRID,
  storeEnvets,
  storeEnvetsByRID,
  storeTokenByID,
} from './db';
import { HookService } from './services/common';
import { EventHook, parseEventsByRID } from './services/eventService';
import { parseAction } from './services/trelloService';
import { OAuthConfig, Request, Response } from './types';
import { trelloHost } from './util/config';

dotenv.config();

function configRouter(
  hookService: HookService,
  authConfig: OAuthConfig,
): Express.Router {
  const router = Express.Router();

  // const host =
  //   process.env.NODE_ENV === 'development'
  //     ? 'http://localhost:8333'
  //     : process.env.PROJECT_DOMAIN;
  const config = new Config();
  // TODO: Need a place to setup app name
  // const authUrl = config.getOAuth2URL({
  //   serviceURL: process.env.TRELLO_HOST, // TODO: use the auth host by configured service and get the host from env var
  //   scopes: ['read'],
  //   returnURL: `${host}/callback`,
  //   responseType: 'token',
  //   clientId: process.env.TRELLO_KEY, // TODO: according to service of current auth
  //   clientIDAlias: 'key',
  //   name: 'The Awesome Notification App',
  //   expiration: 'never',
  // });
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

      // TODO: We dont have to sign every call of this api
      const encodedKey = jwt.sign({ rid: ret.id }, process.env.JWT_SALT);
      res.json({ status: 'OK', rtk: encodedKey });
    } catch (e) {
      console.error('ERROR: ', e);
      res.status(500).json({ message: 'Failed' });
    }
  });

  // TODO: use cache to reduce db query
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

      // Get user info
      const userInfoURI = `${trelloHost}members/me?key=${process.env.TRELLO_KEY}&token=${token}`;
      let userInfo = await Axios.get(userInfoURI);
      if (userInfo.status !== 200) {
        throw new Error('Get userinfo error');
      }

      // Get boards from 3rd service
      const boardsURI = `${trelloHost}/members/${userInfo.data.username}/boards?key=${process.env.TRELLO_KEY}&token=${token}&filter=open&fields=id,name,desc`;
      const boardsInfo = await Axios.get(boardsURI);
      if (boardsInfo.status !== 200) {
        throw new Error('Get boards error');
      }

      // Get selected from DB
      const selRet = await getEventsByRID(+rid);
      console.log('===>Selected events', selRet);

      // TODO: get selected boards for updating
      res.json({
        boards: boardsInfo.data,
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

      //TODO: Set / update hook
      // 1. get parsed events
      const parsedEvents: EventHook[] = await parseEventsByRID(rid, events);
      console.log('==>Parsed events', parsedEvents);

      // NOTE: if too many events are subscribed, there might be a rate limit problem.
      // const service: HookService = new HookTrello();
      await hookService.setHooksForEvents(parsedEvents, rid, token);

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

  // TODO: /{process.env.SERVICE_NAME}/hook/{teamId}. Use this
  // path to handle hooks from 3rd party services
  // TODO: Need a queue to deal with this.
  // Message translation
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
      const hookNormalized = parseAction(eventsRet, events);

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
