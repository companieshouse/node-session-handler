import { expect } from "chai";
import { Session, VerifiedSession } from "../../src/session/model/Session";
import { SessionMiddleware } from "../../src/session/SessionMiddleware";
import { SessionStore } from "../../src/session/store/SessionStore";
import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import * as express from "express";
import { NextFunction } from "express";
import { CookieConfig } from "../../src/config/CookieConfig";
import { getValidSessionObject } from "../utils/SessionGenerator";
import { Cookie } from "../../src/session/model/Cookie";
import { Either, Left, Maybe } from "purify-ts";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";
import { Failure } from "../../src/error/FailureType";
import { wrapEither, wrapValue } from "../../src/utils/EitherAsyncUtils";

declare global {
    namespace Express {
        export interface Request {
            session: Maybe<Session>;
        }
    }
}

describe("Session Middleware", () => {
    const config: CookieConfig = {
        cookieName: "__SID",
        cookieSecret: generateRandomBytesBase64(16),
    };
    const nextFunction = Substitute.for<NextFunction>();

    describe("middleware initialisation", () => {
        it("should fail when cookie name is missing", () => {
            [undefined, null, ""].forEach(cookieName => {
                expect(() => SessionMiddleware({ ...config, cookieName }, undefined))
                    .to.throw("Cookie name must be defined")
            });
        });

        it("should fail when cookie secret is missing or too short", () => {
            [undefined, null, "", "12345678901234567890123"].forEach(cookieSecret => {
                expect(() => SessionMiddleware({ ...config, cookieSecret }, undefined))
                    .to.throw("Cookie secret must be at least 24 chars long")
            });
        });
    });

    describe("when cookie is not present", () => {
        const request = { cookies: {} } as express.Request;

        it("should not try to load a session and set session object to Nothing", async () => {
            const sessionStore = Substitute.for<SessionStore>();

            await SessionMiddleware(config, sessionStore)(request, Substitute.for<express.Response>(), nextFunction);

            expect(request.session.isNothing()).to.eq(true);
            sessionStore.didNotReceive().load(Arg.any());
        });
    });

    describe("when cookie is present", () => {
        const session: VerifiedSession = getValidSessionObject(config);
        const cookie: Cookie = Cookie.createFrom(session);
        const request = { cookies: { [config.cookieName]: cookie.value } } as express.Request;
        const cookieArg = () => {
            return Arg.is(_ => _.value === cookie.value);
        };

        it("should load a session and insert the session object in the request", async () => {
            const sessionStore = Substitute.for<SessionStore>();
            sessionStore.load(cookieArg()).returns(wrapEither(Either.of(session.data)));

            await SessionMiddleware(config, sessionStore)(request, Substitute.for<express.Response>(), nextFunction);

            expect(request.session.isJust()).to.equal(true);
            expect(request.session.extract().data).to.be.deep.equal(session.data);
        });

        it("should delete session alongside cookie and set the session object to Nothing if session load fails", async () => {
            const sessionStore = Substitute.for<SessionStore>();
            sessionStore.load(cookieArg()).returns(wrapEither(Left(Failure(_ => console.log("Fail")))));
            sessionStore.delete(cookieArg()).returns(wrapValue(1));

            const response: SubstituteOf<express.Response> = Substitute.for<express.Response>();
            await SessionMiddleware(config, sessionStore)(request, response, nextFunction);

            expect(request.session.isNothing()).to.eq(true);
            sessionStore.received().delete(cookieArg() as any);
            response.received().clearCookie(config.cookieName);
        });
    });
});
