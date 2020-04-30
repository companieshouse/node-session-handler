import { NextFunction, Request, RequestHandler, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import onHeaders from "on-headers"
import { CookieConfig } from "../config/CookieConfig";
import { loggerInstance } from "../Logger";
import { Cookie, validateCookieSignature } from "./model/Cookie";
import { Session } from "./model/Session";
import { SessionStore } from "./store/SessionStore";

export function SessionMiddleware(config: CookieConfig, sessionStore: SessionStore): RequestHandler {
    if (!config.cookieName) {
        throw Error("Cookie name must be defined");
    }
    if (!config.cookieSecret || config.cookieSecret.length < 24) {
        throw Error("Cookie secret must be at least 24 chars long");
    }

    return expressAsyncHandler(sessionRequestHandler(config, sessionStore));
}

function sessionRequestHandler(config: CookieConfig, sessionStore: SessionStore): RequestHandler {
    async function loadSession (sessionCookie: string): Promise<Session | undefined> {
        let cookie: Cookie;
        try {
            validateCookieSignature(sessionCookie, config.cookieSecret);
            cookie = Cookie.createFrom(sessionCookie);
            const sessionData = await sessionStore.load(cookie);
            const session = new Session(sessionData);
            session.verify();

            loggerInstance().debug(`Session successfully loaded from cookie ${sessionCookie}`);
            return session;
        } catch (sessionLoadingError) {
            if (cookie) {
                try {
                    await sessionStore.delete(cookie);
                } catch (sessionDeletionError) {
                    loggerInstance().error(sessionDeletionError);
                }
            }

            loggerInstance().error(`Session loading failed from cookie ${sessionCookie} due to error: ${sessionLoadingError}`);
            return undefined;
        }
    }

    return async (request: Request, response: Response, next: NextFunction): Promise<any> => {
        const sessionCookie: string = request.cookies[config.cookieName];

        onHeaders(response, () => {
            if (request.session) {
                response.cookie(config.cookieName, sessionCookie, {
                    domain: config.cookieDomain,
                    path: "/",
                    httpOnly: true,
                    secure: config.cookieSecureFlag || true,
                    maxAge: (config.cookieTimeToLiveInSeconds || 3600) * 1000,
                    encode: String
                })
            } else {
                if (sessionCookie) {
                    response.clearCookie(config.cookieName);
                }
            }
        });

        if (sessionCookie) {
            loggerInstance().infoRequest(request, `Session cookie ${sessionCookie} found in request: ${request.url}`);
            request.session = await loadSession(sessionCookie);
        } else {
            loggerInstance().infoRequest(request, `Session cookie not found in request ${request.url}`);
            delete request.session;
        }

        return next();
    };
}
