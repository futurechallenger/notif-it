import { snakeCase, each } from 'lodash';
import * as QueryString from 'query-string';
import { OAuthConfig } from './types';

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
    if ('service' in config) {
      delete config.service;
    }
    if ('authType' in config) {
      delete config.authType;
    }
    if ('hostURL' in config) {
      delete config.hostURL;
    }
    if ('tokenURL' in config) {
      delete config.tokenURL;
    }

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
      delete config.returnURL, delete config.returnURLAlias;
      config[alias] = returnUrlValue;
    }

    if ('scopeDivider' in config) {
      const scope = config.scopes.join(config.scopeDivider || ',');
      config.scope = scope;
      delete config.scopes;
      delete config.scopeDivider;
    }

    let url = config.authURL;
    delete config.serviceURL, delete config.authURL;

    let target: { [index: string]: any } = {};
    each(Object.keys(config), (k: string) => {
      const parsedKey = snakeCase(k);
      target[parsedKey] = config[k];
    });

    url = `${url}?${QueryString.stringify(target, {
      skipNull: true,
      encode: false,
      sort: false,
    })}`;
    return url;
  }
}

export { Config, OAuthConfig };
