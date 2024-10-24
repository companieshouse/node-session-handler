import { CookieConfig } from "../../src/config/CookieConfig";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";
import { EnsureSessionCookiePresentMiddleware } from "../../src/session/EnsureCookiePresentMiddleware";
import { NextFunction, Request, Response } from "express";
import { Substitute } from "@fluffy-spoon/substitute";
import { expect } from "chai";

describe("EnsureSessionCookiePresentMiddleware", () => {
    const request = {} as Request;
    const response = Substitute.for<Response>();
    const nextFunction = Substitute.for<NextFunction>();

    const config: CookieConfig = {
        cookieName: "__SID",
        cookieDomain: "localhost",
        cookieSecret: generateRandomBytesBase64(16),
    };

    const ensureCookiePresentMiddleware = EnsureSessionCookiePresentMiddleware(config);

    it("calls next when cookie is present", () => {
        const nextCalls: any[] = [];
        request.cookies = {
            "__SID": "12344567"
        }

        const nextMock = () => {
            nextCalls.push(undefined)
        }

        ensureCookiePresentMiddleware(request, response, nextMock)

        expect(nextCalls).to.be.length(1)
    });

    it("calls redirect when no cookie in request", () => {
        request.cookies = {}
        request.url = "http://localhost:8080/registered-email"

        ensureCookiePresentMiddleware(request, response, nextFunction)

        response.received(1).redirect("http://localhost:8080/registered-email?redirect=true")
    })

    it("throws an error when is a redirect and no session cookie", () => {
        request.cookies = {}
        request.url = "http://localhost:8080/registered-email"
        request.query = {
            redirect: "true"
        }

        expect(() => ensureCookiePresentMiddleware(request, response, nextFunction)).to.throw("Session Cookie Not Set")
    })

    it("handles extra query parameters when redirecting", () => {
        request.cookies = {}
        request.url = "http://localhost:8080/registered-email"
        request.query = {
            another: "abcdef"
        }

        ensureCookiePresentMiddleware(request, response, nextFunction)

        response.received(1).redirect("http://localhost:8080/registered-email?another=abcdef&redirect=true")

    })
})

describe("EnsureSessionCookiePresentMiddleware with custom redirection properties", () => {
    [{
        queryParameter: "otherRedirect"
    }, {
        queryParameterValue: "yes"
    }, {
        queryParameter: "otherRedirect",
        queryParameterValue: "yes"
    }].forEach(({ queryParameter, queryParameterValue }) => {

        const request = {} as Request;
        const response = Substitute.for<Response>();
        const nextFunction = Substitute.for<NextFunction>();

        const config = {
            cookieName: "__SID",
            redirectQueryParameterName: queryParameter,
            redirectQueryParameterValue: queryParameterValue
        };

        const ensureCookiePresentMiddleware = EnsureSessionCookiePresentMiddleware(config);

        it(`redirects with query parameter=${queryParameter} and value=${queryParameterValue}`, () => {
            const expectedQueryParameter = queryParameter || "redirect";
            const expectedQueryParameterValue = queryParameterValue || "true";
            request.cookies = {}
            request.url = "http://localhost:8080/registered-email"

            ensureCookiePresentMiddleware(request, response, nextFunction)

            response.received(1).redirect(`http://localhost:8080/registered-email?${expectedQueryParameter}=${expectedQueryParameterValue}`)
        })

        it(`calls next when cookie present and query parameter=${queryParameter} and value=${queryParameterValue}`, () => {
            const actualQueryParameter = queryParameter || "redirect";
            const actualQueryParameterValue = queryParameterValue || "true";
            request.cookies = {
                "__SID": "3485869"
            }
            request.url = "http://localhost:8080/registered-email"
            request.query = {
                [actualQueryParameter]: actualQueryParameterValue
            }

            const nextCalls: any[] = [];

            const nextMock = () => {
                nextCalls.push(undefined)
            }
    
            ensureCookiePresentMiddleware(request, response, nextMock)
    
            expect(nextCalls).to.be.length(1)
        })

        it(`errors when no cookie and query parameter=${queryParameter} and value=${queryParameterValue}`, () => {
            const actualQueryParameter = queryParameter || "redirect";
            const actualQueryParameterValue = queryParameterValue || "true";
            request.cookies = {}
            request.url = "http://localhost:8080/registered-email"
            request.query = {
                [actualQueryParameter]: actualQueryParameterValue
            }

            expect(() => ensureCookiePresentMiddleware(request, response, nextFunction)).to.throw("Session Cookie Not Set")
        })
    })
})
