import * as Express from 'express';
import Axios from 'axios';
import { OAuth } from 'oauth';
import * as url from 'url';
import {
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

const getRequestToken = (): Promise<RequestToken> => {
  return new Promise((resolve, reject) => {
    oauth.getOAuthRequestToken((error, token, tokenSecret, results) => {
      console.log(
        '===>LOGIN INFO',
        JSON.stringify({
          error,
          token,
          tokenSecret,
          results,
        }),
      );

      if (error) {
        reject(error);
        return;
      }

      resolve({
        token,
        tokenSecret,
        results,
      });
    });
  });
};

const getAccessToken = (
  token: string,
  tokenSecret: string,
  verifier: string,
): Promise<string | Buffer> => {
  return new Promise((resolve, reject) => {
    oauth.getOAuthAccessToken(
      token,
      tokenSecret,
      verifier,
      (error, accessToken, accessTokenSecret, results) => {
        if (error) {
          console.error('===>AUTH ERROR', error);
          reject(error);
          return;
        }

        console.log('==>Auth results', results);
        // In a real app, the accessToken and accessTokenSecret should be stored
        oauth.getProtectedResource(
          'https://api.trello.com/1/members/me',
          'GET',
          accessToken,
          accessTokenSecret,
          (error, data, response) => {
            if (error) {
              reject(error);
              return;
            }

            console.log('===>ERROR', error);
            console.log('===>RESPONSE', response);

            console.log(accessToken);
            console.log(accessTokenSecret);

            resolve(data);
          },
        );
      },
    );
  });
};

let messageHook = '';
let token = '';

// TODO: replace key with env var
router.get('/', (_: Request, res: Response) => {
  const host =
    process.env.NODE_ENV === 'dev'
      ? 'http://localhost:8333'
      : process.env.PROJECT_DOMAIN;

  if (!token) {
    res.render('home', {
      title: 'Trello Notification App',
      url: `https://trello.com/1/authorize?expiration=1day&name=MyPersonalToken&scope=read&response_type=token&key=${process.env.TRELLO_KEY}&return_url=${host}/callback`,
      host,
    });
    return;
  }

  res.render('../client/build/index.html');
});

router.get('/login', async (_: Request, res: Response) => {
  const { token, tokenSecret } = await getRequestToken();
  oauth_secrets[token] = tokenSecret;
  res.redirect(
    `${authorizeURL}?oauth_token=${token}&name=${appName}&scope=${scope}&expiration=${expiration}`,
  );
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

router.post('/message/hook', async (req: Request, res: Response) => {
  const { hook } = req.body;
  messageHook =
    hook ||
    'https://hooks.glip.com/webhook/7d660f28-260d-4cb1-a8d2-c2591da0fbcb';

  res.json({
    message: 'OK',
  });
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
