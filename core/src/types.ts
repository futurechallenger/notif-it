import * as Express from 'express';

interface EventHook {
  eventId: string;
  hookId?: string;
  action: 'put' | 'post' | 'delete';
}

interface WebHookType {
  id?: string;
  description?: string;
  idModel: string;
  callbackURL?: string;
  active?: boolean;
}

interface EventType {
  id: string;
  name: string;
  desc: string;
}

interface DecodedType {
  rid: number;
  teamId: string;
  rtk?: string;
}

interface Request extends Express.Request {
  decoded?: DecodedType;
}
type Response = Express.Response;
type NextFunction = Express.NextFunction;
type Router = Express.Router;

interface RequestToken {
  token: string;
  tokenSecret: string;
  results: any[];
}

interface OAuthConfig {
  [index: string]: string | string[] | boolean;
  /**
   * Name of supported service
   */
  service: string;
  authType: string;
  /**
   * App name
   */
  name: string;
  // teamId: string; // Team or conversation or channel ID
  serviceURL: string;
  authURL: string;
  tokenURL?: string;
  returnURL: string;
  returnURLAlias?: string;
  hostURL: string;
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
  allowSignup?: string; // github
}

interface Context {
  [index: string]: any;
  // rid: string;
  // token: string;
  // serviceURL: string;
  // events?: any;
  // currentEvents?: any;
}

export {
  Request,
  Response,
  NextFunction,
  RequestToken,
  DecodedType,
  Router,
  OAuthConfig,
  Context,
  WebHookType,
  EventHook,
  EventType,
};
