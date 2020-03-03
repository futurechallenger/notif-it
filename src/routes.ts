import * as Express from 'express';
import Axios from 'axios';
import { OAuth } from 'oauth';
import * as url from 'url';
import { get } from 'lodash';
import {
  trelloHost,
  accessURL,
  appName,
  authorizeURL,
  expiration,
  loginCallback,
  requestURL,
  scope,
} from './util/config';
import * as dotenv from 'dotenv';
import { getTeamHook, getTeamToken, storeToken, storeEnvets } from './db';
import { parseAction } from './services/trelloService';

type Request = Express.Request;
type Response = Express.Response;

dotenv.config();

const router = Express.Router();

const host =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8333'
    : process.env.PROJECT_DOMAIN;
const authUrl = `${trelloHost}authorize?expiration=${expiration}&name=${appName}&scope=${scope}&response_type=token&key=${process.env.TRELLO_KEY}&return_url=${host}/callback`;

router.get('/', (_: Request, res: Response) => {
  res.render('index');
});

router.get('/auth', async (_: Request, res: Response) => {
  res.redirect(authUrl);
});

// Auth callback url
router.get('/callback', async (req: Request, res: Response) => {
  console.log('==>Callback', req.query);
  res.redirect('/success.html');
});

router.post('/callback', async (req: Request, res: Response) => {
  try {
    const { t, teamId } = req.body;

    const ret = await storeToken(teamId, t);
    if (ret <= 0) {
      throw new Error('DB error to keep tk');
    }

    res.json({ status: 'OK' });
  } catch (e) {
    console.error('ERROR: ', e);
    res.status(500).json({ message: 'Failed' });
  }
});

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

    // Get boards
    const boardsURI = `${trelloHost}/members/${userInfo.data.username}/boards?key=${process.env.TRELLO_KEY}&token=${token}&filter=open&fields=id,name,desc`;
    const boardsInfo = await Axios.get(boardsURI);
    if (boardsInfo.status !== 200) {
      throw new Error('Get boards error');
    }

    // TODO: get selected boards for updating

    res.json({
      status: 'OK',
      data: boardsInfo.data,
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
    const parsedEvents = []; //[{ eId, action: 'put|post' }];

    let promises = [];
    if (events.length > 0) {
      promises = events.map(({ eId, action }) =>
        Axios({
          method: 'post',
          url: `${trelloHost}webhooks/?idModel=${eId}&description="My Webhook"&callbackURL=${process.env.PROJECT_DOMAIN}/trello/hook&key=${process.env.TRELLO_KEY}&token=${token}`,
        }),
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

    res.status(200).json({ message: 'OK' });
  } catch (e) {
    console.error('ERROR: ', e);
    res.status(500).json({ message: e.message });
  }
});

export { router };
