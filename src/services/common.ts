import { EventHook } from './eventService';

export interface HookService {
  /**
   *  Set up hooks to the given parsed events
   * @param events Parsed events, refer to `EventHook` for more details
   */
  setHooksForEvents(
    events: EventHook[],
    rid: number,
    token: string,
  ): Promise<any | null>;
}
