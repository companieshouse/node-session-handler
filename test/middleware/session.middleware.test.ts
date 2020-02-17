import { expect, assert } from "chai";
import { SessionKeys } from "../../src/session/SessionKeys";
import { Session, VerifiedSession } from "../../src/session/model/Session";
import { Encoding, EncondingConstant } from "../../src/encoding/Encoding";
import { SessionMiddlewareFactory } from "../../src/SessionMiddlewareFactory";
import { SessionStore } from "../../src/session/SessionStore";
import { Substitute, Arg, SubstituteOf } from "@fluffy-spoon/substitute";
import * as express from "express";
import { SessionHandlerConfig } from "../../src/SessionHandlerConfig";
import { Cache } from "../../src/cache/Cache";
import { Redis } from "ioredis";
import { getValidSessionObject } from "../utils/SessionGenerator";
import { Cookie } from "../../src/session/model/Cookie";
import { Either } from "purify-ts";

declare global {
    namespace Express {
        export interface Request {
            session?: Session;
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
    const config: SessionHandlerConfig = {
        cacheServer: "redis//:test",
        cacheDB: 0,
        cachePassword: "",
        cookieName: "__SID",
        defaultSessionExpiration: 60 * 60,
        cookieSecret: Encoding.generateRandomBytesBase64(16)
    };
    it("should marshall and unmarshall session object correctly", () => {

        const clientSignature = "2e814a2c80285b9d57d25894dca89247a8015d5d";
        const parsedSession = new Session(rawData);

        expect(parsedSession.data).to.not.equal(undefined);
        assert.deepEqual(parsedSession.unmarshall(), rawData);

    });
    it("should create a verified session and it's valid", () => {
        const session = VerifiedSession.createNewVerifiedSession(config);
        expect(session.verify().isRight()).equals(true);
    });
    it("should create a verified session", () => {
        const validSession: VerifiedSession = VerifiedSession.createNewVerifiedSession(config);

        Either.of(validSession)
            .map(Encoding.encodeSession)
            .map(encoded => {
                const decoded = Encoding.decodeSession(encoded);
                expect(decoded.data[SessionKeys.Id]).to.equals(validSession.data[SessionKeys.Id]);
            });


    });

    it("should validate a valid session cookie and return a verified session object", () => {

        const response: express.Response = Substitute.for<express.Response>();

        // Generate valid sessin id, secret and signature.
        const mockSessionId: string = Encoding.generateRandomBytesBase64(EncondingConstant._idOctets);
        const expectedSignature: string = Encoding.generateSignature(mockSessionId, config.cookieSecret);

        const cookieValue: string = mockSessionId + expectedSignature;

        // Attempt to validate Cookie
        Cookie.validateCookieString(cookieValue, config.cookieSecret)
            .either(
                failure => assert.fail(failure.errorFunction(response)),
                cookie => assert.equal(cookie.value, cookieValue)
            );


    });
    it("should return valid session from cache", async () => {

        const mockResponse: SubstituteOf<express.Response> = Substitute.for<express.Response>();


        const verifiedSession: VerifiedSession = VerifiedSession.createNewVerifiedSession(config);

        const redis = Substitute.for<Redis>();
        const encodedVerifiedSession = Encoding.encodeSession(verifiedSession);
        const promiseEncodedReturnValue = Promise.resolve(encodedVerifiedSession);
        redis.get(Arg.any()).returns(promiseEncodedReturnValue);

        const cache = new Cache(redis);

        expect(await redis.get(verifiedSession.data[SessionKeys.Id])).to.equal(encodedVerifiedSession);

        const validCookie = Cookie.newCookie(config.cookieSecret);

        const valueFromCache = await cache.get(validCookie).run();

        valueFromCache.map(value => assert.equal(value, encodedVerifiedSession));

        valueFromCache
            .map(Encoding.decodeSession)
            .chain(session => session.verify())
            .either(fail => {
                fail.errorFunction(mockResponse);
                assert.fail("failure", "a valid session");
            }, session => assert.equal(session.data[SessionKeys.Id],
                (verifiedSession as VerifiedSession).data[SessionKeys.Id]));


    });

    it("should insert the session object in the request", async () => {
        const validCookie = Cookie.newCookie(config.cookieSecret);
        const verifiedSession: VerifiedSession = getValidSessionObject(config);
        const serializedSession = Encoding.encodeSession(verifiedSession);

        const redis = Substitute.for<Redis>();
        redis.get(validCookie.sessionId).returns(Promise.resolve(serializedSession));

        const cache = new Cache(redis);
        const sessionStore = new SessionStore(cache);
        const realMiddleware = new SessionMiddlewareFactory(config, sessionStore);
        const mockResponse: SubstituteOf<express.Response> = Substitute.for<express.Response>();
        const mockRequest = {
            cookies: { __SID: validCookie.value },
            session: {}
        } as express.Request;


        const handler = realMiddleware.handler();
        await handler(mockRequest, mockResponse, () => true).catch(console.log);

        assert.deepEqual(mockRequest.session.unmarshall(), verifiedSession.unmarshall());
    });


});