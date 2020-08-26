import { NextFunction, Request, RequestHandler, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import onHeaders from "on-headers"
import { CookieConfig } from "../config/CookieConfig";
import { loggerInstance } from "../Logger";
import { Cookie, validateCookieSignature } from "./model/Cookie";
import { Session } from "./model/Session";
import { SessionStore } from "./store/SessionStore";
import crypto from "crypto"
import { SessionKey } from "./keys/SessionKey";
import { generateSessionId, generateSignature } from "../utils/CookieUtils";

const DEFAULT_COOKIE_SECURE_FLAG = true;
const DEFAULT_COOKIE_TIME_TO_LIVE_IN_SECONDS = 3600;

export function SessionMiddleware(config: CookieConfig, sessionStore: SessionStore): RequestHandler {
    if (!config.cookieName) {
        throw Error("Cookie name must be defined");
    }
    if (!config.cookieDomain) {
        throw Error("Cookie domain must be defined");
    }
    if (!config.cookieSecret || config.cookieSecret.length < 24) {
        throw Error("Cookie secret must be at least 24 chars long");
    }

    return expressAsyncHandler(sessionRequestHandler(config, sessionStore));
}

const sessionRequestHandler = (config: CookieConfig, sessionStore: SessionStore): RequestHandler => {

    async function loadSessionBySessionCookie (sessionCookie: string): Promise<Session | undefined> {

        loggerInstance().info(`loading session for session cookie: ${sessionCookie}`);

        let cookie: Cookie;
        try {
            validateCookieSignature(sessionCookie, config.cookieSecret);
            cookie = Cookie.createFrom(sessionCookie);

            loggerInstance().info(`created new cookie ${JSON.stringify(cookie)} from sessionCookie`);
            const sessionData = await sessionStore.load(cookie);

            loggerInstance().info(`session data ${JSON.stringify(sessionData)}`);
            const session = new Session(sessionData);

            // session.verify();

            loggerInstance().debug(`Session successfully loaded from cookie ${sessionCookie}`);
            return session;
        } catch (sessionLoadingError) {
            loggerInstance().info(`unable to load session`);
            if (cookie) {

                loggerInstance().info(`however we do have a cookie: ${JSON.stringify(cookie)}`);
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
        let sessionCookie: string = request.cookies[config.cookieName];

        loggerInstance().info(`session cookie is ${sessionCookie}`);

        let originalSessionHash: string;

        onHeaders(response, () => {

            loggerInstance().info(`request.session is ${JSON.stringify(request.session)}`);
            if (request.session) {
                loggerInstance().info(`we have a session, checking hash against original session hash`);
                if (hash(request.session) !== originalSessionHash) {
                    loggerInstance().info(`hash does not match, setting response`);
                    response.cookie(config.cookieName, sessionCookie, {
                        domain: config.cookieDomain,
                        path: "/",
                        httpOnly: true,
                        secure: config.cookieSecureFlag || DEFAULT_COOKIE_SECURE_FLAG,
                        maxAge: (config.cookieTimeToLiveInSeconds || DEFAULT_COOKIE_TIME_TO_LIVE_IN_SECONDS) * 1000,
                        encode: String
                    })
                }
            } else {
                loggerInstance().info(`no session found, session cookie is: ${sessionCookie}`);
                if (sessionCookie) {
                    response.clearCookie(config.cookieName);
                }
            }
        });

        type MethodSignature = { (cb?: () => void): void; (chunk: any, cb?: () => void): void; (chunk: any, encoding: string, cb?: () => void): void }
        response.end = new Proxy(response.end, {
            async apply (target: MethodSignature, thisArg: any, argsArg?: any): Promise<any> {
                if (request.session != null && hash(request.session) !== originalSessionHash) {

                    loggerInstance().info(`session is not null, but hashes are not equal... attempting to store a new cookie`);

                    try {
                        await sessionStore.store(Cookie.createFrom(sessionCookie), request.session.data,
                            config.cookieTimeToLiveInSeconds || DEFAULT_COOKIE_TIME_TO_LIVE_IN_SECONDS)
                    } catch (err) {
                        loggerInstance().error(err.message)
                    }
                }
                return target.apply(thisArg, argsArg)
            }
        })

        loggerInstance().info(`now, do we have a sessionCookie? ${sessionCookie}`);

        if (!sessionCookie) {
            const cookie: Cookie = await createSessionCookie(request, config, response, sessionStore);
            sessionCookie = cookie.sessionId;
            return next();
        }
        loggerInstance().infoRequest(request, `Session cookie ${sessionCookie} found in request: ${request.url}`);
        request.session = await loadSessionBySessionCookie(sessionCookie);
        if (request.session != null) {
            loggerInstance().info(`session is not null, setting original hash`);
            originalSessionHash = hash(request.session)
        }
        loggerInstance().info(`next...`);
        next();
    };
}

const createSessionCookie = async (request: Request, config: CookieConfig, response: Response, sessionStore: SessionStore): Promise<Cookie> => {
    // if there is no cookie, we need to create a new session
    loggerInstance().infoRequest(request, `Session cookie not found in request ${request.url}, creating new session`);

    const cookie: Cookie = Cookie.createNew(config.cookieSecret);

    const session = new Session();
    session.data = {[SessionKey.Id]: cookie.value};
    loggerInstance().info(`session data to be stored: ${session.data}`);

    // try {
    //     // store cookie session in Redis
    //     await sessionStore.store(cookie, session.data, 3600);
    //     loggerInstance().info(`cookie stored in session store`);
    // } catch (err) {
    //     loggerInstance().error(err.message)
    // }
    //
    // // set the cookie for future requests
    request.session = session;
    // loggerInstance().info(`applying to session: ${JSON.stringify(request.session)}`);

    response.cookie(config.cookieName, session.data[SessionKey.Id]);

    return cookie
}

const hash = (session: Session): string => {
    return crypto
        .createHash("sha1")
        .update(JSON.stringify(session.data), "utf8")
        .digest("hex")
}
