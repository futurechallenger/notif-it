"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bodyParser = require("body-parser");
const compression = require("compression");
const cors = require("cors");
const dotenv = require("dotenv");
const ejs = require("ejs");
const Express = require("express");
const jwt = require("jsonwebtoken");
require("module-alias/register");
const path = require("path");
const routes_1 = require("./routes");
// load dotenv
dotenv.config();
function createApp(authConfig, serviceHook, eventHandler, messageService) {
    // APP
    const app = Express();
    // View engine
    const clientPath = process.env.NODE_ENV === 'development' ? '../../views' : '../../../views';
    app.engine('html', ejs.renderFile);
    app.set('view engine', 'html');
    app.set('views', path.join(__dirname, clientPath));
    app.use(Express.static(path.join(__dirname, clientPath), {
        maxAge: 31557600000,
    }));
    // Middleware
    app.use(cors());
    app.use(bodyParser());
    app.use(compression());
    app.use((req, _, next) => {
        try {
            const rtk = req.headers['x-api-payload'] || req.body.rtk || req.query.rtk;
            if (!rtk) {
                req.decoded = {};
                next();
            }
            else {
                const decoded = jwt.verify(rtk, process.env.JWT_SALT);
                decoded.rtk = rtk;
                req.decoded = decoded || {};
                next();
            }
        }
        catch (e) {
            console.error('===>Middleware decode rtk error', e);
            next(e);
        }
    });
    // routes
    const router = routes_1.configRouter(serviceHook, eventHandler, messageService, authConfig);
    app.use(router);
    return app;
}
exports.createApp = createApp;
//# sourceMappingURL=createApp.js.map