import { expect, assert } from "chai";
import { Session, VerifiedSession } from "../../src/session/model/Session";
import { Encoding } from "../../src/encoding/Encoding";
import { SessionMiddleware } from "../../src/session/SessionMiddleware";
import { SessionStore } from "../../src/session/store/SessionStore";
import { Substitute, Arg, SubstituteOf } from "@fluffy-spoon/substitute";
import * as express from "express";
import { CookieConfig } from "../../src/config/CookieConfig";
import { Redis } from "ioredis";
import { getValidSessionObject, createNewVerifiedSession } from "../utils/SessionGenerator";
import { Cookie } from "../../src/session/model/Cookie";
import { Maybe } from "purify-ts";
import { SessionKey } from "../../src/session/keys/SessionKey";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";
import { Failure } from "../../src/error/FailureType";
import { wrapValue } from "../../src/utils/EitherAsyncUtils";
import { NextFunction } from "express";

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
    const redis = Substitute.for<Redis>();
    const realSessionStore = new SessionStore(redis);
    let sessionStore = Substitute.for<SessionStore>();

    const realMiddleware = SessionMiddleware(config, sessionStore);

    it("should insert the session object in the request and set the cookie in the response", async () => {
        const verifiedSession: VerifiedSession = getValidSessionObject(config);
        const serializedSession = Encoding.encode(verifiedSession.data);

        expect(verifiedSession.verify().isRight()).to.eq(true);

        const cookie = Cookie.createFrom(verifiedSession);

        redis.get(verifiedSession.data[SessionKey.Id]).returns(Promise.resolve(serializedSession));
        sessionStore.load(Arg.any()).mimicks(realSessionStore.load);

        const mockResponse: SubstituteOf<express.Response> = Substitute.for<express.Response>();
        const mockRequest = {
            cookies: { [config.cookieName]: cookie.value },
            session: {}
        } as express.Request;


        await realMiddleware(mockRequest, mockResponse, () => true).catch(console.log);

        expect(mockResponse.received().cookie(config.cookieName, cookie.value));
        expect(mockRequest.session.isJust()).to.equal(true);
        assert.deepEqual(mockRequest.session.__value.data, verifiedSession.data);
    });
    it("Should add extra data to session and retrieve it", () => {
        const verifiedSession = getValidSessionObject(config);
        verifiedSession.saveExtraData("Test", "Hello");

        expect(verifiedSession.data.extra_data).to.deep.equal({ Test: "Hello" });
    });
    it("should not try to load a session if cookie is not present", async () => {
        const mockResponse: SubstituteOf<express.Response> = Substitute.for<express.Response>();
        const mockRequest = {
            cookies: {}
        } as express.Request;

        await realMiddleware(mockRequest, mockResponse, () => true);
        sessionStore.didNotReceive().load(Arg.any());
        expect(mockRequest.session.isNothing()).to.eq(true);
        expect(mockResponse.didNotReceive().cookie(Arg.any(), Arg.any()));

    });
    it("should set the session object to Nothing if session load fails", async () => {
        const mockResponse: SubstituteOf<express.Response> = Substitute.for<express.Response>();
        const mockRequest = {
            cookies: {}
        } as express.Request;

        sessionStore = Substitute.for<SessionStore>();
        sessionStore.load(Arg.any()).returns(wrapValue(Failure(_ => console.log("Fail"))));

        await realMiddleware(mockRequest, mockResponse, () => true);

        expect(mockRequest.session.isNothing()).to.eq(true);
        expect(mockResponse.didNotReceive().cookie(Arg.any(), Arg.any()));
        expect(mockRequest.cookies).to.deep.eq({});

    });
    it("should call next regardless of failure or success", async () => {
        const mockResponse: SubstituteOf<express.Response> = Substitute.for<express.Response>();
        const mockRequest = {
            cookies: {}
        } as express.Request;

        const next = Substitute.for<NextFunction>();

        sessionStore = Substitute.for<SessionStore>();
        sessionStore.load(Arg.any()).returns(wrapValue(createNewVerifiedSession(config)));

        await realMiddleware(mockRequest, mockResponse, next);

        expect(next.received());

        sessionStore = Substitute.for<SessionStore>();
        sessionStore.load(Arg.any()).returns(wrapValue(Failure(_ => console.log("Fail"))));

        await realMiddleware(mockRequest, mockResponse, next);

        expect(next.received());

    });



});