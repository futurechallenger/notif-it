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

interface RequestToken {
  token: string;
  tokenSecret: string;
  results: any[];
}

export { Request, Response, NextFunction, RequestToken, DecodedType };
