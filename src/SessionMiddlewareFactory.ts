import { Request, Response, NextFunction, RequestHandler } from "express";
import { SessionStore } from "./session/SessionStore";
import { Failure } from "./error/FailureType";
import { Either, Just, Nothing } from "purify-ts";
import { VerifiedSession, Session } from "./session/model/Session";
import { CookieConfig } from "./CookieConfig";
import expressAsyncHandler from "express-async-handler";
import { wrapEitherFunction, wrapValue, wrapEither } from "./utils/EitherAsyncUtils";
import { Cookie } from "./session/model/Cookie";


export class SessionMiddlewareFactory {

    constructor(private readonly config: CookieConfig,
        private readonly sessionStore: SessionStore,
    ) {
        if (!config.cookieSecret) {
            throw Error("Must provide secret of at least 16 bytes long encoded in base 64 string");
        }

        if (config.cookieSecret.length < 24) {
            throw Error("Secret must be at least 16 bytes (24 characters) long  encoded in base 64 string");
        }

    }

    public handler = (): RequestHandler => {

        const handler = async (request: Request, response: Response, next: NextFunction): Promise<any> => {

            const sessionCookie = request.cookies[this.config.cookieName];

            if (sessionCookie) {

                const validateCookieString = wrapEitherFunction(
                    Cookie.validateCookieString(this.config.cookieSecret));


                const loadSession: Either<Failure, VerifiedSession> =
                    await wrapValue<Failure, string>(sessionCookie)
                        .chain<Cookie>(validateCookieString)
                        .chain<Cookie>(this.sessionStore.load)
                        .chain<Session>(wrapEitherFunction(Session.createInstance))
                        .chain<VerifiedSession>(session => wrapEither(session.verify()))
                        .run();

                const handleFailure = (failure: Failure) => validateCookieString(sessionCookie)
                    .chain(this.sessionStore.delete)
                    .map(_ => response.clearCookie(this.config.cookieName))
                    .map(_ => failure.errorFunction(response));

                await loadSession.either(
                    async (failure: Failure) => {
                        request.session = Nothing;
                        await handleFailure(failure).run();
                    },
                    async (verifiedSession: VerifiedSession) => {
                        request.session = Just(verifiedSession);
                        response.cookie(this.config.cookieName, Cookie.asCookie(verifiedSession).value)
                        return await Promise.resolve();
                    }
                );

            } else {
                request.session = Nothing;
            }

            return next();
        };
        return expressAsyncHandler(handler);
    };

}

