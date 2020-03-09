const host =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8333'
    : 'https://j-int.herokuapp.com'; // TODO: request trello to get boards
const authUrl = `${host}/auth`;

const UNIQUE_ID_NAME = '__rid';

export { host, authUrl, UNIQUE_ID_NAME };
