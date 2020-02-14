import { expect, assert } from "chai";
import { SessionKeys } from "../../src/session/SessionKeys";
import { Session, VerifiedSession } from "../../src/session/model/Session";
import { Encoding, EncondingConstant } from "../../src/encoding/Encoding";
import { SessionMiddlerware } from "../../src/SessionMiddlewareFactory";
import { SessionStore } from "../../src/session/SessionStore";
import { Substitute, Arg, SubstituteOf } from "@fluffy-spoon/substitute";
import * as express from "express";
import { SessionHandlerConfig } from "../../src/SessionHandlerConfig";
import { Cache } from "../../src/cache/Cache";
import { Failure } from "../../src/error/FailureType";
import { Redis } from "ioredis";
import { getValidSessionObject, unmarshall } from "../utils/SessionGenerator";
import { Cookie } from "../../src/session/model/Cookie";
import { Either } from "purify-ts";

declare global {
    namespace Express {
        export interface Request {
            session?: any;
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
        redisUrl: "redis//:test",
        expiryPeriod: 60 * 60,
        sessionSecret: Encoding.generateRandomBytesBase64(16)
    };
    it("should marshall and unmarshall session object correctly", () => {

        const clientSignature = "2e814a2c80285b9d57d25894dca89247a8015d5d";
        const parsedSession = new Session(rawData);

        expect(parsedSession.data).to.not.equal(undefined);
        assert.deepEqual(parsedSession.unmarshall(), rawData);

    });
    it("should create a verified session", () => {
        const validSession: Either<Failure, VerifiedSession> = VerifiedSession
            .createNewVerifiedSession(config.sessionSecret, config.expiryPeriod);

        validSession
            .chain(verifiedSession => Either.of<Failure, VerifiedSession>(verifiedSession)
                .map(Encoding.encodeSession)
                .map(encoded => {
                    const decoded = Encoding.decodeSession(encoded);
                    expect(decoded.data[SessionKeys.Id]).to.equals(verifiedSession.data[SessionKeys.Id]);
                }));


    });

    it("should validate a valid session cookie and return a verified session object", () => {

        const response: express.Response = Substitute.for<express.Response>();

        // Generate valid sessin id, secret and signature.
        const mockSessionId: string = Encoding.generateRandomBytesBase64(EncondingConstant._idOctets);
        const expectedSignature: string = Encoding.generateSignature(mockSessionId, config.sessionSecret);

        const cookieValue: string = mockSessionId + expectedSignature;

        // Attempt to validate Cookie
        Cookie.validateCookieString(cookieValue, config.sessionSecret)
            .either(
                failure => assert.fail(failure.errorFunction(response)),
                r => assert.equal(r.value, cookieValue)
            );


    });
    it("should return valid session from cache", async () => {

        const mockResponse: SubstituteOf<express.Response> = Substitute.for<express.Response>();


        const verifiedSession: VerifiedSession = getValidSessionObject(config);

        const redis = Substitute.for<Redis>();
        const encodedVerifiedSession = Encoding.encodeSession(verifiedSession);
        const promiseEncodedReturnValue = Promise.resolve(encodedVerifiedSession);
        redis.get(Arg.any()).returns(promiseEncodedReturnValue);

        const cache = new Cache(redis);

        expect(await redis.get(verifiedSession.data[SessionKeys.Id])).to.equal(encodedVerifiedSession);

        const validCookie = Cookie.newCookie(config.sessionSecret);

        const valueFromCache = await cache.get(validCookie).run();

        valueFromCache.map(value => assert.equal(value, encodedVerifiedSession));

        valueFromCache
            .map(Encoding.decodeSession).map(v => { console.log(v); return v; })
            .chain(session => session.verify()).map(v => { console.log(v); return v; })
            .either(fail => {
                fail.errorFunction(mockResponse);
                assert.fail("failure", "a valid session");
            }, session => assert.equal(session.data[SessionKeys.Id],
                (verifiedSession as VerifiedSession).data[SessionKeys.Id]));


    });

    it("should insert the session object in the request", async () => {
        const validCookie = Cookie.newCookie(config.sessionSecret);
        const verifiedSession: VerifiedSession = getValidSessionObject(config);
        const serializedSession = Encoding.encodeSession(verifiedSession);

        const redis = Substitute.for<Redis>();
        redis.get(validCookie.sessionId).returns(Promise.resolve(serializedSession));

        const cache = new Cache(redis);
        const sessionStore = new SessionStore(cache);
        const realMiddleware = new SessionMiddlerware(config, sessionStore);
        const mockResponse: SubstituteOf<express.Response> = Substitute.for<express.Response>();
        const mockRequest = {
            cookies: { __SID: validCookie.value },
            session: {}
        } as express.Request


        const handler = realMiddleware.handler();
        await handler(mockRequest, mockResponse, () => true).catch(console.log);
        assert.deepEqual(mockRequest.session, verifiedSession);
    });


});