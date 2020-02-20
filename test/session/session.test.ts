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
});
