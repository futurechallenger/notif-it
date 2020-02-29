import Axios from 'axios';
import { host } from '../util/config';

async function getBoardsList() {
  const { status, data } = await Axios.get(`${host}/events`);
  if (status !== 200) {
    console.error('===>Error to get events');
    return;
  }

  console.log('===>Boards', data.data);
  return data.data;
}

export { getBoardsList };
