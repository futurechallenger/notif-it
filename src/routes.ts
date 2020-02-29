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

type Request = Express.Request;
type Response = Express.Response;

dotenv.config();

const router = Express.Router();

// TODO: this is oauth 1
const key = process.env.TRELLO_KEY;
const secret = process.env.TRELLO_SECRET;

const oauth_secrets: { [key: string]: string } = {};
const oauth = new OAuth(
  requestURL,
  accessURL,
  key,
  secret,
  '1.0A',
  loginCallback,
  'HMAC-SHA1',
);

interface RequestToken {
  token: string;
  tokenSecret: string;
  results: any[];
}

let messageHook = '';
let token = '';

const host =
  process.env.NODE_ENV === 'dev'
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

  res.render('../views/build/index.html');
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
      console.log('===>Glip Hook', messageHook);

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
