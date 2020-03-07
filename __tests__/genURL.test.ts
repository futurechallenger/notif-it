import { Config } from '@lib/config';
import * as QueryString from 'query-string';

describe('Test url generating from config', () => {
  it('Gen t url', () => {
    /**
      interface OAuthConfig {
        serviceHost: string;
        authPath: string;
        returnURL: string;
        returnURLAlias: string;
        scope: string[];
        scopeDivider: string;
        clientId: string;
        [index: string]: string | string[] | boolean;
        clientIDAlias?: string;
        state?: string;
        // TODO: maybe a single obj to do the config
        expiration?: string; // trello 1h, 1day, etc.
        name?: string;
        login?: string; // github
        allogSignup?: boolean; // github
      }
     */

    const config = new Config();
    const returnURL = 'http://localhsot:8333/callback/1';
    const url = config.getOAuth2URL({
      serviceURL: 'https://api.trello.com/1/authorize', //'https://api.trello.com/1/',
      scopes: ['read'],
      returnURL,
      responseType: 'token',
      clientId: 'tkey',
      clientIDAlias: 'key',
      name: process.env.APP_NAME || 'My App',
      expiration: 'never',
    });

    console.log('===>URL: ', url);
    // const url = `${this.serviceHost}authorize
    // ?expiration=${expiration}
    // &name=${appName}
    // &scope=${scope}
    // &response_type=token
    // &key=tkey
    // &return_url=${host}/callback`;
    const queryObj = QueryString.parse(url.split('?')[1]);
    expect(queryObj).toMatchObject(
      QueryString.parse(
        'return_url=http://localhsot:8333/callback/1&response_type=token&name=My App&expiration=never&key=tkey&scope=read',
      ),
    );
  });

  // it('test g', () => {});
});
