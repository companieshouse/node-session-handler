import { Request, Response, NextFunction, RequestHandler } from "express";
import { SessionStore } from "./store/SessionStore";
import { Session } from "./model/Session";
import { CookieConfig } from "../config/CookieConfig";
import { Cookie, validateCookieSignature } from "./model/Cookie";
import expressAsyncHandler from "express-async-handler";

export function SessionMiddleware(config: CookieConfig, sessionStore: SessionStore): RequestHandler {
    return initializeRequestHandler(config, sessionStore);
}

function initializeRequestHandler(config: CookieConfig, store: SessionStore): RequestHandler {
    if (!config.cookieName) {
        throw Error("Cookie name must be defined");
    }
    if (!config.cookieSecret || config.cookieSecret.length < 24) {
        throw Error("Cookie secret must be at least 24 chars long");
    }

    return expressAsyncHandler(sessionRequestHandler(config, store));
}

function sessionRequestHandler(config: CookieConfig, sessionStore: SessionStore): RequestHandler {

    return async (request: Request, response: Response, next: NextFunction): Promise<any> => {

        const sessionCookie = request.cookies[config.cookieName];

        if (sessionCookie) {

            console.log("Got a session cookie.");
            console.log(`REQUEST: ${request.url}`);
            console.log(`COOKIE: ${sessionCookie}`);

            try {
                validateCookieSignature(sessionCookie, config.cookieSecret)

                const cookie = Cookie.createFrom(sessionCookie);
                const sessionData = await sessionStore.load(cookie);
                const session = Session.createInstance(sessionData);
                session.verify();
                request.session = session;

            } catch (err) {

                console.error(err);
                response.clearCookie(config.cookieName);
                delete request.session;

                try {
                    const cookie = Cookie.createFrom(sessionCookie);
                    sessionStore.delete(cookie);
                } catch (_) {
                    console.error(_);
                }

            }

        } else {
            console.log(`REQUEST: ${request.url}`);
            console.log("No Session cookie.");
            delete request.session;
        }

        return next();
    };
}
