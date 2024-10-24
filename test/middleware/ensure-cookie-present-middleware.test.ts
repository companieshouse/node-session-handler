import { CookieConfig } from "../../src/config/CookieConfig";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";
import { EnsureSessionCookiePresentMiddleware } from "../../src/session/EnsureCookiePresentMiddleware";
import { NextFunction, Request, Response } from "express";
import { Arg, Substitute } from "@fluffy-spoon/substitute";
import { expect } from "chai";

describe("EnsureSessionCookiePresentMiddleware", () => {
    let request = Substitute.for<Request>();
    let response = Substitute.for<Response>();
    let nextFunction = Substitute.for<NextFunction>();

    const config: CookieConfig = {
        cookieName: "__SID",
        cookieDomain: "localhost",
        cookieSecret: generateRandomBytesBase64(16),
    };

    const ensureCookiePresentMiddleware = EnsureSessionCookiePresentMiddleware(config);

    beforeEach(() => {
        request = Substitute.for<Request>();
        response = Substitute.for<Response>();
        nextFunction = Substitute.for<NextFunction>();
    })

    it("calls next when cookie is present", () => {
        const nextCalls: any[] = [];
        request.cookies.returns({
            "__SID": "12344567"
        })

        const nextMock = () => {
            nextCalls.push(undefined)
        }

        ensureCookiePresentMiddleware(request, response, nextMock)

        expect(nextCalls).to.be.length(1)
    });

    it("calls redirect when no cookie in request", () => {
        request.cookies.returns({})
        request.originalUrl.returns("http://localhost:8080/registered-email")

        response.header(Arg.any(), Arg.any()).returns(response);
        request.get("x-redirection-count").returns(undefined)

        ensureCookiePresentMiddleware(request, response, nextFunction)

        response.received(1).header("x-redirection-count", "1")
        response.received(1).redirect("http://localhost:8080/registered-email")
    })

    it("throws an error when is a redirect and no session cookie", () => {
        request.cookies.returns({})
        request.originalUrl.returns("http://localhost:8080/registered-email")
        request.get("x-redirection-count").returns("1")

        expect(() => ensureCookiePresentMiddleware(request, response, nextFunction)).to.throw("Session Cookie Not Set")
    })
})

const modifyingDefaultsScenarios = [{
    header: "otherRedirect"
}, {
    headerValue: "yes"
}, {
    header: "otherRedirect",
    headerValue: "yes"
}]

modifyingDefaultsScenarios.forEach(({ header, headerValue }) => {
    describe(`EnsureSessionCookiePresentMiddleware with custom redirection properties header=${header}, value=${headerValue}`, () => {
        let request = Substitute.for<Request>();
        let response = Substitute.for<Response>();
        let nextFunction = Substitute.for<NextFunction>();

        const config = {
            cookieName: "__SID",
            redirectHeaderName: header,
            redirectHeaderValue: headerValue
        };

        let ensureCookiePresentMiddleware = EnsureSessionCookiePresentMiddleware(config);

        beforeEach(() => {
            request = Substitute.for<Request>();
            response = Substitute.for<Response>();
            nextFunction = Substitute.for<NextFunction>();
            ensureCookiePresentMiddleware = EnsureSessionCookiePresentMiddleware(config);
        })

        it(`redirects with header`, () => {
            const expectedheader = header || "x-redirection-count";
            const expectedheaderValue = headerValue || "1";
            
            request.cookies.returns({})
            request.originalUrl.returns("http://localhost:8080/registered-email")

            response.header(Arg.any(), Arg.any()).returns(response);
            request.get("x-redirection-count").returns(undefined);
            response.header(Arg.any(), Arg.any()).returns(response);

            ensureCookiePresentMiddleware(request, response, nextFunction)

            response.received(1).header(expectedheader, expectedheaderValue)
            response.received(1).redirect(`http://localhost:8080/registered-email`)
        })

        it(`calls next when cookie present`, () => {
            request.cookies.returns({
                "__SID": "3485869"
            })
            const actualHeader = header || "x-redirection-count";
            const actualHeaderValue = headerValue || "1";
            
            request.originalUrl.returns("http://localhost:8080/registered-email")
            request.headers = {
                [actualHeader]: actualHeaderValue
            }

            response.header(Arg.any(), Arg.any()).returns(response);

            const nextCalls: any[] = [];

            const nextMock = () => {
                nextCalls.push(undefined)
            }

            ensureCookiePresentMiddleware(request, response, nextMock)

            expect(nextCalls).to.be.length(1)
        })

        it(`errors when no cookie and header in request`, () => {
            const actualheader = header || "x-redirection-count";
            const actualheaderValue = headerValue || "1";

            request.cookies.returns({})
            request.originalUrl.returns("http://localhost:8080/registered-email")
            request.get(actualheader).returns(actualheaderValue)

            response.header(Arg.any(), Arg.any()).returns(response);

            expect(() => ensureCookiePresentMiddleware(request, response, nextFunction)).to.throw("Session Cookie Not Set")
        })
    })
});
