import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { expect } from "chai";
import * as express from "express";
import { NextFunction } from "express";
import { SessionKey } from "../../src/session/keys/SessionKey";
import { CookieConfig } from "../../src/config/CookieConfig";
import { Session } from "../../src/session/model/Session";
import { SessionMiddleware } from "../../src/session/SessionMiddleware";
import { SessionStore } from "../../src/session/store/SessionStore";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";
import { createSession, createSessionData } from "../utils/SessionGenerator";


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
        const sessionData = createSessionData(config.cookieSecret)
        const session: Session = new Session(sessionData);
        const request = { cookies: { [config.cookieName]: "" + session.get(SessionKey.Id) + session.get(SessionKey.ClientSig) } } as express.Request;
        const cookieArg = () => {
            return Arg.is(_ => _.value === "" + session.get(SessionKey.Id) + session.get(SessionKey.ClientSig));
        };

        it("should load a session and insert the session object in the request", async () => {
            const sessionStore = Substitute.for<SessionStore>();
            sessionStore.load(cookieArg()).returns(Promise.resolve(sessionData));

            await SessionMiddleware(config, sessionStore)(request, Substitute.for<express.Response>(), nextFunction);

            // @ts-ignore
            expect(request.session.data).to.be.deep.equal(sessionData);
        });

        it("should delete session alongside cookie and set the session object to undefined if session load fails", async () => {
            const sessionStore = Substitute.for<SessionStore>();
            sessionStore.load(cookieArg()).returns(Promise.reject(""));
            sessionStore.delete(cookieArg()).returns(Promise.resolve());

            const response: SubstituteOf<express.Response> = Substitute.for<express.Response>();
            await SessionMiddleware(config, sessionStore)(request, response, nextFunction);

            expect(request.session).to.eq(undefined);
            sessionStore.received().delete(cookieArg() as any);
            response.received().clearCookie(config.cookieName);
        });
    });
});
