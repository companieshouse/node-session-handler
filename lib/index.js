"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const SessionMiddlewareFactory_1 = require("./SessionMiddlewareFactory");
const SessionStore_1 = require("./session/SessionStore");
const Cache_1 = require("./cache/Cache");
const EitherUtils = __importStar(require("./utils/EitherUtils"));
exports.EitherUtils = EitherUtils;
let handler;
class CHSessionServiceImpl {
    constructor(config) {
        this.config = config;
        const redis = Cache_1.Cache.redisInstance(config);
        redis.on("error", err => { throw (err); });
        const cache = new Cache_1.Cache(redis);
        this.sessionStore = new SessionStore_1.SessionStore(cache);
        this.sessionMiddlewareFactory = new SessionMiddlewareFactory_1.SessionMiddlewareFactory(this.config, this.sessionStore);
        this.sessionHandler = this.sessionMiddlewareFactory.handler();
    }
    static sessionServiceInstance(config) {
        if (!CHSessionServiceImpl.impl) {
            CHSessionServiceImpl.impl = new CHSessionServiceImpl(config);
        }
        return CHSessionServiceImpl.impl;
    }
}
exports.CHSessionServiceInstance = (config) => {
    if (!handler) {
        handler = CHSessionServiceImpl.sessionServiceInstance(config);
    }
    return handler;
};
//# sourceMappingURL=index.js.map