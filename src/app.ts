import * as dotenv from 'dotenv';
import 'module-alias/register';
import { createApp } from './lib/createApp';
import { HookService } from './services/common';
import { HookTrello } from './services/hookService';

// load dotenv
dotenv.config();
const host =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8333'
    : process.env.PROJECT_DOMAIN;
const serviceHook: HookService = new HookTrello();
const app = createApp(
  {
    serviceURL: process.env.TRELLO_HOST, // TODO: use the auth host by configured service and get the host from env var
    scopes: ['read'],
    returnURL: `${host}/callback`,
    responseType: 'token',
    clientId: process.env.TRELLO_KEY, // TODO: according to service of current auth
    clientIDAlias: 'key',
    name: 'The Awesome Notification App',
    expiration: 'never',
  },
  serviceHook,
);

const port = process.env.PORT || 8333;

app.listen(port, () => {
  console.log(`App is serving on port ${port}`);
});
