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
const purify_ts_1 = require("purify-ts");
const Session_1 = require("./session/model/Session");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const EitherAsyncUtils_1 = require("./utils/EitherAsyncUtils");
const Cookie_1 = require("./session/model/Cookie");
class SessionMiddlewareFactory {
    constructor(config, sessionStore) {
        this.config = config;
        this.sessionStore = sessionStore;
        this.handler = () => {
            const handler = (request, response, next) => __awaiter(this, void 0, void 0, function* () {
                const sessionCookie = request.cookies[this.config.cookieName];
                if (sessionCookie) {
                    const validateCookieString = EitherAsyncUtils_1.wrapEitherFunction(Cookie_1.Cookie.validateCookieString(this.config.cookieSecret));
                    const loadSession = yield EitherAsyncUtils_1.wrapValue(sessionCookie)
                        .chain(validateCookieString)
                        .chain(this.sessionStore.load)
                        .chain(EitherAsyncUtils_1.wrapEitherFunction(Session_1.Session.createInstance))
                        .chain(session => EitherAsyncUtils_1.wrapEither(session.verify()))
                        .run();
                    const handleFailure = (failure) => validateCookieString(sessionCookie)
                        .chain(this.sessionStore.delete)
                        .map(_ => response.clearCookie(this.config.cookieName))
                        .map(_ => failure.errorFunction(response));
                    yield loadSession.either((failure) => __awaiter(this, void 0, void 0, function* () {
                        request.session = purify_ts_1.Nothing;
                        yield handleFailure(failure).run();
                    }), (verifiedSession) => __awaiter(this, void 0, void 0, function* () {
                        request.session = purify_ts_1.Just(verifiedSession);
                        response.cookie(this.config.cookieName, Cookie_1.Cookie.asCookie(verifiedSession).value);
                        return yield Promise.resolve();
                    }));
                }
                else {
                    request.session = purify_ts_1.Nothing;
                }
                return next();
            });
            return express_async_handler_1.default(handler);
        };
        if (!config.cookieSecret) {
            throw Error("Must provide secret of at least 16 bytes long encoded in base 64 string");
        }
        if (config.cookieSecret.length < 24) {
            throw Error("Secret must be at least 16 bytes (24 characters) long  encoded in base 64 string");
        }
    }
}
exports.SessionMiddlewareFactory = SessionMiddlewareFactory;
//# sourceMappingURL=SessionMiddlewareFactory.js.map