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
const SessionKey_1 = require("./keys/SessionKey");
const crypto_1 = __importDefault(require("crypto"));
const DEFAULT_COOKIE_SECURE_FLAG = true;
const DEFAULT_COOKIE_TIME_TO_LIVE_IN_SECONDS = 3600;
function SessionMiddleware(config, sessionStore, createSessionWhenCookieNotFound = false) {
    if (!config.cookieName) {
        throw Error("Cookie name must be defined");
    }
    if (!config.cookieDomain) {
        throw Error("Cookie domain must be defined");
    }
    if (!config.cookieSecret || config.cookieSecret.length < 24) {
        throw Error("Cookie secret must be at least 24 chars long");
    }
    return express_async_handler_1.default(sessionRequestHandler(config, sessionStore, createSessionWhenCookieNotFound));
}
exports.SessionMiddleware = SessionMiddleware;
const sessionRequestHandler = (config, sessionStore, createSessionWhenCookieNotFound = false) => {
    function loadSession(sessionCookie) {
        return __awaiter(this, void 0, void 0, function* () {
            let cookie;
            try {
                Cookie_1.validateCookieSignature(sessionCookie, config.cookieSecret);
                cookie = Cookie_1.Cookie.createFrom(sessionCookie);
                const sessionData = yield sessionStore.load(cookie);
                const session = new Session_1.Session(sessionData);
                session.verify();
                Logger_1.loggerInstance().debug(`Session successfully loaded from cookie ${sessionCookie}`);
                return session;
            }
            catch (sessionLoadingError) {
                if (cookie) {
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
        let sessionCookie = request.cookies[config.cookieName];
        let originalSessionHash;
        on_headers_1.default(response, () => {
            if (request.session) {
                if (hash(request.session) !== originalSessionHash) {
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
                if (sessionCookie) {
                    response.clearCookie(config.cookieName);
                }
            }
        });
        response.end = new Proxy(response.end, {
            apply(target, thisArg, argsArg) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (request.session != null && hash(request.session) !== originalSessionHash) {
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
        if (sessionCookie) {
            Logger_1.loggerInstance().debugRequest(request, `Session cookie ${sessionCookie} found in request: ${request.url}`);
            request.session = yield loadSession(sessionCookie);
            if (request.session != null) {
                originalSessionHash = hash(request.session);
            }
        }
        else if (createSessionWhenCookieNotFound) {
            Logger_1.loggerInstance().debugRequest(request, `Session cookie not found in request ${request.url} so empty session will get created`);
            const cookie = Cookie_1.Cookie.createNew(config.cookieSecret);
            sessionCookie = cookie.value;
            request.session = new Session_1.Session({
                [SessionKey_1.SessionKey.Id]: cookie.sessionId
            });
        }
        else {
            Logger_1.loggerInstance().infoRequest(request, `Session cookie not found in request ${request.url}`);
            delete request.session;
        }
        next();
    });
};
const hash = (session) => {
    return crypto_1.default
        .createHash("sha1")
        .update(JSON.stringify(session.data), "utf8")
        .digest("hex");
};
//# sourceMappingURL=SessionMiddleware.js.map