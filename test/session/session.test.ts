import { createNewVerifiedSession } from "../utils/SessionGenerator";
import { expect, assert } from "chai";
import { VerifiedSession, Session } from "../../src/session/model/Session";
import { Either } from "purify-ts";
import { Failure } from "../../src/error/FailureType";
import { Encoding } from "../../src/encoding/Encoding";
import Substitute from "@fluffy-spoon/substitute";
import { generateSessionId, generateSignature, generateRandomBytesBase64 } from "../../src/utils/CookieUtils";
import { Cookie } from "../../src/session/model/Cookie";
import { CookieConfig } from "../../src/config/CookieConfig";
import { Response } from "express";
import { SessionKey } from "../../src/session/keys/SessionKey";
import { IAccessToken } from '../../src/session/model/SessionInterfaces';
import { SignInInfoKeys } from '../../src/session/keys/SignInInfoKeys';

describe("Session", () => {
    const config: CookieConfig = {
        cookieName: "__SID",
        cookieSecret: generateRandomBytesBase64(16),
    };
    it("should create a verified session and it's valid", () => {
        const session = createNewVerifiedSession(config);
        expect(session.verify().isRight()).equals(true);
    });
    it("Should return Just and the data inside it should be correct when trying to access a session", () => {
        const session = createNewVerifiedSession(config);
        const key = "test";
        const obj = {
            a: "a",
            b: "b"
        };
        session.saveExtraData(key, obj);

        expect(session.getExtraData().isJust()).to.eq(true);
        session.getExtraData().map(data => expect(data[key]).to.deep.equal(obj));

    });
    it("should set the dirty flag to true after saving into the session", () => {
        const session = createNewVerifiedSession(config);
        const key = "test";
        const obj = {
            a: "a",
            b: "b"
        };
        session.saveExtraData(key, obj);

        expect(session.isDirty()).to.eq(true);

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
    it("Should show failures if session is invalid", () => {
        const session1 = createNewVerifiedSession(config);
        session1.data[SessionKey.SignInInfo] = null;

        expect(session1.verify().isLeft()).to.equal(true);

        const session2 = createNewVerifiedSession(config);
        const signInInfo = session2.data[SessionKey.SignInInfo];

        signInInfo[SignInInfoKeys.AccessToken] = null;
        session2.data[SessionKey.SignInInfo] = signInInfo;

        expect(session2.verify().isLeft()).to.equal(true);

        const session3 = createNewVerifiedSession(config);
        session3.data[SessionKey.Expires] = Date.now();

        expect(session3.verify().isLeft()).to.equal(true);

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
