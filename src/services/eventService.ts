import Axios from 'axios';
import { trelloHost } from '@util/config';
import { getTeamToken } from '@src/db';
import { each, find, difference } from 'lodash';

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

async function getEventHooks(token: string): Promise<WebHookType[] | null> {
  const ret = await Axios.get(
    `${trelloHost}tokens/${token}/webhooks?key=${process.env.TRELLO_KEY}`,
  );
  if (ret.status !== 200) {
    return null;
  }

  return ret.data;
}

async function parseEvents(
  teamId: string,
  dest: string[],
): Promise<EventHook[] | null> {
  try {
    const tkRet = await getTeamToken(teamId);
    if (!tkRet) {
      return null;
    }
    const token = tkRet.tk;
    const currentHooks = await getEventHooks(token);

    // No existing webhooks
    if (!currentHooks) {
      return dest.map((eId: string) => ({ eventId: eId, action: 'post' }));
    }

    return compareEvents(dest, currentHooks);
  } catch (e) {
    console.error('==>parse events error: ', e);
  }
}

function compareEvents(
  dest: string[],
  currentHooks: WebHookType[],
): EventHook[] {
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

export { EventHook, WebHookType, parseEvents, compareEvents };
