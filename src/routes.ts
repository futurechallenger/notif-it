import { Config } from '@lib/config';
import Axios from 'axios';
import * as dotenv from 'dotenv';
import * as Express from 'express';
import * as jwt from 'jsonwebtoken';
import { get } from 'lodash';
import {
  getTeamEvents,
  getTeamHook,
  getTeamToken,
  storeEnvets,
  storeTokenByID,
  getTokenByRid,
} from './db';
import { EventHook, parseEvents } from './services/eventService';
import { parseAction } from './services/trelloService';
import { trelloHost } from './util/config';

import { Request, Response } from './types';

dotenv.config();

const router = Express.Router();

const host =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8333'
    : process.env.PROJECT_DOMAIN;
// const authUrl = `${trelloHost}authorize?expiration=${expiration}&name=${appName}&scope=${scope}&response_type=token&key=${process.env.TRELLO_KEY}&return_url=${host}/callback`;
const config = new Config();
const authUrl = config.getOAuth2URL({
  serviceURL: `${trelloHost}authorize`,
  scopes: ['read'],
  returnURL: `${host}/callback`,
  responseType: 'token',
  clientId: process.env.TRELLO_KEY, // TODO: according to service of current auth
  clientIDAlias: 'key',
  name: process.env.APP_NAME || 'My App',
  expiration: 'never',
});

router.get('/', (_: Request, res: Response) => {
  res.render('index');
});

router.get('/auth', async (_: Request, res: Response) => {
  // TODO: get service and team Id maybe, service is a must
  // TODO: Generate auth url corresponding to the service
  res.redirect(authUrl);
});

router.post('/auth', async (req: Request, res: Response) => {
  try {
    if (!req.decoded.rtk) {
      throw new Error('not authed');
    }

    const { rid, teamId } = req.decoded;
    // TODO: if `tk` exists, this team is authed. No need to do the 3rd-service auth again
    const ret = await getTokenByRid(rid);

    if (!ret) {
      throw new Error('No token found');
    }
    res.json({ status: 'OK' });
  } catch (e) {
    const message = e.message;
    if (message === 'not authed') {
      res.status(403).json({ status: 'not authed' });
      return;
    }
    if (message === 'No token found') {
      res.status(401).json({ status: 'not authed' });
      return;
    }

    console.error('===>post auth error', e);
    res.status(500).json({ teamId: null });
  }
});

// Auth callback url
router.get('/callback', async (req: Request, res: Response) => {
  console.log('==>Callback', req.query);
  res.redirect('/success.html');
});

router.post('/callback', async (req: Request, res: Response) => {
  try {
    const { t, teamId, sn: service } = req.body;
    const { rid = null, teamId: payloadTeamId = null } = req.decoded;

    console.log(
      `===>/callback, TeamID ${teamId}, payload teamId ${payloadTeamId}`,
    );

    const ret = await storeTokenByID(payloadTeamId, t, service, rid);
    if (!ret) {
      throw new Error('DB error to keep tk');
    }

    // TODO: We dont have to sign every call of this api
    const encodedKey = jwt.sign({ rid: ret, teamId }, process.env.JWT_SALT);
    res.json({ status: 'OK', rtk: encodedKey });
  } catch (e) {
    console.error('ERROR: ', e);
    res.status(500).json({ message: 'Failed' });
  }
});

//TODO: Auth callback url
// router.get(
//   '/callback/:service/:teamId',
//   async (req: Request, res: Response) => {
//     console.log('==>Callback', req.query);
//     res.redirect('/success.html');
//   },
// );

// router.post('/callback/:service', async (req: Request, res: Response) => {
//   try {
//     const { t, teamId, service } = req.body;

//     const ret = await storeToken(teamId, t);
//     if (ret <= 0) {
//       throw new Error('DB error to keep tk');
//     }

//     res.json({ status: 'OK' });
//   } catch (e) {
//     console.error('ERROR: ', e);
//     res.status(500).json({ message: 'Failed' });
//   }
// });

// TODO: udpate boards
// TODO: use cache to reduce db query
router.get('/events/:teamId', async (req: Request, res: Response) => {
  try {
    const teamId = req.param('teamId');
    console.log('===>events team id:', teamId);
    const tokenRet = await getTeamToken(teamId);
    const token = get(tokenRet, ['tk'], null);
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
    const selRet = await getTeamEvents(teamId);
    console.log('===>Selected events', selRet);

    // TODO: get selected boards for updating

    res.json({
      boards: boardsInfo.data,
      selected: selRet.events.split(','),
    });
  } catch (e) {
    console.error('ERROR: ', e);
    res.status(500).json({ message: 'Failed' });
  }
});

