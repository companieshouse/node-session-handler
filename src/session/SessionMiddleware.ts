import { Request, Response, NextFunction, RequestHandler } from "express";
import { SessionStore } from "./store/SessionStore";
import { Failure } from "../error/FailureType";
import { Either, Just, Nothing } from "purify-ts";
import { VerifiedSession, Session } from "./model/Session";
import { CookieConfig } from "../config/CookieConfig";
import { wrapEitherFunction, wrapValue, wrapEither } from "../utils/EitherAsyncUtils";
import { Cookie } from "./model/Cookie";
import expressAsyncHandler from "express-async-handler";


export function SessionMiddleware(config: CookieConfig, sessionStore: SessionStore): RequestHandler {
    return initializeRequestHandler(config, sessionStore);
}

function initializeRequestHandler(config: CookieConfig, store: SessionStore): RequestHandler {

    if (!config.cookieSecret) {
        throw Error("Must provide secret of at least 16 bytes long encoded in base 64 string");
    }

    if (config.cookieSecret.length < 24) {
        throw Error("Secret must be at least 16 bytes (24 characters) long  encoded in base 64 string");
    }

    return expressAsyncHandler(sessionRequestHandler(config, store));
}

function sessionRequestHandler(config: CookieConfig, sessionStore: SessionStore): RequestHandler {

    return async (request: Request, response: Response, next: NextFunction): Promise<any> => {

        const sessionCookie = request.cookies[config.cookieName];

        if (sessionCookie) {

            const validateCookieString = wrapEitherFunction(
                Cookie.validateCookieString(config.cookieSecret));


            const loadSession: Either<Failure, VerifiedSession> =
                await wrapValue<Failure, string>(sessionCookie)
                    .chain<Cookie>(validateCookieString)
                    .chain<Cookie>(sessionStore.load)
                    .chain<Session>(wrapEitherFunction(Session.createInstance))
                    .chain<VerifiedSession>(session => wrapEither(session.verify()))
                    .run();

            const handleFailure = (failure: Failure) => validateCookieString(sessionCookie)
                .chain(sessionStore.delete)
                .map(_ => response.clearCookie(config.cookieName))
                .map(_ => failure.errorFunction(response));

            await loadSession.either(
                async (failure: Failure) => {
                    // request.session = undefined
                    request.session = Nothing;
                    await handleFailure(failure).run();
                },
                async (verifiedSession: VerifiedSession) => {
                    request.session = Just(verifiedSession);
                    response.cookie(config.cookieName, Cookie.asCookie(verifiedSession).value);
                    return await Promise.resolve();
                }
            );

        } else {
            // request.session = undefined
            request.session = Nothing;
        }

        return next();
    };
}

