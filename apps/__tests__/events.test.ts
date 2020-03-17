import { TrelloEventService } from '@services/eventService';

describe('Test events parser', () => {
  it('compare current hooks of events and events', () => {
    const service = new TrelloEventService();
    const ret = service._compareEvents(
      ['1', '3', '9'],
      [{ idModel: '1' }, { idModel: '2' }, { idModel: '8' }],
    );

    expect(ret.length).toBe(5);
  });
});
