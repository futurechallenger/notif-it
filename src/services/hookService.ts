import Axios from 'axios';
import { HookService } from '../lib/common';
import { EventHook } from './eventService';
import { Context } from '../lib/types';

export class HookTrello implements HookService {
  async setHooksForEvents(
    parsedEvents: EventHook[] | null,
    context: Context,
  ): Promise<any | null> {
    if (!parsedEvents || parsedEvents.length <= 0) {
      return null;
    }
    const { rid, token, serviceURL } = context;

    try {
      let promises: any[] = [];

      parsedEvents.forEach(({ eventId, hookId, action }: EventHook) => {
        let url;
        if (action === 'post') {
          url = `${serviceURL}/1/webhooks/?idModel=${eventId}&description="My Webhook"&callbackURL=${process.env.PROJECT_DOMAIN}/service/hook/${rid}&key=${process.env.TRELLO_KEY}&token=${token}`;
        } else if (action === 'delete') {
          url = `${serviceURL}/1/webhooks/${hookId}?key=${process.env.TRELLO_KEY}&token=${token}`;
        } else {
          url = `${serviceURL}/1/webhooks/${hookId}?description="My Webhook"&key=${process.env.TRELLO_KEY}&token=${token}`;
        }

        console.log('===>request url: ', url);

        promises.push(
          Axios({
            method: action,
            url,
          }),
        );
      });

      const ret = await Promise.all(promises);
      console.log('===>Set hook ret: ', ret);
      return ret;
    } catch (e) {
      console.error('===>Set hook error: ', e);
      // Rethrow to notify it's failed
      throw e;
    }
  }
}
