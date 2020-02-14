import { Request, Response, NextFunction } from "express";
import { SessionStore } from "./session/SessionStore";
import { Failure } from "./error/FailureType";
import {liftEitherToAsyncEither} from "./utils/EitherUtils";
import { Either } from "purify-ts";
import { VerifiedSession } from "./session/model/Session";
import { SessionHandlerConfig } from "./SessionHandlerConfig";
import { Cookie } from "./session/model/Cookie";

export class SessionMiddlerware {

    constructor(private readonly config: SessionHandlerConfig,
        private readonly sessionStore: SessionStore,
    ) {

        if (!config.sessionSecret) {
            throw Error("Must provide secret of at least 16 bytes (64 characters) long");
        }

        if (!config.expiryPeriod) {
            throw Error("Must provide expiry period");
        }

        if (!config.redisUrl) {
            throw Error("Must provide redis url");
        }

        if (config.sessionSecret.length < 24) {
            console.log(config.sessionSecret.length);
            throw Error("Secret must be at least 16 bytes (24 characters) long");
        }

    }

    public handler = () =>
        async (request: Request, response: Response, next: NextFunction): Promise<any> => {

            const sessionCookie = request.cookies.__SID;

            if (sessionCookie) {

                console.log("Cookie: " + sessionCookie);

                const result: Either<Failure, VerifiedSession> = await liftEitherToAsyncEither(
                    Cookie.validateCookieString(sessionCookie, this.config.sessionSecret)
                ).chain(this.sessionStore.load).run();

                result.either(
                    (failure: Failure) => {
                        failure.errorFunction(response)},
                    (verifiedSession: VerifiedSession) => {
                        request.session = verifiedSession;
                    }
                );

            }

            return next();
        };

}

