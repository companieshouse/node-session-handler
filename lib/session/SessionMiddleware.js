"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionMiddleware = void 0;
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const on_headers_1 = __importDefault(require("on-headers"));
const Logger_1 = require("../Logger");
const Cookie_1 = require("./model/Cookie");
const Session_1 = require("./model/Session");
const crypto_1 = __importDefault(require("crypto"));
const SessionKey_1 = require("./keys/SessionKey");
const DEFAULT_COOKIE_SECURE_FLAG = true;
const DEFAULT_COOKIE_TIME_TO_LIVE_IN_SECONDS = 3600;
function SessionMiddleware(config, sessionStore) {
    if (!config.cookieName) {
        throw Error("Cookie name must be defined");
    }
    if (!config.cookieDomain) {
        throw Error("Cookie domain must be defined");
    }
    if (!config.cookieSecret || config.cookieSecret.length < 24) {
        throw Error("Cookie secret must be at least 24 chars long");
    }
    return express_async_handler_1.default(sessionRequestHandler(config, sessionStore));
}
exports.SessionMiddleware = SessionMiddleware;
const sessionRequestHandler = (config, sessionStore) => {
    function loadSessionBySessionCookie(sessionCookie) {
        return __awaiter(this, void 0, void 0, function* () {
            Logger_1.loggerInstance().info(`loading session for session cookie: ${sessionCookie}`);
            let cookie;
            try {
                Cookie_1.validateCookieSignature(sessionCookie, config.cookieSecret);
                cookie = Cookie_1.Cookie.createFrom(sessionCookie);
                Logger_1.loggerInstance().info(`created new cookie ${JSON.stringify(cookie)} from sessionCookie`);
                const sessionData = yield sessionStore.load(cookie);
                Logger_1.loggerInstance().info(`session data ${JSON.stringify(sessionData)}`);
                const session = new Session_1.Session(sessionData);
                // session.verify();
                Logger_1.loggerInstance().debug(`Session successfully loaded from cookie ${sessionCookie}`);
                return session;
            }
            catch (sessionLoadingError) {
                Logger_1.loggerInstance().info(`unable to load session`);
                if (cookie) {
                    Logger_1.loggerInstance().info(`however we do have a cookie: ${JSON.stringify(cookie)}`);
                    try {
                        yield sessionStore.delete(cookie);
                    }
                    catch (sessionDeletionError) {
                        Logger_1.loggerInstance().error(`Session deletion failed for cookie ${sessionCookie} due to error: ${sessionDeletionError}`);
                    }
                }
                Logger_1.loggerInstance().error(`Session loading failed from cookie ${sessionCookie} due to error: ${sessionLoadingError}`);
                return undefined;
            }
        });
    }
    return (request, response, next) => __awaiter(void 0, void 0, void 0, function* () {
        const sessionCookie = request.cookies[config.cookieName];
        Logger_1.loggerInstance().info(`session cookie is ${sessionCookie}`);
        let originalSessionHash;
        on_headers_1.default(response, () => {
            Logger_1.loggerInstance().info(`request.session is ${JSON.stringify(request.session)}`);
            if (request.session) {
                Logger_1.loggerInstance().info(`we have a session, checking hash against original session hash`);
                if (hash(request.session) !== originalSessionHash) {
                    Logger_1.loggerInstance().info(`hash does not match, setting response`);
                    response.cookie(config.cookieName, sessionCookie, {
                        domain: config.cookieDomain,
                        path: "/",
                        httpOnly: true,
                        secure: config.cookieSecureFlag || DEFAULT_COOKIE_SECURE_FLAG,
                        maxAge: (config.cookieTimeToLiveInSeconds || DEFAULT_COOKIE_TIME_TO_LIVE_IN_SECONDS) * 1000,
                        encode: String
                    });
                }
            }
            else {
                Logger_1.loggerInstance().info(`no session found, session cookie is: ${sessionCookie}`);
                if (sessionCookie) {
                    response.clearCookie(config.cookieName);
                }
            }
        });
        response.end = new Proxy(response.end, {
            apply(target, thisArg, argsArg) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (request.session != null && hash(request.session) !== originalSessionHash) {
                        Logger_1.loggerInstance().info(`session is not null, but hashes are not equal... attempting to store a new cookie`);
                        try {
                            yield sessionStore.store(Cookie_1.Cookie.createFrom(sessionCookie), request.session.data, config.cookieTimeToLiveInSeconds || DEFAULT_COOKIE_TIME_TO_LIVE_IN_SECONDS);
                        }
                        catch (err) {
                            Logger_1.loggerInstance().error(err.message);
                        }
                    }
                    return target.apply(thisArg, argsArg);
                });
            }
        });
        Logger_1.loggerInstance().info(`now, do we have a sessionCookie? ${sessionCookie}`);
        if (!sessionCookie) {
            yield createSessionCookie(request, config, response, sessionStore);
            return next();
        }
        Logger_1.loggerInstance().infoRequest(request, `Session cookie ${sessionCookie} found in request: ${request.url}`);
        request.session = yield loadSessionBySessionCookie(sessionCookie);
        if (request.session != null) {
            Logger_1.loggerInstance().info(`session is not null, setting original hash`);
            originalSessionHash = hash(request.session);
        }
        Logger_1.loggerInstance().info(`next...`);
        next();
    });
};
const createSessionCookie = (request, config, response, sessionStore) => __awaiter(void 0, void 0, void 0, function* () {
    // if there is no cookie, we need to create a new session
    Logger_1.loggerInstance().infoRequest(request, `Session cookie not found in request ${request.url}, creating new session`);
    const cookie = Cookie_1.Cookie.createNew(config.cookieSecret);
    const session = new Session_1.Session();
    session.data = { [SessionKey_1.SessionKey.Id]: cookie.value };
    Logger_1.loggerInstance().info(`session data to be stored: ${session.data}`);
    // const cookie: Cookie = Cookie.createNew(config.cookieSecret);
    // const sessionId = generateSessionId();
    // loggerInstance().info(`generated sessionId: ${sessionId}`);
    // const signature = generateSignature(sessionId, config.cookieSecret);
    // loggerInstance().info(`generated signature: ${signature}`);
    // session.data = {[SessionKey.Id]: sessionId + signature};
    try {
        // store cookie session in Redis
        yield sessionStore.store(cookie, session.data, 3600);
        Logger_1.loggerInstance().info(`cookie stored in session store`);
    }
    catch (err) {
        Logger_1.loggerInstance().error(err.message);
    }
    // set the cookie for future requests
    request.session = session;
    Logger_1.loggerInstance().info(`applying to session: ${JSON.stringify(request.session)}`);
    response.cookie(config.cookieName, session.data[SessionKey_1.SessionKey.Id]);
    Logger_1.loggerInstance().info(`do we now have a cookie after attempting to create one? ${request.cookies[config.cookieName]}`);
});
const hash = (session) => {
    return crypto_1.default
        .createHash("sha1")
        .update(JSON.stringify(session.data), "utf8")
        .digest("hex");
};
//# sourceMappingURL=SessionMiddleware.js.map