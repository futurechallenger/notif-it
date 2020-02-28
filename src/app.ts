import * as dotenv from 'dotenv';
import * as Express from 'express';
import * as bodyParser from 'body-parser';
// import * as serve from 'koa-static';
import * as cors from 'cors';
import * as path from 'path';
import { router } from './routes';
import * as ejs from 'ejs';

dotenv.config();

// APP
const app = Express();

// View engine
const clientPath = '../views';
// process.env.NODE_ENV === 'dev' ? '../views' : './client';
app.set('html', ejs.renderFile);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, clientPath));

// Middleware
app.use(cors());
app.use(bodyParser());
app.use(
  Express.static(path.join(__dirname, clientPath), { maxAge: 31557600000 }),
);

// routes
app.use(router);

const port = process.env.PORT || 8333;

app.listen(port, () => {
  console.log(`App is serving on port ${port}`);
});
