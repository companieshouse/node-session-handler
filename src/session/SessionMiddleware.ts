import { NextFunction, Request, RequestHandler, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import onHeaders from "on-headers"
import { CookieConfig } from "../config/CookieConfig";
import { loggerInstance } from "../Logger";
import { Cookie, validateCookieSignature } from "./model/Cookie";
import { Session } from "./model/Session";
import { SessionStore } from "./store/SessionStore";
import crypto from "crypto"

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
                    loggerInstance().error(`Session deletion failed for cookie ${sessionCookie} due to error: ${sessionDeletionError}`);
                }
            }

            loggerInstance().error(`Session loading failed from cookie ${sessionCookie} due to error: ${sessionLoadingError}`);
            return undefined;
        }
    }

    return async (request: Request, response: Response, next: NextFunction): Promise<any> => {
        const sessionCookie: string = request.cookies[config.cookieName];
        let originalSessionHash: string;

        onHeaders(response, () => {
            if (request.session) {
                if (hash(request.session) !== originalSessionHash) {
                    response.cookie(config.cookieName, sessionCookie, {
                        domain: config.cookieDomain,
                        path: "/",
                        httpOnly: true,
                        secure: config.cookieSecureFlag || true,
                        maxAge: (config.cookieTimeToLiveInSeconds || 3600) * 1000,
                        encode: String
                    })
                }
            } else {
                if (sessionCookie) {
                    response.clearCookie(config.cookieName);
                }
            }
        });

        type MethodSignature = { (cb?: () => void): void; (chunk: any, cb?: () => void): void; (chunk: any, encoding: string, cb?: () => void): void }
        response.end = new Proxy(response.end, {
            async apply (target: MethodSignature, thisArg: any, argsArg?: any): Promise<any> {
                if (request.session != null && hash(request.session) !== originalSessionHash) {
                    try {
                        await sessionStore.store(Cookie.createFrom(sessionCookie), request.session.data)
                    } catch (err) {
                        loggerInstance().error(err.message)
                    }
                }
                return target.apply(thisArg, argsArg)
            }
        })

        if (sessionCookie) {
            loggerInstance().infoRequest(request, `Session cookie ${sessionCookie} found in request: ${request.url}`);
            request.session = await loadSession(sessionCookie);
            if (request.session != null) {
                originalSessionHash = hash(request.session)
            }
        } else {
            loggerInstance().infoRequest(request, `Session cookie not found in request ${request.url}`);
            delete request.session;
        }

        next();
    };
}

function hash(session: Session): string {
    return crypto
        .createHash("sha1")
        .update(JSON.stringify(session.data), "utf8")
        .digest("hex")
}
