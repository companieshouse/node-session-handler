import { createNewVerifiedSession } from "../utils/SessionGenerator";
import { expect, assert } from "chai";
import { VerifiedSession, Session } from "../../src/session/model/Session";
import { Either } from "purify-ts";
import { Failure } from "../../src/error/FailureType";
import { Encoding } from "../../src/encoding/Encoding";
import { SessionKey } from "../../src/session/keys/SessionKey";
import Substitute from "@fluffy-spoon/substitute";
import { generateSessionId, generateSignature, generateRandomBytesBase64 } from "../../src/utils/CookieUtils";
import { Cookie } from "../../src/session/model/Cookie";
import { CookieConfig } from "../../src/config/CookieConfig";
import { Response } from "express";

describe("Session", () => {
    const config: CookieConfig = {
        cookieName: "__SID",
        cookieSecret: generateRandomBytesBase64(16),
    };
    it("should create a verified session and it's valid", () => {
        const session = createNewVerifiedSession(config);
        expect(session.verify().isRight()).equals(true);
    });
    it("should create a verified session", () => {
        const validSession: VerifiedSession = createNewVerifiedSession(config);

        Either.of<Failure, any>(validSession.data)
            .map(Encoding.encode)
            .map(Encoding.decode)
            .chain(Session.createInstance)
            .map(decoded => {
                expect(decoded.getValue<string>(SessionKey.Id)).to.deep.equals(validSession.getValue<string>(SessionKey.Id));
            });


    });

    it("should validate a valid session cookie and return a verified session object", () => {

        const response: Response = Substitute.for<Response>();

        // Generate valid sessin id, secret and signature.
        const mockSessionId: string = generateSessionId();
        const expectedSignature: string = generateSignature(mockSessionId, config.cookieSecret);

        const cookieValue: string = mockSessionId + expectedSignature;

        // Attempt to validate Cookie
        Cookie.validateCookieString(config.cookieSecret)(cookieValue)
            .either(
                failure => assert.fail(failure.errorFunction(response)),
                cookie => assert.equal(cookie.value, cookieValue)
            );


    });

    it("should fail if cookie is invalid", () => {

        const response: Response = Substitute.for<Response>();

        // Generate valid sessin id, secret and signature.
        const mockSessionId: string = generateSessionId();
        const badId: string = "jasdfasd";

        const expectedSignature: string = generateSignature(mockSessionId, config.cookieSecret);
        const badSignature = "asdkfasd";

        const badCookieValue1: string = badId + expectedSignature;
        const badCookieValue2: string = mockSessionId + badSignature
        const badCookieValue3: string = badId + badSignature
        // Attempt to validate Cookie
        const result1 = Cookie.validateCookieString(config.cookieSecret)(badCookieValue1);
        const result2 = Cookie.validateCookieString(config.cookieSecret)(badCookieValue2);
        const result3 = Cookie.validateCookieString(config.cookieSecret)(badCookieValue3);

        expect(result1.isLeft()).to.eq(true)
        expect(result2.isLeft()).to.eq(true)
        expect(result3.isLeft()).to.eq(true)
    });

    it("should marshall and unmarshall session object correctly", () => {

        const rawData = {
            a: "a",
            b: "b",
            c: "c"
        };

        const parsedSession = new Session(rawData);

        expect(parsedSession.data).to.not.equal(undefined);
        assert.deepEqual(parsedSession.data as any, rawData);
    });
});
