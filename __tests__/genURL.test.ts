import { Config } from '@lib/config';
import * as QueryString from 'query-string';

describe('Test url generating from config', () => {
  it('Gen t url', () => {
    const config = new Config();
    const returnURL = 'http://localhsot:8333/callback/1';
    const url = config.getOAuth2URL({
      service: 'trello',
      serviceURL: 'https://api.trello.com',
      authPath: '/1/authorize',
      scopes: ['read'],
      returnURL,
      responseType: 'token',
      clientId: 'tkey',
      clientIDAlias: 'key',
      name: process.env.APP_NAME || 'My App',
      expiration: 'never',
    });

    const queryObj = QueryString.parse(url.split('?')[1]);
    expect(queryObj).toMatchObject(
      QueryString.parse(
        'return_url=http://localhsot:8333/callback/1&response_type=token&name=My App&expiration=never&key=tkey&scope=read',
      ),
    );
  });
});
