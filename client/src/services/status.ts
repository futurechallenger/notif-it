import Axios from 'axios';
import { host } from '../util/config';

async function getTeamStatus(rtk: string): Promise<boolean | null> {
  const { status, data } = await Axios.post(`${host}/auth`, { rtk });
  if (status !== 200 || !data || !data.teamId) {
    console.error('===>Error to get events', data);
    return null;
  }

  console.log('===>status ret', data);

  return data;
}

export { getTeamStatus };
