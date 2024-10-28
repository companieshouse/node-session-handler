import cookieParser from "cookie-parser"
import express, { NextFunction, Request, Response } from "express";
import { CookieConfig } from "../../src/config/CookieConfig";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";
import { EnsureSessionCookiePresentMiddleware } from "../../src/session/EnsureCookiePresentMiddleware";
import { expect } from "chai";
import request from "supertest"


const createApp = () => {
    const app = express()
    app.use(cookieParser())
    const config: CookieConfig = {
        cookieName: "__SID",
        cookieDomain: "localhost",
        cookieSecret: generateRandomBytesBase64(16),
    };

    const ensureCookiePresentMiddleware = EnsureSessionCookiePresentMiddleware(config);

    app.use(ensureCookiePresentMiddleware)

    app.use("/my-endpoint-to-test", (req: Request, res: Response) => {
        res.status(200).send("OK")
    })

    return app;
}

describe("EnsureSessionCookiePresentMiddleware middleware - integration with express.js", () => {
    [
        {
            scenario: "is ok when session cookie set",
            cookies: {"__SID": "1234567"},
            validateResponse: (response: request.Response) => {
                expect(response.status).equals(200)
            },
        }, {
            scenario: "redirects when session cookie unset and no query parameter",
            cookies: {},
            validateResponse: (response: request.Response) => {
                expect(response.status).equals(302)
                expect(response.get("Location")).to.be.equal("/my-endpoint-to-test")
                expect(response.get("x-redirection-count")).to.be.equal("1")
            }
        }, {
            scenario: "responds with server error when session cookie unset and query parameter",
            headers: {"x-redirection-count": "1"},
            cookies: {},
            validateResponse: (response: request.Response) => {
                expect(response.status).equals(500)
            }
        }
    ].forEach(({scenario, headers, cookies, validateResponse}) => {
        it(scenario, async () => {
            let testRequest = request(createApp())
                .get("/my-endpoint-to-test");


            if (Object.keys(cookies).length > 0) {
                testRequest = testRequest.set("Cookie", Object.entries(cookies).map(([key, value]) => `${key}=${value}`))
            }

            if (headers) {
                for (const [headerName, headerValue] of Object.entries(headers)) {
                    testRequest = testRequest.set(headerName, headerValue)
                }
            }

            await testRequest
                .expect((response) => {
                    validateResponse(response)
                });
        })
    })
})
