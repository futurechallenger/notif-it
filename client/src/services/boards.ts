import Axios from 'axios';

const host =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8333'
    : 'https://j-int.herokuapp.com'; // TODO: request trello to get boards

async function getBoardsList() {
  const { status, data } = await Axios.get(`${host}/events`);
  if (status !== 200) {
    console.error('===>Error to get events');
    return;
  }

  return data;
}

export { getBoardsList };
