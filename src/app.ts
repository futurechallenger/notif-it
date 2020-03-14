import * as dotenv from 'dotenv';
import 'module-alias/register';
import { createApp } from './lib/createApp';
import { HookService, EventService, MessageService } from './lib/common';
import { TrelloHookService, GithubHookService } from './services/hookService';
import {
  TrelloEventService,
  GithubEventService,
} from './services/eventService';
import {
  TrelloMessageService,
  GithubMessageService,
} from './services/messageService';

// load dotenv
dotenv.config();

const host =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8333'
    : process.env.PROJECT_DOMAIN;

// const serviceHook: HookService = new TrelloHookService();
// const eventHandler: EventService = new TrelloEventService();
// const messageService: MessageService = new TrelloMessageService();
// const app = createApp(
//   {
//     service: 'trello',
//     authType: 'implicit',
//     serviceURL: 'https://api.trello.com',
//     authURL: 'https://api.trello.com/1/authorize',
//     hostURL: host,
//     scopes: ['read'],
//     returnURL: `${host}/callback`,
//     responseType: 'token',
//     clientId: process.env.TRELLO_KEY, // TODO: according to service of current auth
//     clientIDAlias: 'key',
//     name: 'The Awesome Notification App',
//     expiration: 'never',
//   },
//   serviceHook,
//   eventHandler,
//   messageService,
// );

const serviceHook: HookService = new GithubHookService();
const eventHandler: EventService = new GithubEventService();
const messageService: MessageService = new GithubMessageService();
const app = createApp(
  {
    service: 'github',
    authType: 'oauth2.0',
    authURL: 'https://github.com/login/oauth/authorize',
    tokenURL: 'https://github.com/login/oauth/access_token',
    serviceURL: 'https://api.github.com',
    hostURL: host,
    scopes: ['read:org', 'admin:repo_hook', 'repo_deployment'],
    scopeDivider: ' ',
    returnURL: `${host}/callback`,
    returnURLAlias: 'redirect_uri',
    // responseType: 'token',
    clientId: process.env.GITHUB_KEY, // TODO: according to service of current auth
    name: 'The Awesome Notification App',
    // expiration: 'never',
    allowSignup: 'true',
  },
  serviceHook,
  eventHandler,
  messageService,
);

const port = process.env.PORT || 8333;

app.listen(port, () => {
  console.log(`App is serving on port ${port}`);
});
