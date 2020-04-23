import { expect } from "chai";
import { Session } from "../../src/session/model/Session";
import { SessionMiddleware } from "../../src/session/SessionMiddleware";
import { SessionStore } from "../../src/session/store/SessionStore";
import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import * as express from "express";
import { NextFunction } from "express";
import { CookieConfig } from "../../src/config/CookieConfig";
import { createSession } from "../utils/SessionGenerator";
import { Cookie } from "../../src/session/model/Cookie";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";


declare global {
    namespace Express {
        export interface Request {
            session?: Session;
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

            expect(request.session).to.eq(undefined);
            sessionStore.didNotReceive().load(Arg.any());
        });
    });

    describe("when cookie is present", () => {
        const session: Session = createSession(config.cookieSecret);
        const cookie: Cookie = Cookie.representationOf(session, config.cookieSecret);
        const request = { cookies: { [config.cookieName]: cookie.value } } as express.Request;
        const cookieArg = () => {
            return Arg.is(_ => _.value === cookie.value);
        };

        it("should load a session and insert the session object in the request", async () => {
            const sessionStore = Substitute.for<SessionStore>();
            sessionStore.load(cookieArg()).returns(new Promise<any>((res, rej) => res(session.data)));

            await SessionMiddleware(config, sessionStore)(request, Substitute.for<express.Response>(), nextFunction);

            expect(request.session.data).to.be.deep.equal(session.data);
        });

        it("should delete session alongside cookie and set the session object to undefined if session load fails", async () => {
            const sessionStore = Substitute.for<SessionStore>();
            sessionStore.load(cookieArg()).returns(new Promise((_, rej) => rej("")));
            sessionStore.delete(cookieArg()).returns(new Promise<void>((res, _) => res()));

            const response: SubstituteOf<express.Response> = Substitute.for<express.Response>();
            await SessionMiddleware(config, sessionStore)(request, response, nextFunction);

            expect(request.session).to.eq(undefined);
            sessionStore.received().delete(cookieArg() as any);
            response.received().clearCookie(config.cookieName);
        });
    });
});
