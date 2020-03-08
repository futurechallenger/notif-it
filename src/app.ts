import 'module-alias/register';
import * as dotenv from 'dotenv';
import * as Express from 'express';
import * as compression from 'compression';
import * as bodyParser from 'body-parser';
// import * as serve from 'koa-static';
import * as cors from 'cors';
import * as path from 'path';
import { router } from './routes';
import * as ejs from 'ejs';
import { Request, Response, NextFunction, DecodedType } from './types';
import * as jwt from 'jsonwebtoken';

dotenv.config();

// APP
const app = Express();

// View engine
const clientPath = '../views';
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
    const rtk = req.body.rtk || req.query.rtk;
    if (!rtk) {
      next();
    }

    const decoded: DecodedType = jwt.verify(
      rtk,
      process.env.JWT_SALT,
    ) as DecodedType;
    decoded.rtk = rtk;
    (req as any).decoded = decoded || {};

    next();
  } catch (e) {
    console.error('===>Middleware decode rtk error', e);
    next(e);
  }
});

// routes
app.use(router);

const port = process.env.PORT || 8333;

app.listen(port, () => {
  console.log(`App is serving on port ${port}`);
});
