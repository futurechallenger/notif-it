import Axios from 'axios';
import { host } from '../util/config';

async function getBoardsList(teamId: string) {
  const { status, data } = await Axios.get(`${host}/events/${teamId}`);
  if (status !== 200) {
    console.error('===>Error to get events');
    return;
  }

  console.log('===>Boards', data.data);
  return data.data;
}

export { getBoardsList };
