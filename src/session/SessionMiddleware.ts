import { Request, Response, NextFunction, RequestHandler } from "express";
import { SessionStore } from "./store/SessionStore";
import { Session } from "./model/Session";
import { CookieConfig } from "../config/CookieConfig";
import { Cookie, validateCookieSignature } from "./model/Cookie";
import expressAsyncHandler from "express-async-handler";
import { loggerInstance } from "../Logger";

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

            loggerInstance().infoRequest(request, `Session cookie ${sessionCookie} found in request: ${request.url}`);

            try {
                validateCookieSignature(sessionCookie, config.cookieSecret);
                const cookie = Cookie.createFrom(sessionCookie);
                const sessionData = await sessionStore.load(cookie);
                const session = new Session(sessionData);
                session.verify();
                request.session = session;
                loggerInstance().debug(`Session successfully loaded from cookie ${sessionCookie}`)

            } catch (err) {

                loggerInstance().error(`Session loading failed from cookie ${sessionCookie} due to error: ${err}`);
                response.clearCookie(config.cookieName);
                delete request.session;


                try {
                    const cookie = Cookie.createFrom(sessionCookie);
                    sessionStore.delete(cookie);
                } catch (err) {
                    loggerInstance().error(err);
                }

            }

        } else {
            loggerInstance().infoRequest(request, `Session cookie ${sessionCookie} not found in request ${request.url}`);
            delete request.session;
        }

        return next();
    };
}
