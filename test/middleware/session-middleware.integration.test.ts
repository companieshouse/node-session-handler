import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { expect } from "chai";
import cookieParser from "cookie-parser"
import express, { NextFunction, Request, Response } from "express";
import request from "supertest"
import { CookieConfig } from "../../src/config/CookieConfig";

import { Cookie } from "../../src/session/model/Cookie";
import { Session } from "../../src/session/model/Session";
import { SessionMiddleware } from "../../src/session/SessionMiddleware";
import { SessionStore } from "../../src/session/store/SessionStore";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";
import { createSessionData } from "../utils/SessionGenerator";

declare global {
    namespace Express {
        export interface Request {
            session?: Session;
        }
    }
}

const config: CookieConfig = {
    cookieName: "__SID",
    cookieDomain: "localhost",
    cookieSecret: generateRandomBytesBase64(16),
    cookieTimeToLiveInSeconds: 360
};

const createApp = (sessionStore: SessionStore): express.Application => {
    const app = express()
    app.use(cookieParser())
    app.use(SessionMiddleware(config, sessionStore))
    app.get("/render", (req: Request, res: Response, next: NextFunction) => {
        if (req.query.mutate) {
            req.session.setExtraData("application", { mutated: true })
        }
        res.status(200).send("OK")
    })
    app.get("/redirect", (req: Request, res: Response, next: NextFunction) => {
        if (req.query.mutate) {
            req.session.setExtraData("application", { mutated: true })
        }
        res.redirect("http://localhost")
    })
    app.use((err: Error, req: Request, res: Response, next: NextFunction): void => {
        console.log(err)
        res.status(500).send("ERROR")
    })
    return app
}

describe("Session middleware - integration with express.js", () => {
    [{
        scenario: "render request", uri: "/render", validateResponse: (response: request.Response) => {
            expect(response.status).to.be.equal(200)
            expect(response.text).to.be.equal("OK")
        }
    }, {
        scenario: "redirect request", uri: "/redirect", validateResponse: (response: request.Response) => {
            expect(response.status).to.be.equal(302)
            expect(response.get("Location")).to.be.equal("http://localhost")
        }
    }].forEach(({ scenario, uri , validateResponse}) => {
        describe(`on ${scenario}`, () => {
            describe("when cookie is not present", () => {
                it("should respond but not persist session nor set session cookie in response", async () => {
                    const sessionStore = Substitute.for<SessionStore>();

                    await request(createApp(sessionStore))
                        .get(uri)
                        .expect(response => {
                            expect(response.get("Set-Cookie")).to.be.equal(undefined)
                            validateResponse(response)
                        })

                    sessionStore.didNotReceive().store(Arg.any(), Arg.any())
                })
            })

            describe("when cookie is present", () => {
                const cookie: Cookie = Cookie.createNew(config.cookieSecret);

                it("should respond but not persist session and delete session cookie if session load failed", async () => {
                    const sessionStore: SubstituteOf<SessionStore> = Substitute.for<SessionStore>();
                    sessionStore.load(cookie).rejects("Unexpected error in session loading");

                    await request(createApp(sessionStore))
                        .get(uri)
                        .set("Cookie", [`${config.cookieName}=${cookie.value}`])
                        .expect(response => {
                            expect(response.get("Set-Cookie")[0]).to.be.equal("__SID=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT")
                            validateResponse(response)
                        })

                    sessionStore.didNotReceive().store(Arg.any(), Arg.any())
                })

                // tslint:disable-next-line:max-line-length
                it("should respond but not persist session nor reset session cookie if session load succeeded but session didn't change", async () => {
                    const sessionStore: SubstituteOf<SessionStore> = Substitute.for<SessionStore>();
                    sessionStore.load(cookie).resolves(createSessionData(config.cookieSecret));

                    await request(createApp(sessionStore))
                        .get(uri)
                        .set("Cookie", [`${config.cookieName}=${cookie.value}`])
                        .expect(response => {
                            expect(response.get("Set-Cookie")).to.be.equal(undefined)
                            validateResponse(response)
                        })

                    sessionStore.didNotReceive().store(Arg.any(), Arg.any())
                })

                it("should respond and persist session and reset cookie if session load succeeded and session did change", async () => {
                    const sessionData: Record<string, any> = createSessionData(config.cookieSecret);

                    const sessionStore: SubstituteOf<SessionStore> = Substitute.for<SessionStore>();
                    sessionStore.load(cookie).resolves({ ...sessionData, extra_data: {} });
                    sessionStore.store(cookie, Arg.any()).resolves();

                    await request(createApp(sessionStore))
                        .get(uri + "?mutate=true")
                        .set("Cookie", [`${config.cookieName}=${cookie.value}`])
                        .expect(response => {
                            expect(response.get("Set-Cookie")[0]).to.be.satisfy((value: string) => {
                                return value.startsWith(`__SID=${cookie.value}; Max-Age=${config.cookieTimeToLiveInSeconds}; Domain=localhost; Path=/; Expires=`)
                                    && value.endsWith("; HttpOnly; Secure")
                            })
                            validateResponse(response)
                        })

                    sessionStore.received().store(cookie, {
                        ...sessionData,
                        extra_data: { application: { mutated: true } }
                    }, config.cookieTimeToLiveInSeconds)
                })

                it("should respond when session persistence failed", async () => {
                    const sessionData: Record<string, any> = createSessionData(config.cookieSecret);

                    const sessionStore: SubstituteOf<SessionStore> = Substitute.for<SessionStore>();
                    sessionStore.load(cookie).resolves({ ...sessionData, extra_data: {} });
                    sessionStore.store(cookie, Arg.any()).rejects("Unexpected error");

                    await request(createApp(sessionStore))
                        .get(uri + "?mutate=true")
                        .set("Cookie", [`${config.cookieName}=${cookie.value}`])
                        .expect(response => {
                            validateResponse(response)
                        })
                })
            })
        })
    })
})
