import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import * as assert from "assert";
import { expect } from "chai";
import { Request, Response } from "express";
import { NextFunction } from "express";
import { SessionKey } from "../../src/session/keys/SessionKey";
import { CookieConfig } from "../../src/config/CookieConfig";
import { Session } from "../../src/session/model/Session";
import { SessionMiddleware } from "../../src/session/SessionMiddleware";
import { SessionStore } from "../../src/session/store/SessionStore";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";
import { createSession } from "../utils/SessionGenerator";
import { Cookie } from "../../src/session/model/Cookie";

declare global {
    namespace Express {
        export interface Request {
            session?: Session;
        }
    }
}

describe("Session middleware", () => {
    const config: CookieConfig = {
        cookieName: "__SID",
        cookieDomain: "localhost",
        cookieSecret: generateRandomBytesBase64(16),
    };
    const requestMetadata = { url: "/test-url", path: "/test-url", method: "GET" }
    const nextFunction = Substitute.for<NextFunction>();

    describe("middleware initialisation", () => {
        it("should fail when cookie name is missing", () => {
            [undefined, null, ""].forEach(cookieName => {
                expect(() => SessionMiddleware({ ...config, cookieName }, undefined))
                    .to.throw("Cookie name must be defined")
            });
        });

        it("should fail when cookie domain is missing", () => {
            [undefined, null, ""].forEach(cookieDomain => {
                expect(() => SessionMiddleware({ ...config, cookieDomain }, undefined))
                    .to.throw("Cookie domain must be defined")
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
        const request = {
            ...requestMetadata,
            cookies: {}
        } as Request;

        it("should not try to load a session", async () => {
            for (let createSessionWhenNotFound of [false, true]) {
                const sessionStore = Substitute.for<SessionStore>();

                await SessionMiddleware(config, sessionStore, createSessionWhenNotFound)(request, Substitute.for<Response>(), nextFunction);
                console.log(request);
                sessionStore.didNotReceive().load(Arg.any());
            }
        });

        describe('when session creation feature is enabled', () => {
            it("should create a session and insert session object in the request", async () => {
                const sessionStore = Substitute.for<SessionStore>();

                await SessionMiddleware(config, sessionStore, true)(request, Substitute.for<Response>(), nextFunction);
                console.log(request);
                expect(request.session).to.be.not.undefined
                expect(request.session.get(SessionKey.Id)).to.be.not.empty
                expect(request.session.get(SessionKey.ExtraData)).to.be.empty
            })
        })

        describe('when session creation feature is disabled', () => {
            it("should delete session object from the request", async () => {
                const sessionStore = Substitute.for<SessionStore>();

                await SessionMiddleware(config, sessionStore, false)(request, Substitute.for<Response>(), nextFunction);

                expect(request.session).to.be.undefined
            })
        })
    });

    describe("when cookie is present", () => {
        const session: Session = createSession(config.cookieSecret);
        const request = {
            ...requestMetadata,
            cookies: { [config.cookieName]: "" + session.get(SessionKey.Id) + session.get(SessionKey.ClientSig) }
        } as Request;
        const cookieArg = () => {
            return Arg.is((_: Cookie) => _.value === "" + session.get(SessionKey.Id) + session.get(SessionKey.ClientSig));
        };

        it("should load a session and insert session object in the request", async () => {
            for (let createSessionWhenNotFound of [false, true]) {
                const sessionStore = Substitute.for<SessionStore>();
                sessionStore.load(cookieArg()).returns(Promise.resolve(session.data));

                await SessionMiddleware(config, sessionStore, createSessionWhenNotFound)(request, Substitute.for<Response>(), nextFunction);

                expect(request.session.data).to.be.deep.equal(session.data);
            }
        });

        describe('when session creation feature is enabled', () => {
            it("should create session and insert session object in the request if session load fails", async () => {
                const sessionStore = Substitute.for<SessionStore>();
                sessionStore.load(cookieArg()).returns(Promise.reject("Unexpected error in session loading"));

                await SessionMiddleware(config, sessionStore, true)(request, Substitute.for<Response>(), nextFunction);

                expect(request.session).to.be.not.undefined;
                expect(request.session.get(SessionKey.Id)).to.be.not.empty;
                expect(request.session.get(SessionKey.ExtraData)).to.be.empty;
            })
        })

        describe('when session creation feature is disabled', () => {
            it("should delete session and delete session object from the request if session load fails", async () => {
                const sessionStore = Substitute.for<SessionStore>();
                sessionStore.load(cookieArg()).returns(Promise.reject("Unexpected error in session loading"));
                sessionStore.delete(cookieArg()).returns(Promise.resolve());

                const response: SubstituteOf<Response> = Substitute.for<Response>();
                await SessionMiddleware(config, sessionStore, false)(request, response, nextFunction);

                expect(request.session).to.eq(undefined);
                sessionStore.received().delete(cookieArg() as any);
            });

            it("should silently ignore error that happened when session was being deleted after session load failed", async () => {
                const sessionStore = Substitute.for<SessionStore>();
                sessionStore.load(cookieArg()).returns(Promise.reject("Unexpected error in session loading"));
                sessionStore.delete(cookieArg()).returns(Promise.reject("Unexpected error in session deletion"));

                const response: SubstituteOf<Response> = Substitute.for<Response>();
                try {
                    await SessionMiddleware(config, sessionStore, false)(request, response, nextFunction);
                } catch (e) {
                    assert.fail("Test should not have thrown error")
                }
            });
        })
    });
});
