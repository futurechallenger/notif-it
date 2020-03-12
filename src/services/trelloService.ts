import { get } from 'lodash';
import { MessageService } from '@src/lib/common';
import { Context } from '../lib/types';

/**
 * Event filter is now based on board, not actions in a board
 * @param payload returned from 3rd service
 * @param events model ID list formated likt xxx,xxx
 */
function parseEventContent(payload: any, events?: string) {
  // TODO: What to post to return when there's no events source subscribed
  if (!events) {
    return;
  }

  this.payload = payload;
  this.events = events || '';

  /**
   * Filter if the event is subscribed
   * oldEN: this param maybe deprecated
   */
  const canPost = (oldEN: string): boolean => {
    console.log('==>Old event name is', oldEN);
    console.log('==>Subscribed events', this.events);

    const eventName = get(this.payload, 'model.id', null);
    return this.events.indexOf(eventName) >= 0;
  };

  const createList = () => {
    if (!canPost('list_created')) {
      return null;
    }

    const action = this.payload.action;
    return {
      activity: action.memberCreator.fullName + ' created a list',
      title: '**List**\n' + action.data.list.name,
      body:
        '**Board**\n[' +
        action.data.board.name +
        '](https://trello.com/b/' +
        action.data.board.shortLink +
        ')',
    };
  };

  const updateList = () => {
    const action = this.payload.action;
    const old =
      action && action.data && action.data && action.data.old
        ? action.data.old
        : null;

    if (!old) {
      return null;
    }

    const list = action.data.list;
    if ('closed' in old && canPost('list_archived')) {
      var archived = list.closed ? 'archived' : 'unarchived';
      return {
        activity:
          action.memberCreator.fullName +
          ' ' +
          archived +
          ' ' +
          list.name +
          ' list',
      };
    } else if ('name' in old && canPost('list_renamed')) {
      return {
        activity: action.memberCreator.fullName + ' renamed a list',
        title:
          '[' +
          list.name +
          '](https://trello.com/b/' +
          action.data.board.shortLink +
          ') (was ' +
          old.name +
          ')',
      };
    }
  };

  const moveListFromBoard = () => {
    if (!canPost('list_moved')) {
      return null;
    }

    var action = this.payload.action;
    return {
      activity: action.memberCreator.fullName + ' moved a list',
      title: '**List**\n' + action.data.list.name,
      body:
        '**Board**\n' +
        action.data.boardTarget.name +
        ' (was ' +
        action.data.board.name +
        ')',
    };
  };

  const moveListToBoard = () => {
    if (!canPost('list_moved')) {
      return null;
    }

    var action = this.payload.action;
    return {
      activity: action.memberCreator.fullName + ' moved a list',
      title: '**List**\n' + action.data.list.name,
      body:
        '**Board**\n[' +
        action.data.board.name +
        '](https://trello.com/b/' +
        action.data.board.shortLink +
        ')' +
        ' (was ' +
        action.data.boardSource.name +
        ')',
    };
  };

  const updateBoard = () => {
    var action = this.payload.action;
    if (
      !canPost('board_renamed') ||
      !action ||
      !action.data ||
      !action.data.old ||
      !action.data.old.name
    ) {
      return null;
    }

    return {
      activity: `${action.memberCreator.fullName} renamed a board`,
      title: `**Board**\n[${action.data.board.name}](https://trello.com/b/${action.data.board.shortLink})(was ${action.data.old.name})`,
    };
  };

  const addMemberToBoard = () => {
    if (!canPost('board_member_added')) {
      return null;
    }
    var action = this.payload.action;
    return {
      activity:
        action.member.fullName +
        ' added to ' +
        action.data.board.name +
        ' board',
      //'[' + action.member.fullName + '](https://trello.com/' + action.member.username + ') added to ' +
      //	'[' + action.data.board.name + '](https://trello.com/b/' + action.data.board.shortLink + ') board'
    };
  };

  const emailCard = () => {
    this.createCard();
  };

  const createCard = () => {
    if (!canPost('card_created')) {
      return null;
    }
    var action = this.payload.action;
    return {
      activity: `${action.memberCreator.fullName} created a card`,
      //TODO: For temp test only
      text: `${action.memberCreator.fullName} created a card`,
      title:
        '**Card**\n[' +
        action.data.card.name +
        '](https://trello.com/c/' +
        action.data.card.shortLink +
        ')',
      body:
        '**Board**\n[' +
        action.data.board.name +
        '](https://trello.com/b/' +
        action.data.board.shortLink +
        ')',
    };
  };

  const moveCardToBoard = () => {
    if (!canPost('card_moved')) {
      return null;
    }
    var action = this.payload.action;
    return {
      activity: action.memberCreator.fullName + ' moved a card',
      title: '**Card**\n' + action.data.card.name,
      body:
        '**Board**\n[' +
        action.data.board.name +
        '](https://trello.com/b/' +
        action.data.board.shortLink +
        ') (was ' +
        action.data.boardSource.name +
        ')',
    };
  };

  const moveCardFromBoard = () => {
    if (!canPost('card_moved')) {
      return null;
    }

    var action = this.payload.action;
    return {
      activity: action.memberCreator.fullName + ' moved a card',
      title: '**Card**\n' + action.data.card.name,
      body:
        '**Board**\n' +
        action.data.boardTarget.name +
        ' (was ' +
        action.data.board.name +
        ')',
    };
  };

  const updateCard = () => {
    var action = this.payload.action;
    var old = action.data.old;
    if ('idList' in old && canPost('card_moved')) {
      return {
        activity: `${action.memberCreator.fullName} moved a card`,
        //TODO: For temp test only
        text: `${action.memberCreator.fullName} moved a card`,
        title: `**Card**\n[${action.data.card.name}](https://trello.com/c/${action.data.card.shortLink})`,
        body: `**List**\n[${action.data.listAfter.name}](https://trello.com/b/${action.data.board.shortLink}) (was ${action.data.listBefore.name})`,
      };
    } else if ('name' in old && canPost('card_renamed')) {
      return {
        activity: `${action.memberCreator.fullName} renamed a card`,
        //TODO: For temp test only
        text: `${action.memberCreator.fullName} renamed a card`,
        title: `**Card**\n[${action.data.card.name}](https://trello.com/c/${action.data.card.shortLink}) (was ${old.name})`,
      };
    } else if ('desc' in old && canPost('card_description')) {
      return {
        activity: `${action.memberCreator.fullName} updated ${action.data.card.name}`,
        //TODO: For temp test only
        text: `${action.memberCreator.fullName} updated ${action.data.card.name}`,
        title: '**Card Description**\n' + action.data.card.desc,
      };
    } else if ('due' in old && canPost('card_due_date')) {
      var day = new Date(action.data.card.due);
      return {
        activity: `${action.memberCreator.fullName} updated ${action.data.card.name}`,
        //TODO: For temp test only
        text: `${action.memberCreator.fullName} updated ${action.data.card.name}`,
        title: `**Card Due Date**\n' ${day.getMonth() +
          1}/${day.getDate()}/${day.getFullYear()}`,
      };
    } else if ('closed' in old && canPost('card_archived')) {
      var card = action.data.card;
      var archived = card.closed ? 'archived' : 'unarchived';
      return {
        activity: `${action.memberCreator.fullName} ${archived} ${action.data.card.name}`,
        //TODO: For temp test only
        text: `${action.memberCreator.fullName} ${archived} ${action.data.card.name}`,
      };
    } else {
      return null;
    }
  };

  const commentCard = () => {
    if (!canPost('card_comment')) {
      return null;
    }

    var action = this.payload.action;
    return {
      activity: `${action.memberCreator.fullName} commented on  ${action.data.card.name}`,
      //TODO: For temp test only
      text: `${action.memberCreator.fullName} commented on  ${action.data.card.name}`,
      title: action.data.text,
    };
  };

  const addAttachmentToCard = () => {
    if (!canPost('card_attachment')) {
      return null;
    }

    var action = this.payload.action;
    return {
      activity: `${action.memberCreator.fullName} added an attachment to ${action.data.card.name}`,
      title: `**File**\n[${action.data.attachment.name}](${action.data.attachment.url})`,
    };
  };

  const addMemberToCard = () => {
    if (!canPost('card_member_added')) {
      return null;
    }

    var action = this.payload.action;
    return {
      activity: `${action.member.fullName} added to ${action.data.card.name} card`,
      //TODO: For temp test only
      text: `${action.member.fullName} added to ${action.data.card.name} card`,
    };
  };

  const addChecklistToCard = () => {
    if (!canPost('checklist_added')) {
      return null;
    }

    var action = this.payload.action;
    return {
      activity: `${action.memberCreator.fullName} added a checklist to ${action.data.card.name}`,
      title: `**Checklist**\n' ${action.data.checklist.name}`,
    };
  };

  const createCheckItem = () => {
    if (!canPost('checklist_created')) {
      return null;
    }
    var action = this.payload.action;
    return {
      activity: `${action.memberCreator.fullName} added a checklist item to ${action.data.card.name}`,
      title: `**Item**\n ${action.data.checkItem.name}`,
      body: `**Checklist**\n ${action.data.checklist.name}`,
    };
  };

  const updateCheckItemStateOnCard = () => {
    if (!canPost('checklist_toggled')) {
      return null;
    }
    var action = this.payload.action;
    return {
      activity:
        action.data.checkItem.state === 'complete'
          ? `${action.memberCreator.fullName} completed ${action.data.checkItem.name}`
          : `${action.memberCreator.fullName} marked ${action.data.checkItem.name} incomplete`,
    };
  };

  const actionType = payload.action.type;
  switch (actionType) {
    case 'createList': {
      return createList();
    }
    case 'updateList': {
      return updateList();
    }
    case 'moveListFromBoard': {
      return moveListFromBoard();
    }
    case 'moveListToBoard': {
      return moveListToBoard();
    }
    case 'updateBoard': {
      return updateBoard();
    }
    case 'addMemberToBoard': {
      return addMemberToBoard();
    }
    case 'emailCard': {
      return emailCard();
    }
    case 'createCard': {
      return createCard();
    }
    case 'moveCardToBoard': {
      return moveCardToBoard();
    }
    case 'moveCardFromBoard': {
      return moveCardFromBoard();
    }
    case 'updateCard': {
      return updateCard();
    }
    case 'commentCard': {
      return commentCard();
    }
    case 'addAttachmentToCard': {
      return addAttachmentToCard();
    }
    case 'addMemberToCard': {
      return addMemberToCard();
    }
    case 'addChecklistToCard': {
      return addChecklistToCard();
    }
    case 'createCheckItem': {
      return createCheckItem();
    }
    case 'updateCheckItemStateOnCard': {
      return updateCheckItemStateOnCard();
    }
    default: {
      console.error(`Action type: ${actionType} is invalid`);
      return;
    }
  }
}

class TrelloMessageService implements MessageService {
  parseEvent(payload: any, context: Context): any | null {
    const { events = '' } = context;
    const ret = parseEventContent(payload, events as string);
  }
}

export { parseEventContent as parseAction, TrelloMessageService };
