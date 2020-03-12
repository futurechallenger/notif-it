import { EventHook } from '../services/eventService';
import { Context } from './types';

interface HookService {
  /**
   *  Set up hooks to the given parsed events
   * @param events Parsed events, refer to `EventHook` for more details
   */
  setHooksForEvents(events: EventHook[], context: Context): Promise<any | null>;
}

interface MessageService {
  parseEvent(payload: any, context: Context): any | null;
}

interface EventService {
  getCurrentHooks(context: Context): Promise<any | null>;
  getAllEvents(context: Context): Promise<any[] | null>;
  parseHooks(context: Context): Promise<any | null>;
  setEventsInContext(events: any[], context: Context): void;
}

export { HookService, MessageService, EventService };
