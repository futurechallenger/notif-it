import Axios from 'axios';
import { host } from '../util/config';
import { BoardType } from 'src/BoardCheckbox';

async function getBoardsList(
  teamId: string,
): Promise<{ boards: BoardType[]; selected: string[] } | null> {
  const { status, data } = await Axios.get(`${host}/events/${teamId}`);
  if (status !== 200) {
    console.error('===>Error to get events');
    return null;
  }

  console.log('===>Boards', data);
  return data;
}

export { getBoardsList };
