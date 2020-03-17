"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("./config");
const QueryString = require("query-string");
describe('Test url generating from config', () => {
    it('Gen t url', () => {
        const config = new config_1.Config();
        const returnURL = 'http://localhsot:8333/callback/1';
        const url = config.getOAuth2URL({
            service: 'trello',
            authType: 'implicit',
            hostURL: 'http://localhsot:8333',
            serviceURL: 'https://api.trello.com',
            authURL: 'https://api.trello.com/1/authorize',
            scopes: ['read'],
            returnURL,
            responseType: 'token',
            clientId: 'tkey',
            clientIDAlias: 'key',
            name: process.env.APP_NAME || 'My App',
            expiration: 'never',
        });
        const queryObj = QueryString.parse(url.split('?')[1]);
        expect(queryObj).toMatchObject(QueryString.parse('return_url=http://localhsot:8333/callback/1&response_type=token&name=My App&expiration=never&key=tkey&scope=read'));
    });
});
//# sourceMappingURL=config.test.js.map