import * as Express from 'express';

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
   * App name
   */
  name: string;
  // teamId: string; // Team or conversation or channel ID
  serviceURL: string;
  /**
   * service and authPath together compose a auth url
   */
  authPath: string;
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

interface Context {
  rid: string;
  token: string;
  serviceURL: string;
  events?: any;
  currentEvents?: any;
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
};
