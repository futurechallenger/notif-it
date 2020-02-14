import * as dotenv from 'dotenv';
import * as Koa from 'koa';
import * as serve from 'koa-static';
import * as cors from 'koa-cors';
import * as path from 'path';

dotenv.config();

const app = new Koa();
const middlePath = process.env.NODE_ENV === 'dev' ? '..' : '.';
app.use(serve(path.join(__dirname, middlePath, 'client/build')));
app.use(cors());

const port = process.env.PORT || 8333;

app.listen(port, () => {
  console.log(`App is serving on port ${port}`);
});
