const host =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:8333'
    : 'https://j-int.herokuapp.com'; // TODO: request trello to get boards
const authUrl = `${host}/auth`;

export { host, authUrl };
