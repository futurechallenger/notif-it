import { compareEvents } from '@services/eventService';
import { Config } from '@lib/config';

describe('Test events parser', () => {
  it('compare current hooks of events and events', () => {
    const ret = compareEvents(
      ['1', '3', '9'],
      [{ idModel: '1' }, { idModel: '2' }, { idModel: '8' }],
    );

    expect(ret.length).toBe(5);
  });
});
