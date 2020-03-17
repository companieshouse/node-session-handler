import { Either, Just, Nothing } from "purify-ts";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { Session, VerifiedSession } from "./model/Session";
import { wrapEither, wrapEitherFunction, wrapValue } from "../utils/EitherAsyncUtils";

import { Cookie } from "./model/Cookie";
import { CookieConfig } from "../config/CookieConfig";
import { Failure } from "../error/FailureType";
import { ISession } from "./model/SessionInterfaces";
import { SessionStore } from "./store/SessionStore";
import expressAsyncHandler from "express-async-handler";

export function SessionMiddleware(config: CookieConfig, sessionStore: SessionStore): RequestHandler {
    return initializeRequestHandler(config, sessionStore);
}

function initializeRequestHandler(config: CookieConfig, store: SessionStore): RequestHandler {

    const secretMinLength = 24;

    if (!config.cookieName) {
        throw Error("Cookie name must be defined");
    }
    if (!config.cookieSecret || config.cookieSecret.length < secretMinLength) {
        throw Error(`Cookie secret must be at least ${secretMinLength} chars long`);
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

            const validateCookieString = wrapEitherFunction(
                Cookie.validateCookieString(config.cookieSecret));

            const loadSession: Either<Failure, VerifiedSession> =
                await wrapValue<Failure, string>(sessionCookie)
                    .chain<Cookie>(validateCookieString)
                    .chain<ISession>(sessionStore.load)
                    .chain<Session>(wrapEitherFunction(Session.createInstance))
                    .chain<VerifiedSession>(session => wrapEither(session.verify()))
                    .run();

            await loadSession.either(
                async (failure: Failure) => {

                    await validateCookieString(sessionCookie)
                        .chain(sessionStore.delete)
                        .map(() => response.clearCookie(config.cookieName)).run();

                    request.session = Nothing;
                    failure.errorFunction(response);

                },
                async (verifiedSession: VerifiedSession) => {
                    console.log("Session verified");
                    request.session = Just(verifiedSession);
                    return Promise.resolve();
                }
            );

        } else {
            console.log(`REQUEST: ${request.url}`);
            console.log("No Session cookie.");
            request.session = Nothing;
        }

        return next();
    };
}
