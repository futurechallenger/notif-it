import { getTokenByRID } from '@src/lib/db';
import Axios from 'axios';
import { HookService } from '../lib/common';
import { Context } from '../lib/types';
import { EventHook } from './eventService';

class TrelloHookService implements HookService {
  async setHooksForEvents(
    parsedEvents: EventHook[] | null,
    context: Context,
  ): Promise<any | null> {
    if (!parsedEvents || parsedEvents.length <= 0) {
      return null;
    }
    const { rid, serviceURL, service } = context;
    const token = await this._getTokenByRID(+rid);
    const keyName = this._getServiceName(service);

    try {
      let promises: any[] = [];

      parsedEvents.forEach(({ eventId, hookId, action }: EventHook) => {
        let url;
        if (action === 'post') {
          url = `${serviceURL}/1/webhooks/?idModel=${eventId}&description="My Webhook"&callbackURL=${process.env.PROJECT_DOMAIN}/service/hook/${rid}&key=${process.env[keyName]}&token=${token}`;
        } else if (action === 'delete') {
          url = `${serviceURL}/1/webhooks/${hookId}?key=${process.env[keyName]}&token=${token}`;
        } else {
          url = `${serviceURL}/1/webhooks/${hookId}?description="My Webhook"&key=${process.env[keyName]}&token=${token}`;
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

  private _getServiceName(service: string) {
    return `${service.toUpperCase()}_KEY`;
  }

  private async _getTokenByRID(rid: number): Promise<string | null> {
    const tkRet = await getTokenByRID(rid);
    if (!tkRet) {
      return null;
    }
    const token = tkRet.tk;
    return token;
  }
}

class GithubHookService implements HookService {
  /**
   *  Set up hooks to the given parsed events
   * @param events Parsed events, refer to `EventHook` for more details
   */
  async setHooksForEvents(
    events: EventHook[],
    context: Context,
  ): Promise<any | null> {
    console.log(events, context);

    if (!events || events.length <= 0) {
      return null;
    }
    const { rid, serviceURL, service } = context;
    const token = await this._getTokenByRID(+rid);
    const keyName = this._getServiceName(service);

    try {
      let ret: any;

      events.forEach(async ({ eventId, hookId, action }: EventHook) => {
        let url = '';
        if (action === 'post') {
          url = `${serviceURL}/orgs/${eventId}/hooks`;
          ret = await Axios.post(
            url,
            {
              name: 'web',
              config: {
                url: `${process.env.PROJECT_DOMAIN}/service/hook/${rid}`,
                content_type: 'json',
              },
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          console.log('set hook post', ret);
        } else if (action === 'delete') {
          url = `${serviceURL}/orgs/${eventId}/hooks/${hookId}`;
          ret = await Axios.delete(url, {
            headers: { Authorization: `Bearer ${token}` },
          });
          console.log('set hook delete', ret);
        } else {
          url = `${serviceURL}/orgs/${eventId}/hooks/${hookId}`;

          ret = await Axios.patch(
            url,
            {
              name: 'web',
              config: {
                url: `${process.env.PROJECT_DOMAIN}/service/hook/${rid}`,
                content_type: 'json',
              },
            },
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
          console.log('set hook patch', ret);
        }
      });

      return ret;
    } catch (e) {
      console.error('==>ERROR: Set hook: ', e);
      return null;
    }
  }

  private _getServiceName(service: string) {
    return `${service.toUpperCase()}_KEY`;
  }

  private async _getTokenByRID(rid: number): Promise<string | null> {
    const tkRet = await getTokenByRID(rid);
    if (!tkRet) {
      return null;
    }
    const token = tkRet.tk;
    return token;
  }
}

export { TrelloHookService, GithubHookService };
