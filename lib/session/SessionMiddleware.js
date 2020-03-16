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
const Session_1 = require("./model/Session");
const Cookie_1 = require("./model/Cookie");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
function SessionMiddleware(config, sessionStore) {
    return initializeRequestHandler(config, sessionStore);
}
exports.SessionMiddleware = SessionMiddleware;
function initializeRequestHandler(config, store) {
    if (!config.cookieName) {
        throw Error("Cookie name must be defined");
    }
    if (!config.cookieSecret || config.cookieSecret.length < 24) {
        throw Error("Cookie secret must be at least 24 chars long");
    }
    return express_async_handler_1.default(sessionRequestHandler(config, store));
}
function sessionRequestHandler(config, sessionStore) {
    return (request, response, next) => __awaiter(this, void 0, void 0, function* () {
        const sessionCookie = request.cookies[config.cookieName];
        if (sessionCookie) {
            console.log("Got a session cookie.");
            console.log(`REQUEST: ${request.url}`);
            console.log(`COOKIE: ${sessionCookie}`);
            try {
                const cookie = Cookie_1.Cookie.validateCookieString(config.cookieSecret, sessionCookie);
                const sessionData = yield sessionStore.load(cookie);
                const session = Session_1.Session.createInstance(sessionData);
                session.verify();
                request.session = session;
            }
            catch (err) {
                console.error(err);
                response.clearCookie(config.cookieName);
                delete request.session;
                try {
                    const cookie = Cookie_1.Cookie.validateCookieString(config.cookieSecret, sessionCookie);
                    sessionStore.delete(cookie);
                }
                catch (_) {
                    console.error(_);
                }
            }
        }
        else {
            console.log(`REQUEST: ${request.url}`);
            console.log("No Session cookie.");
            delete request.session;
        }
        return next();
    });
}
//# sourceMappingURL=SessionMiddleware.js.map