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
Object.defineProperty(exports, "__esModule", { value: true });
const EitherUtils_1 = require("./utils/EitherUtils");
const Session_1 = require("./session/model/Session");
const Cookie_1 = require("./session/model/Cookie");
class SessionMiddlewareFactory {
    constructor(config, sessionStore) {
        this.config = config;
        this.sessionStore = sessionStore;
        this.handler = () => (request, response, next) => __awaiter(this, void 0, void 0, function* () {
            const sessionCookie = request.cookies[this.config.cookieName];
            if (sessionCookie) {
                console.log("Cookie: " + sessionCookie);
                const result = yield EitherUtils_1.liftEitherToAsyncEither(Cookie_1.Cookie.validateCookieString(sessionCookie, this.config.cookieSecret)).chain(this.sessionStore.load).run();
                result.either((failure) => {
                    failure.errorFunction(response);
                }, (verifiedSession) => {
                    request.session = verifiedSession;
                });
            }
            else {
                request.session = Session_1.VerifiedSession.createNewVerifiedSession(this.config);
            }
            response.cookie(this.config.cookieName, sessionCookie);
            return next();
        });
        if (!config.cookieSecret) {
            throw Error("Must provide secret of at least 16 bytes (64 characters) long");
        }
        if (!config.defaultSessionExpiration) {
            throw Error("Must provide expiry period");
        }
        if (!config.cacheServer) {
            throw Error("Must provide redis url");
        }
        if (config.cookieSecret.length < 24) {
            console.log(config.cookieSecret.length);
            throw Error("Secret must be at least 16 bytes (24 characters) long");
        }
    }
}
exports.SessionMiddlewareFactory = SessionMiddlewareFactory;
//# sourceMappingURL=SessionMiddlewareFactory.js.map