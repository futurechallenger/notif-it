import { host } from '../util/config';
import Axios from 'axios';

/**
 * Put events to server
 */
async function subscribeEvents(events: string[]) {
  console.log('Subscribed events', events);
  try {
    const data =
      process.env.NODE_ENV === 'development'
        ? [
            '59e8b3e98ba30d13b18aeb20',
            '5c3830762d4d2530c22d4ce2',
            '5e4b4f2fd5d8d9070ad67c15',
            '5b5fb692b996f95b67b8684c',
          ]
        : events;
    const ret = await Axios.post(`${host}/subscribe`, { events: data });
    console.log('==>RET', ret);
    if (ret.status !== 200) {
      console.error('ERROR subscribe events', ret);
      return;
    }

    return ret.data.data;
  } catch (e) {
    console.error('ERROR: ', e);
  }
}

export { subscribeEvents };
