import { parseAction as trelloService } from '@src/services/messageService';
import { hookUpdateCard } from './mocks/updateCard';

describe('test trello translate message', () => {
  it('test move card message translation', () => {
    const ret: any = trelloService(hookUpdateCard);
    /**
      activity: `${action.memberCreator.fullName} moved a card`,
      title: `**Card**\n[${action.data.card.name}](https://trello.com/c/${action.data.card.shortLink})`,
      body: `**List**\n[${action.data.listAfter.name}](https://trello.com/b/${action.data.board.shortLink}) (was ${action.data.listBefore.name})`,
     */
    expect(ret.activity).toBe('Bruce Li moved a card');
    expect(ret.title).toBe(
      '**Card**\n[3rd Test Board](https://trello.com/c/3hcOvJhy)',
    );
    // TODO: test body
  });
});
