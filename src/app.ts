import * as dotenv from 'dotenv';
import * as Koa from 'koa';
import * as serve from 'koa-static';
import * as cors from 'koa-cors';
import * as Router from 'koa-router';
import * as path from 'path';
import { OAuth } from 'oauth';
import * as url from 'url';

dotenv.config();

//
const requestURL = 'https://trello.com/1/OAuthGetRequestToken';
const accessURL = 'https://trello.com/1/OAuthGetAccessToken';
const authorizeURL = 'https://trello.com/1/OAuthAuthorizeToken';
const appName = 'Trello Notification App';
const scope = 'read';
const expiration = '1hour';
const loginCallback = `https://${process.env.PROJECT_DOMAIN}/callback`;

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

// handlers
const login = async function(ctx: Koa.Context) {
  const { token, tokenSecret } = await getRequestToken();
  oauth_secrets[token] = tokenSecret;
  await ctx.redirect(
    `${authorizeURL}?oauth_token=${token}&name=${appName}&scope=${scope}&expiration=${expiration}`,
  );
};

const callback = async (ctx: Koa.Context) => {
  const query = url.parse(ctx.req.url, true).query;
  const token = <string>query.oauth_token;
  const tokenSecret = oauth_secrets[token];
  const verifier = <string>query.oauth_verifier;
  const data = await getAccessToken(token, tokenSecret, verifier);
  ctx.body = data;
};

// Routes
const router = new Router();
router.get('/login', async (ctx: Koa.Context) => {
  await login(ctx);
});
router.get('/callback', async (ctx: Koa.Context) => {
  await callback(ctx);
});

router.head('/trello/hook', async (ctx: Koa.Context) => {
  ctx.status = 200;
  ctx.body = {};
});

router.post('/trello/hook', async (ctx: Koa.Context) => {
  console.log('===>HOOK', JSON.stringify(ctx.request));
  ctx.status = 200;
  ctx.body = {};
});

// APP
const app = new Koa();
const clientPath =
  process.env.NODE_ENV === 'dev' ? '../client/build' : './client';
app.use(serve(path.join(__dirname, clientPath)));
app.use(cors());

app.use(router.routes());

const port = process.env.PORT || 8333;

app.listen(port, () => {
  console.log(`App is serving on port ${port}`);
});