router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { teamId, events } = req.body;
    console.log('==>Events', events);

    // Store events
    const ret = await storeEnvets(teamId, events);
    if (ret <= 0) {
      throw new Error('DB error in keep events');
    }

    // get token
    console.log('===>events team id:', teamId);
    const tokenRet = await getTeamToken(teamId);
    const token = get(tokenRet, ['tk'], null);
    if (!token) {
      throw new Error('Cannot get token for team');
    }

    //TODO: Set / update hook
    // 1. get parsed events
    const parsedEvents: EventHook[] = await parseEvents(teamId, events);
    console.log('==>Parsed events', parsedEvents);

    let promises = [];
    if (parsedEvents && parsedEvents.length > 0) {
      promises = parsedEvents.map(
        async ({ eventId, hookId, action }: EventHook) => {
          let url;
          if (action === 'post') {
            url = `${trelloHost}webhooks/?idModel=${eventId}&description="My Webhook"&callbackURL=${process.env.PROJECT_DOMAIN}/trello/hook/${teamId}&key=${process.env.TRELLO_KEY}&token=${token}`;
          } else if (action === 'delete') {
            url = `${trelloHost}webhooks/${hookId}?key=${process.env.TRELLO_KEY}&token=${token}`;
          } else {
            //TODO: No need to put for the same team
            // url = `${trelloHost}webhooks/${hookId}?description="My Webhook"&key=${process.env.TRELLO_KEY}&token=${token}`;
          }
          const ret = await Axios({
            method: action,
            url,
          });

          console.log('===>request url: ', url);
          console.log('===>axios ret', ret);
        },
      );
      const ret = await Promise.all(promises);
      console.log('===>Set hook ret: ', ret);
    }

    res.json({ status: 'OK' });
  } catch (e) {
    console.error('ERROR: ', e);
    res.status(500).json({ status: 'Failed' });
  }
});

if (process.env.NODE_ENV === 'development') {
  router.get('/query', async (req: Request, res: Response) => {
    const ret = await storeEnvets(req.query.teamId, req.query.events);
    res.json(ret);
  });

  router.post('/query', async (req: Request, res: Response) => {
    const { teamId, events } = req.body;
    const ret = await storeEnvets(teamId, events);
    res.json(ret);
  });
}

router.head('/trello/hook/:teamId', async (req: Request, res: Response) => {
  const teamId = req.params.teamId;
  console.log(`Webhook req: ${req.url} of team : ${teamId}`);
  res.status(200).json({ message: 'OK' });
});

router.post('/trello/hook/:teamId', async (req: Request, res: Response) => {
  const teamId = req.params.teamId;
  console.log(`===>HOOK BODY of team: ${teamId}`, JSON.stringify(req.body));

  // Find hook to send data to
  const hookRet = await getTeamHook(teamId);
  const messageHook = get(hookRet, 'hook', null);
  if (!messageHook) {
    throw new Error('Cannot get team Id to proceed');
  }

  try {
    const hookRet = req.body;
    const hookNormalized = parseAction(hookRet);

    const ret = await Axios.post(messageHook, hookNormalized);

    console.log('===>POST RET', ret);

    res.status(200).json({ status: 'OK' });
  } catch (e) {
    console.error('ERROR: ', e);
    res.status(200).json({ message: e.message });
  }
});

// TODO: /{process.env.SERVICE_NAME}/hook/{teamId}. Use this
// path to handle hooks from 3rd party services
// router.post('/:service/hook/:teamId', async (req: Request, res: Response) => {
//   const { service, teamId } = req.params;
//   console.log(
//     `===>HOOK BODY of service: ${service} team: ${teamId}`,
//     JSON.stringify(req.body),
//   );

//   // Find hook to send data to
//   const hookRet = await getTeamHook(teamId);
//   const messageHook = get(hookRet, 'hook', null);
//   if (!messageHook) {
//     throw new Error('Cannot get team Id to proceed');
//   }

//   try {
//     const hookRet = req.body;
//     const hookNormalized = parseAction(hookRet);

//     const ret = await Axios.post(messageHook, hookNormalized);

//     console.log('===>POST RET', ret);

//     res.status(200).json({ status: 'OK' });
//   } catch (e) {
//     console.error('ERROR: ', e);
//     res.status(200).json({ message: e.message });
//   }
// });

export { router };
