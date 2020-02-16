import { SessionMiddlewareFactory } from "./src/SessionMiddlewareFactory";
import { SessionHandlerConfig } from "./src/SessionHandlerConfig";
import { SessionStore } from "./src/session/SessionStore";
import { Cache } from "./src/cache/Cache";

let factory: SessionMiddlewareFactory;

export const CHSessionMiddleware = (config: SessionHandlerConfig) => {
    if (!factory) {
        factory = new SessionMiddlewareFactory(config, new SessionStore(new Cache(Cache.redisInstance(config))));
    }
    return factory.handler();
}

export { SessionHandlerConfig };
