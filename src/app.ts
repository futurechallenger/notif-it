import * as dotenv from 'dotenv';
import 'module-alias/register';
import { createApp } from './lib/createApp';
import { HookService, EventService, MessageService } from './lib/common';
import { HookTrello } from './services/hookService';
import { TrelloEventService } from './services/eventService';
import { TrelloMessageService } from './services/trelloService';

// load dotenv
dotenv.config();
const host =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8333'
    : process.env.PROJECT_DOMAIN;
const serviceHook: HookService = new HookTrello();
const eventHandler: EventService = new TrelloEventService();
const messageService: MessageService = new TrelloMessageService();
const app = createApp(
  {
    serviceURL: 'https://api.trello.com',
    authPath: '/1/authorize',
    scopes: ['read'],
    returnURL: `${host}/callback`,
    responseType: 'token',
    clientId: process.env.TRELLO_KEY, // TODO: according to service of current auth
    clientIDAlias: 'key',
    name: 'The Awesome Notification App',
    expiration: 'never',
  },
  serviceHook,
  eventHandler,
  messageService,
);

const port = process.env.PORT || 8333;

app.listen(port, () => {
  console.log(`App is serving on port ${port}`);
});
