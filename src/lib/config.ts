import { snakeCase, each } from 'lodash';
import * as QueryString from 'query-string';

interface OAuthConfig {
  [index: string]: string | string[] | boolean;
  /**
   * App name
   */
  name: string;
  // teamId: string; // Team or conversation or channel ID
  serviceURL: string;
  /**
   * service and authPath together compose a auth url
   */
  // authPath: string;
  returnURL: string;
  returnURLAlias?: string;
  scopes: string[];
  scopeDivider?: string;
  /**
   * Client Id or client key
   */
  clientId: string;
  responseType?: string;
  /**
   * In case you client ID is not named as clientID, but key or something else.
   */
  clientIDAlias?: string;
  state?: string;
  // TODO: maybe a single obj to do the config
  expiration?: string; // trello 1h, 1day, etc.
  login?: string; // github
  allowSignup?: boolean; // github
}

class Config {
  //TODO: these config may be moved to other place
  host: string =
    process.env.NODE_ENV === 'development'
      ? 'http://localhost:8333'
      : process.env.PROJECT_DOMAIN;

  serviceHost: string = process.env.SERVICE_HOST;
  serviceHookPath: string = process.env.SERVICE_HOOK_PATH;
  expiration?: string;

  getOAuth2URL(config: OAuthConfig): string {
    // TODO: valid the config
    if ('clientIDAlias' in config) {
      const clientValue = config.clientId;
      const alias = config['clientIDAlias'];

      delete config.clientId, delete config.clientIDAlias;
      config[alias] = clientValue;
    }

    if ('returnURLAlias' in config) {
      const returnUrlValue = config.returnURL;
      const alias = config['returnURLAlias'];
      delete config.returnURL;
      config[alias] = returnUrlValue;
    }

    // const url = `${this.serviceHost}authorize?expiration=${expiration}&name=${appName}&scope=${scope}&response_type=token&key=${process.env.TRELLO_KEY}&return_url=${host}/callback`;
    let url = `${config.serviceURL}?`;
    delete config.serviceURL, delete config.authPath;

    const scope = config.scopes.join(config.scopeDivider || ',');
    config.scope = scope;
    delete config.scopes;

    let target: { [index: string]: any } = {};
    each(Object.keys(config), (k: string) => {
      const parsedKey = snakeCase(k);
      target[parsedKey] = config[k];
    });

    url = `${url}${QueryString.stringify(target, {
      skipNull: true,
      encode: false,
      sort: false,
    })}`;
    return url;
  }
}

export { Config, OAuthConfig };
