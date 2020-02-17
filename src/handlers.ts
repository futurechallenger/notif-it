// import * as Koa from 'koa';
// import * as url from 'url';

// function callback(req: Koa.Request, res: Koa.Response) {
//   const query = url.parse(req.url, true).query;
//   const token = query.oauth_token;
//   const tokenSecret = oauth_secrets[token];
//   const verifier = query.oauth_verifier;
//   oauth.getOAuthAccessToken(token, tokenSecret, verifier, function(
//     error,
//     accessToken,
//     accessTokenSecret,
//     results,
//   ) {
//     // In a real app, the accessToken and accessTokenSecret should be stored
//     oauth.getProtectedResource(
//       'https://api.trello.com/1/members/me',
//       'GET',
//       accessToken,
//       accessTokenSecret,
//       function(error, data, response) {
//         console.log(accessToken);
//         console.log(accessTokenSecret);
//         // Now we can respond with data to show that we have access to your Trello account via OAuth
//         res.send(data);
//       },
//     );
//   });
// }

// export { callback };
