import { SessionMiddlewareFactory } from "./SessionMiddlewareFactory";
import { SessionHandlerConfig } from "./SessionHandlerConfig";
import { SessionStore } from "./session/SessionStore";
import { Cache } from "./cache/Cache";
import { RequestHandler } from "express";
import * as EitherUtils from "./utils/EitherUtils"


export interface CHSessionService {
    readonly config: SessionHandlerConfig;
    readonly sessionStore: SessionStore;
    readonly sessionHandler: RequestHandler;
}

let handler: CHSessionService;

class CHSessionServiceImpl implements CHSessionService {

    private static impl: CHSessionServiceImpl;
    private sessionMiddlewareFactory: SessionMiddlewareFactory;

    public readonly sessionStore: SessionStore;
    public readonly sessionHandler: RequestHandler;

    private constructor(public readonly config: SessionHandlerConfig) {
        const redis = Cache.redisInstance(config);
        redis.on("error", err => { throw (err); });
        const cache = new Cache(redis);
        this.sessionStore = new SessionStore(cache);
        this.sessionMiddlewareFactory = new SessionMiddlewareFactory(this.config, this.sessionStore)
        this.sessionHandler = this.sessionMiddlewareFactory.handler();
    }

    public static sessionServiceInstance(config: SessionHandlerConfig): CHSessionService {
        if (!CHSessionServiceImpl.impl) {
            CHSessionServiceImpl.impl = new CHSessionServiceImpl(config);
        }
        return CHSessionServiceImpl.impl;

    }

}

export const CHSessionServiceInstance = (config: SessionHandlerConfig): CHSessionService => {
    if (!handler) {
        handler = CHSessionServiceImpl.sessionServiceInstance(config);
    }
    return handler;
};

export { SessionHandlerConfig, EitherUtils };
