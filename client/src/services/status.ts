import Axios from 'axios';
import { host } from '../util/config';

async function getTeamStatus(teamId: string): Promise<boolean | null> {
  const { status, data } = await Axios.post(`${host}/auth`, { teamId });
  if (status !== 200 || !data || !data.teamId) {
    console.error('===>Error to get events', data);
    return null;
  }

  console.log('===>status ret', data);
  return data;
}

export { getTeamStatus };
