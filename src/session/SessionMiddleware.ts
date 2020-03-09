import { Request, Response, NextFunction, RequestHandler } from "express";
import { SessionStore } from "./store/SessionStore";
import { Failure } from "../error/FailureType";
import { Either, Just, Nothing } from "purify-ts";
import { VerifiedSession, Session } from "./model/Session";
import { CookieConfig } from "../config/CookieConfig";
import { wrapEitherFunction, wrapValue, wrapEither } from "../utils/EitherAsyncUtils";
import { Cookie } from "./model/Cookie";
import expressAsyncHandler from "express-async-handler";
import { appLogger } from "../error/ErrorFunctions"


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
        appLogger().debug(`Sesssion Cookie: ${sessionCookie}`)

        if (sessionCookie) {

            console.log("Got a session cookie.");
            console.log(`REQUEST: ${request.url}`)
            console.log(`COOKIE: ${sessionCookie}`);

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
                .map(_ => failure.errorFunction(request));

            await loadSession.either(
                async (failure: Failure) => {
                    appLogger().info(`Error occurred in session load sequence. Handling failure...`);
                    request.session = Nothing;
                    failure.errorFunction(request);
                    await handleFailure(failure).run();

                },
                async (verifiedSession: VerifiedSession) => {
                    appLogger().info(`Session loaded successfully!`)
                    request.session = Just(verifiedSession);
                    return await Promise.resolve();
                }
            );

        } else {
            console.log(`REQUEST: ${request.url}`)
            console.log("No Session cookie.");
            request.session = Nothing;
        }

        return next();
    };
}
