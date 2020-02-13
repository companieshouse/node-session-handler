"use strict";
import { Request, Response, NextFunction } from "express";
import cookie from "cookie";
import { SessionStore } from "./session/SessionStore";
import { SessionId } from "./session/model/SessionId";
import { Failure } from "./error/FailureType";
import {
    liftEitherFunctionToAsyncEither, liftToAsyncEither
} from "./utils/EitherUtils";
import { Either } from "purify-ts";
import { VerifiedSession } from "./session/model/Session";

export class SessionMiddlerwareFactory {
    private sessionStore: SessionStore;

    constructor(sessionStore: SessionStore) {
        this.sessionStore = sessionStore;
    }

    public createSessionMiddleware = () =>
        async (request: Request, response: Response, next: NextFunction): Promise<void> => {
            const cookies = cookie.parse(request.headers.cookie || "");

            const sessionCookie = cookies.__SID;

            if (cookies.__SID) {

                const result = await this.tryToLoadValidSession(sessionCookie);
                result.either(
                    (failure: Failure) => failure.errorFunction(response),
                    (verifiedSession: VerifiedSession) => request.session = verifiedSession
                );

            }

            next();
        };

    private async tryToLoadValidSession(sessionCookie: string): Promise<Either<Failure, VerifiedSession>> {

        const validateSessionId = liftEitherFunctionToAsyncEither(SessionId.getValidatedSessionId);

        return liftToAsyncEither<Failure, string>(sessionCookie)
            .chain(validateSessionId)
            .chain(this.sessionStore.load).run();
    }
}

