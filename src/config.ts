const requestURL = 'https://trello.com/1/OAuthGetRequestToken';
const accessURL = 'https://trello.com/1/OAuthGetAccessToken';
const authorizeURL = 'https://trello.com/1/OAuthAuthorizeToken';
const appName = 'Trello Notification App';
const scope = 'read';
const expiration = '1hour';
const loginCallback = `https://${process.env.PROJECT_DOMAIN}/callback`;

export {
  requestURL,
  accessURL,
  authorizeURL,
  appName,
  scope,
  expiration,
  loginCallback,
};
