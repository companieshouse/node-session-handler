import { Request, Response, NextFunction } from "express";
import { SessionStore } from "./session/SessionStore";
import { Failure } from "./error/FailureType";
import {liftEitherToAsyncEither} from "./utils/EitherUtils";
import { Either } from "purify-ts";
import { VerifiedSession } from "./session/model/Session";
import { SessionHandlerConfig } from "./SessionHandlerConfig";
import { Cookie } from "./session/model/Cookie";
import { log } from './error/ErrorFunctions';

export class SessionMiddlewareFactory {

    constructor(private readonly config: SessionHandlerConfig,
        private readonly sessionStore: SessionStore,
    ) {

        if (!config.cookieSecret) {
            throw Error("Must provide secret of at least 16 bytes (64 characters) long");
        }

        if (!config.defaultSessionExpiration) {
            throw Error("Must provide expiry period");
        }

        if (!config.cacheServer) {
            throw Error("Must provide redis url");
        }

        if (config.cookieSecret.length < 24) {
            console.log(config.cookieSecret.length);
            throw Error("Secret must be at least 16 bytes (24 characters) long");
        }

    }

    public handler = () =>
        async (request: Request, response: Response, next: NextFunction): Promise<any> => {

            const sessionCookie = request.cookies[this.config.cookieName];

            if (sessionCookie) {

                console.log("Cookie: " + sessionCookie);

                const result: Either<Failure, VerifiedSession> = await liftEitherToAsyncEither(
                    Cookie.validateCookieString(sessionCookie, this.config.cookieSecret)
                ).chain(this.sessionStore.load).run();

                result.either(
                    (failure: Failure) => {
                        failure.errorFunction(response)},
                    (verifiedSession: VerifiedSession) => {
                        request.session = verifiedSession;
                    }
                );

            } else {
                const newSession: VerifiedSession = VerifiedSession.createNewVerifiedSession(this.config);
                request.cookies[this.config.cookieName] = newSession.asCookie().value;
                await this.sessionStore.store(newSession).run().then(_ => request.session = newSession).catch(log);
            }

            return next();
        };

}

