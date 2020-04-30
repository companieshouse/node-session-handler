import { Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { expect } from "chai";
import cookieParser from "cookie-parser"
import express, { Response } from "express";
import request from "supertest"
import { CookieConfig } from "../../src/config/CookieConfig";

import { Cookie } from "../../src/session/model/Cookie";
import { Session } from "../../src/session/model/Session";
import { SessionMiddleware } from "../../src/session/SessionMiddleware";
import { SessionStore } from "../../src/session/store/SessionStore";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";

declare global {
    namespace Express {
        export interface Request {
            session?: Session;
        }
    }
}

const config: CookieConfig = {
    cookieName: "__SID",
    cookieSecret: generateRandomBytesBase64(16),
};

const createApp = (sessionStore: SessionStore): express.Application => {
    const app = express()
    app.use(cookieParser())
    app.use(SessionMiddleware(config, sessionStore))
    return app
}

describe("Session middleware", () => {
    describe("when cookie is present", () => {
        it("should delete cookie if session load fails", async () => {
            const cookie: Cookie = Cookie.createNew(config.cookieSecret);

            const sessionStore: SubstituteOf<SessionStore> = Substitute.for<SessionStore>();
            sessionStore.load(cookie).rejects("Unexpected error in session loading");

            const app = createApp(sessionStore);
            await request(app)
                .get("/")
                .set("Cookie", [`${config.cookieName}=${cookie.value}`])
                .expect((response: Response) => {
                    expect(response.get("Set-Cookie")[0]).to.be.equal("__SID=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT")
                })
        })
    })

})
