import { expect, assert } from "chai";
import { Session, VerifiedSession } from "../../src/session/model/Session";
import { Encoding } from "../../src/encoding/Encoding";
import { SessionMiddlewareFactory } from "../../src/SessionMiddlewareFactory";
import { SessionStore } from "../../src/session/SessionStore";
import { Substitute, Arg, SubstituteOf } from "@fluffy-spoon/substitute";
import * as express from "express";
import { CookieConfig } from "../../src/CookieConfig";
import { Redis } from "ioredis";
import { getValidSessionObject, createNewVerifiedSession } from "../utils/SessionGenerator";
import { Cookie } from "../../src/session/model/Cookie";
import { Either, Maybe } from "purify-ts";
import { Failure } from "../../src/error/FailureType";
import { SessionKey } from "../../src/session/keys/SessionKey";
import { generateRandomBytesBase64, generateSessionId, generateSignature } from "../../src/utils/CookieUtils";

declare global {
    namespace Express {
        export interface Request {
            session: Maybe<Session>;
        }
    }
}

const rawData: any = {
    ".id": "23Ubph8aLFe3sSquJrqoqrg3xnXV",
    ".client.signature": "2e814a2c80285b9d57d25894dca89247a8015d5d",
    ".hijacked": null,
    ".oauth2_nonce": "",
    ".zxs_key": "cea8ef23a3112bb9574ae2471262582c067ea7ebb304675f517071fc584ef929",
    expires: 1580481475,
    last_access: 1580477875,
    pst: "all",
    signin_info: {
        access_token: {
            access_token: "oKi1z8KY0gXsXu__hy2-YU_JJSdtxOkJ4K5MAE-gOFVzpKt5lvqnFpVeUjhqhVHZ1K8Hkr7M4IYdzJUnOz2hQw",
            expires_in: 3600,
            refresh_token: "y4YXof84bkUeBZlavRlAGfdq5VMkpPm6UR0OYwPvI6i6UDmtEiTQ1Ro-HGCGo01y4ploP4Kdwd6H4dEh8-E_Fg",
            token_type: "Bearer"
        },
        admin_permissions: "0",
        signed_in: 1,
        user_profile: {
            email: "demo@ch.gov.uk",
            forename: null,
            id: "Y2VkZWVlMzhlZWFjY2M4MzQ3MT",
            locale: "GB_en",
            surname: null
        }
    }
};



describe("Session Middleware", () => {
    const config: CookieConfig = {
        cookieName: "__SID",
        cookieSecret: generateRandomBytesBase64(16),
    };
    it("should insert the session object in the request", async () => {
        const validCookie = Cookie.newCookie(config.cookieSecret);
        const verifiedSession: VerifiedSession = getValidSessionObject(config);
        const serializedSession = Encoding.encode(verifiedSession.data);

        const redis = Substitute.for<Redis>();
        redis.get(validCookie.sessionId).returns(Promise.resolve(serializedSession));

        const sessionStore = new SessionStore(redis);
        const realMiddleware = new SessionMiddlewareFactory(config, sessionStore);
        const mockResponse: SubstituteOf<express.Response> = Substitute.for<express.Response>();
        const mockRequest = {
            cookies: { __SID: validCookie.value },
            session: {}
        } as express.Request;


        const handler = realMiddleware.handler();
        await handler(mockRequest, mockResponse, () => true).catch(console.log);

        assert.deepEqual(mockRequest.session.__value.data, verifiedSession.data);
        mockRequest.cookies.__SID = validCookie.value;
    });
    it("Should add extra data to session and retrieve it" ,() => {
        const verifiedSession = getValidSessionObject(config);
        verifiedSession.saveExtraData("Test", "Hello");

        expect(verifiedSession.data.extra_data).to.deep.equal({Test: "Hello"});
    })
    it("Should show failures if session is invalid", () => {
        const session1 = createNewVerifiedSession(config);
        session1.data[SessionKey.SignInInfo] = null;

        expect(session1.verify().isLeft()).to.equal(true);

        const session2 = createNewVerifiedSession(config);
        session2.data[SessionKey.ExtraData] = null;

        expect(session1.verify().isLeft()).to.equal(true);

        const session3 = createNewVerifiedSession(config);
        session3.data[SessionKey.Expires] = Date.now();

        expect(session3.verify().isLeft()).to.equal(true);

    })


});