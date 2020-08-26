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
import { generateSessionId, generateSignature } from '../utils/CookieUtils';

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
    async function loadSession (sessionCookie: string): Promise<Session | undefined> {

        loggerInstance().infoRequest(`loading session for session cookie: ${sessionCookie}`);

        let cookie: Cookie;
        try {
            validateCookieSignature(sessionCookie, config.cookieSecret);
            cookie = Cookie.createFrom(sessionCookie);

            loggerInstance().infoRequest(`created new cookie ${JSON.stringify(cookie)} from sessionCookie`);
            const sessionData = await sessionStore.load(cookie);

            loggerInstance().infoRequest(`session data ${JSON.stringify(sessionData)}`);
            const session = new Session(sessionData);

            // session.verify();

            loggerInstance().debug(`Session successfully loaded from cookie ${sessionCookie}`);
            return session;
        } catch (sessionLoadingError) {
            loggerInstance().infoRequest(`unable to load session`);
            if (cookie) {

                loggerInstance().infoRequest(`however we do have a cookie: ${JSON.stringify(cookie)}`);
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

        loggerInstance().infoRequest(`session cookie is ${sessionCookie}`);

        let originalSessionHash: string;

        onHeaders(response, () => {

            loggerInstance().infoRequest(`request.session is ${JSON.stringify(request.session)}`);
            if (request.session) {
                loggerInstance().infoRequest(`we have a session, checking hash against original session hash`);
                if (hash(request.session) !== originalSessionHash) {
                    loggerInstance().infoRequest(`hash does not match, setting response`);
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
                loggerInstance().infoRequest(`no session found, session cookie is: ${sessionCookie}`);
                if (sessionCookie) {
                    response.clearCookie(config.cookieName);
                }
            }
        });

        type MethodSignature = { (cb?: () => void): void; (chunk: any, cb?: () => void): void; (chunk: any, encoding: string, cb?: () => void): void }
        response.end = new Proxy(response.end, {
            async apply (target: MethodSignature, thisArg: any, argsArg?: any): Promise<any> {
                if (request.session != null && hash(request.session) !== originalSessionHash) {

                    loggerInstance().infoRequest(`session is not null, but hashes are not equal... attempting to store a new cookie`);

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

        loggerInstance().infoRequest(`now, do we have a sessionCookie? ${sessionCookie}`);

        if (sessionCookie) {
            loggerInstance().infoRequest(request, `Session cookie ${sessionCookie} found in request: ${request.url}`);
            request.session = await loadSession(sessionCookie);
            if (request.session != null) {
                loggerInstance().infoRequest(`session is not null, setting original hash`);
                originalSessionHash = hash(request.session)
            }
        } else {
            // if there is no cookie, we need to create a new session
            loggerInstance().infoRequest(request, `Session cookie not found in request ${request.url}, creating new session`);

            const session = new Session();
            // const cookie: Cookie = Cookie.createNew(config.cookieSecret);
            const sessionId = generateSessionId();
            loggerInstance().infoRequest(`generated sessionId: ${sessionId}`);
            const signature = generateSignature(sessionId, config.cookieSecret);
            loggerInstance().infoRequest(`generated signature: ${signature}`);
            session.data = { [SessionKey.Id]: sessionId + signature };

            // store cookie session in Redis
            // await sessionStore.store(cookie, session.data, 3600);

            // set the cookie for future requests
            request.session = session;
            loggerInstance().infoRequest(`applying to session: ${JSON.stringify(request.session)}`);
            // response.cookie(config.cookieName, session.data[SessionKey.Id]);
        }

        loggerInstance().infoRequest(`next...`);
        next();
    };
}

const hash = (session: Session): string => {
    return crypto
        .createHash("sha1")
        .update(JSON.stringify(session.data), "utf8")
        .digest("hex")
}
