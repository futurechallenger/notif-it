async function subscribeEvents(events: string[]) {
  console.log('Subscribed events', events);
  try {
    // const ret = await Trello.put('webhooks', {
    //   idModel: events[0],
    //   description: '',
    //   callbackURL: 'https://j-int.herokuapp.com/trello/hook',
    // });
    // console.log('==>RET', ret);
  } catch (e) {
    console.error('ERROR: ', e);
  }
}

export { subscribeEvents };
// https://api.trello.com/1/webhooks
