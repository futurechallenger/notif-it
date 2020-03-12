import Axios from 'axios';
import { difference, each, find } from 'lodash';
import { EventService } from '../lib/common';
import { Context } from '../lib/types';

interface EventHook {
  eventId: string;
  hookId?: string;
  action: 'put' | 'post' | 'delete';
}

interface WebHookType {
  id?: string;
  description?: string;
  idModel: string;
  callbackURL?: string;
  active?: boolean;
}

class TrelloEventService implements EventService {
  _compareEvents(dest: string[], currentHooks: WebHookType[]): EventHook[] {
    const result: EventHook[] = [];
    const temp: string[] = [];
    currentHooks.forEach((el: WebHookType) => {
      if (!find(dest, (ev: string) => el.idModel === ev)) {
        result.push({ eventId: el.idModel, hookId: el.id, action: 'delete' });
      } else {
        temp.push(el.idModel);
        result.push({ eventId: el.idModel, hookId: el.id, action: 'put' });
      }
    });

    if (temp.length < dest.length) {
      const diffed = difference(dest, temp);
      each(diffed, (eId: string) => {
        result.push({ eventId: eId, action: 'post' });
      });
    }

    return result;
  }

  async parseHooks(context: Context): Promise<any | null> {
    const { currentEvents: dest = [] } = context;
    const currentHooks = await this.getCurrentHooks(context);

    // No existing webhooks
    if (!currentHooks || currentHooks.length === 0) {
      return dest.map((eId: string) => ({ eventId: eId, action: 'post' }));
    }

    return this._compareEvents(dest, currentHooks);
  }

  async getCurrentHooks(context: Context): Promise<any[] | null> {
    const { token, serviceURL } = context;

    const ret = await Axios.get(
      `${serviceURL}/1/tokens/${token}/webhooks?key=${process.env.TRELLO_KEY}`,
    );

    if (ret.status !== 200) {
      return null;
    }

    return ret.data;
  }

  async getAllEvents(context: Context): Promise<any | null> {
    const { token, serviceURL } = context;

    const userInfoURI = `${serviceURL}/1/members/me?key=${process.env.TRELLO_KEY}&token=${token}`;
    let userInfo = await Axios.get(userInfoURI);
    if (userInfo.status !== 200) {
      throw new Error('Get userinfo error');
    }

    // Get boards from 3rd service
    const boardsURI = `${serviceURL}/1/members/${userInfo.data.username}/boards?key=${process.env.TRELLO_KEY}&token=${token}&filter=open&fields=id,name,desc`;
    const { status, data } = await Axios.get(boardsURI);

    console.log('==>Event handler ret: ', data);

    if (status !== 200) {
      throw new Error('Get boards error');
    }

    this.setEventsInContext(data, context);

    return data;
  }

  setEventsInContext(events: any, context: Context) {
    context.events = events;
  }
}

export { EventHook, WebHookType, TrelloEventService };
