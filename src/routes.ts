import * as Express from 'express';
import Axios from 'axios';
import { OAuth } from 'oauth';
import * as url from 'url';
import {
  trelloHost,
  accessURL,
  appName,
  authorizeURL,
  expiration,
  loginCallback,
  requestURL,
  scope,
} from './config';
import * as dotenv from 'dotenv';
import { query } from './db';

type Request = Express.Request;
type Response = Express.Response;

dotenv.config();

const router = Express.Router();

// TODO: this is oauth 1
const key = process.env.TRELLO_KEY;
const secret = process.env.TRELLO_SECRET;

let messageHook = '';
let token = '';

const host =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8333'
    : process.env.PROJECT_DOMAIN;
const authUrl = `${trelloHost}authorize?expiration=${expiration}&name=${appName}&scope=${scope}&response_type=token&key=${process.env.TRELLO_KEY}&return_url=${host}/callback`;

// TODO: replace key with env var
router.get('/', (_: Request, res: Response) => {
  // if (!token) {
  //   res.render('home', {
  //     title: 'Trello Notification App',
  //     url: authUrl,
  //     host,
  //   });
  //   return;
  // }

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

router.post('/callback', (req: Request, res: Response) => {
  try {
    const { t } = req.body;
    // TODO: Store token here
    token = t;
    res.json({ message: 'OK' });
  } catch (e) {
    res.status(500).json({ message: 'Failed' });
  }
});

router.get('/events', async (_: Request, res: Response) => {
  try {
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

    res.json({
      message: 'OK',
      data: boardsInfo.data,
    });
  } catch (e) {
    res.status(500).json({ message: 'Failed' });
  }
});

router.post('/subscribe', async (req: Request, res: Response) => {
  try {
    const { events } = req.body;
    console.log('==>Events', events);

    //TODO: check if db contains this team. if it does, upate. If not set the hook
    // https://api.trello.com/1/webhooks/?idModel=5e4b4f2fd5d8d9070ad67c15&description="My Webhook"&callbackURL=https://j-int.herokuapp.com/trello/hook&key=bbe35d4f98acd015fe7204bcb80e5567&token=43777f0b40a7361a08c362a5c2b1c8bb4d6f5a8abe97326f10b5da51b78231b7
    let promises = [];
    if (events.length > 0) {
      promises = events.map((eId: string) =>
        Axios({
          method: 'post',
          url: `${trelloHost}webhooks/?idModel=${eId}&description="My Webhook"&callbackURL=${process.env.PROJECT_DOMAIN}/trello/hook&key=${process.env.TRELLO_KEY}&token=${token}`,
        }),
      );
      const ret = await Promise.all(promises);
    }

    res.json({ message: 'OK' });
  } catch (e) {
    res.status(500).json({ message: 'Failed' });
  }
});

router.get('/query', async (_: Request, res: Response) => {
  const ret = await query('select now()');
  res.json(ret);
});

router.head('/trello/hook', async (_: Request, res: Response) => {
  res.status(200).json({ message: 'OK' });
});

router.post('/trello/hook', async (req: Request, res: Response) => {
  console.log('===>HOOK', JSON.stringify(req));
  console.log('===>HOOK BODY', JSON.stringify(req.body));

  try {
    const {
      model: { name = ' error model' },
      action: { type = 'error action' },
    } = req.body;

    if (messageHook) {
      console.log('===>Hook', messageHook);

      const ret = await Axios.post(
        messageHook,
        JSON.stringify({
          title: `***${name}***`,
          text: `Action: ${type}`,
        }),
      );

      console.log('===>POST RET', ret);
    }

    res.status(200).json({ message: 'OK' });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

export { router };
