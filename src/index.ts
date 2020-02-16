import { SessionMiddlewareFactory } from "./SessionMiddlewareFactory";
import { SessionHandlerConfig } from "./SessionHandlerConfig";
import { SessionStore } from "./session/SessionStore";
import { Cache } from "./cache/Cache";

let factory: SessionMiddlewareFactory;

export const CHSessionMiddleware = (config: SessionHandlerConfig) => {
    if (!factory) {
        factory = new SessionMiddlewareFactory(config, new SessionStore(new Cache(Cache.redisInstance(config))));
    }
    return factory.handler();
}

export { SessionHandlerConfig };
