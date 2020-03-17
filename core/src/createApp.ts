import * as bodyParser from 'body-parser';
import * as compression from 'compression';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as ejs from 'ejs';
import * as Express from 'express';
import * as jwt from 'jsonwebtoken';
import 'module-alias/register';
import * as path from 'path';
import { configRouter } from './routes';
import { HookService, EventService, MessageService } from './common';
import {
  DecodedType,
  NextFunction,
  Request,
  Response,
  OAuthConfig,
} from './types';

// load dotenv
dotenv.config();

function createApp(
  authConfig: OAuthConfig,
  serviceHook: HookService,
  eventHandler: EventService,
  messageService: MessageService,
) {
  // APP
  const app = Express();

  // View engine
  const clientPath =
    process.env.NODE_ENV === 'development' ? '../../views' : '../../../views';
  app.engine('html', ejs.renderFile);
  app.set('view engine', 'html');
  app.set('views', path.join(__dirname, clientPath));
  app.use(
    Express.static(path.join(__dirname, clientPath), {
      maxAge: 31557600000,
    }),
  );

  // Middleware
  app.use(cors());
  app.use(bodyParser());
  app.use(compression());

  app.use((req: Request, _: Response, next: NextFunction) => {
    try {
      const rtk = req.headers['x-api-payload'] || req.body.rtk || req.query.rtk;
      if (!rtk) {
        (req as any).decoded = {};
        next();
      } else {
        const decoded: DecodedType = jwt.verify(
          rtk,
          process.env.JWT_SALT,
        ) as DecodedType;
        decoded.rtk = rtk;
        (req as any).decoded = decoded || {};

        next();
      }
    } catch (e) {
      console.error('===>Middleware decode rtk error', e);
      next(e);
    }
  });

  // routes

  const router = configRouter(
    serviceHook,
    eventHandler,
    messageService,
    authConfig,
  );
  app.use(router);

  return app;
}

export { createApp };
