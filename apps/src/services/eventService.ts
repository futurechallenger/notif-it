import Axios from 'axios';
import { getTokenByRID } from '@notifiit/core/db';
import { difference, each, find } from 'lodash';
import { EventService } from '@notifiit/core/common';
import {
  Context,
  EventHook,
  WebHookType,
  EventType,
} from '@notifiit/core/types';

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
    const currentHooks = await this.getCurrentEvents(context);

    // No existing webhooks
    if (!currentHooks || currentHooks.length === 0) {
      return dest.map((eId: string) => ({ eventId: eId, action: 'post' }));
    }

    return this._compareEvents(dest, currentHooks);
  }

  async getCurrentEvents(context: Context): Promise<any[] | null> {
    const { rid, service, serviceURL } = context;
    const token = await this._getTokenByRID(+rid);
    const keyName = this._getServiceName(service);
    const ret = await Axios.get(
      `${serviceURL}/1/tokens/${token}/webhooks?key=${process.env[keyName]}`,
    );

    if (ret.status !== 200) {
      return null;
    }

    return ret.data;
  }

  async getAllEvents(context: Context): Promise<any | null> {
    const { rid, service, serviceURL } = context;
    const token = await this._getTokenByRID(+rid);
    const keyName = this._getServiceName(service);
    const userInfoURI = `${serviceURL}/1/members/me?key=${process.env[keyName]}&token=${token}`;

    let userInfo = await Axios.get(userInfoURI);
    if (userInfo.status !== 200) {
      throw new Error('Get userinfo error');
    }

    // Get boards from 3rd service
    const boardsURI = `${serviceURL}/1/members/${userInfo.data.username}/boards?key=${process.env[keyName]}&token=${token}&filter=open&fields=id,name,desc`;
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

class GithubEventService implements EventService {
  /**
   * Repos have hooks
   */
  async getCurrentEvents(context: Context): Promise<any | null> {
    console.log(context);
    try {
      const { rid, host, token, service, serviceURL } = context;
      const all = await this.getAllEvents(context);
      // NOTE: do it one by one, no hurry
      const hooked: any[] = [];
      each(all, async (org: any) => {
        const { data } = await Axios.get(`{serviceURL}/orgs/${org.id}/hooks`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(data) && data.length > 0) {
          const findRet = find(data, (h: any) => h.url.indexOf(host) >= 0);
          // TODO: put org id and hook id
          if (findRet) {
            hooked.push({ eventId: org.id, hookId: findRet.id });
          }
        }
      });

      console.log('===>current orgs with hooks', hooked);

      return hooked;
    } catch (e) {
      console.error('ERROR: get current events: ', e);
      return null;
    }
  }

  async getAllEvents(context: Context): Promise<any[] | null> {
    try {
      const { rid, service, serviceURL } = context;
      const token = await this._getTokenByRID(+rid);
      // const keyName = this._getServiceName(service);

      const url = `${serviceURL}/user/orgs`;
      const { status, data } = await Axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log('==>all orgs', data);

      if (status !== 200) {
        return null;
      }

      // process the events format
      const events: EventType[] = (data as any[]).map((ev: any) => ({
        id: ev.login,
        name: ev.login,
        desc: ev.description,
      }));

      this.setEventsInContext(events, context);

      return events;
    } catch (e) {
      console.error('===>All events error: ', e);
      return null;
    }
  }

  async parseHooks(context: Context): Promise<any | null> {
    console.log(context);
    const { currentEvents: dest = [] } = context;
    const currentHooks = await this.getCurrentEvents(context);

    // No existing webhooks
    if (!currentHooks || currentHooks.length === 0) {
      return dest.map((eId: string) => ({ eventId: eId, action: 'post' }));
    }

    return null;
  }

  _compareEvents(dest: string[], currentHooks: WebHookType[]): EventHook[] {
    const result: EventHook[] = [];
    const temp: string[] = [];
    currentHooks.forEach((el: any) => {
      if (!find(dest, (ev: string) => el.id === ev)) {
        result.push({ eventId: el.id, hookId: el.hookId, action: 'delete' });
      } else {
        temp.push(el.id);
        result.push({ eventId: el.id, hookId: el.hookId, action: 'put' });
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

  setEventsInContext(events: any, context: Context) {
    context.events = events;
  }

  // private _getServiceName(service: string) {
  //   return `${service.toUpperCase()}_KEY`;
  // }

  private async _getTokenByRID(rid: number): Promise<string | null> {
    const tkRet = await getTokenByRID(rid);
    if (!tkRet) {
      return null;
    }
    const token = tkRet.tk;
    return token;
  }
}

export { EventHook, WebHookType, TrelloEventService, GithubEventService };
