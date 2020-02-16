"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SessionMiddlewareFactory_1 = require("./SessionMiddlewareFactory");
const SessionStore_1 = require("./session/SessionStore");
const Cache_1 = require("./cache/Cache");
let factory;
exports.CHSessionMiddleware = (config) => {
    if (!factory) {
        factory = new SessionMiddlewareFactory_1.SessionMiddlewareFactory(config, new SessionStore_1.SessionStore(new Cache_1.Cache(Cache_1.Cache.redisInstance(config))));
    }
    return factory.handler();
};
//# sourceMappingURL=index.js.map