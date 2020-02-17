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
import { Either } from "purify-ts";
import { Failure } from "../../src/error/FailureType";
import { SessionKey } from "../../src/session/keys/SessionKey";
import { generateRandomBytesBase64, generateSessionId, generateSignature } from "../../src/utils/CookieUtils";

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
                console.log(decoded);
                console.log(validSession);
                expect(decoded.getValue<string>(SessionKey.Id)).to.equals(validSession.getValue<string>(SessionKey.Id));
            });


    });

    it("should validate a valid session cookie and return a verified session object", () => {

        const response: express.Response = Substitute.for<express.Response>();

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
    it("should return valid session from cache", async () => {

        const mockResponse: SubstituteOf<express.Response> = Substitute.for<express.Response>();


        const verifiedSession: Session = new Session(createNewVerifiedSession(config).data);

        const redis = Substitute.for<Redis>();
        const encodedVerifiedSession = Encoding.encode(verifiedSession.data);
        const promiseEncodedReturnValue = Promise.resolve(encodedVerifiedSession);
        redis.get(Arg.any()).returns(promiseEncodedReturnValue);
        const store = new SessionStore(redis);

        await store.load(Arg.any())
            .map(_ => assert.equal(_, encodedVerifiedSession))
            .run();


        const validCookie = Cookie.newCookie(config.cookieSecret);

        const valueFromStore = await store.load(validCookie).run();

        valueFromStore
            .chain(Session.createInstance)
            .chain(session => session.verify())
            .either(fail => {
                fail.errorFunction(mockResponse);
                assert.fail("failure", "a valid session");
            }, session => assert.equal(session.data[SessionKey.Id],
                (verifiedSession as VerifiedSession).data[SessionKey.Id]));


    });

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

        assert.deepEqual(mockRequest.session.data, verifiedSession.data);
    });
    it("Should add extra data to session and retrieve it" ,() => {
        const verifiedSession = getValidSessionObject(config);
        verifiedSession.saveExtraData("Test", "Hello");

        expect(verifiedSession.data.extra_data).to.deep.equal({Test: "Hello"});
    })


});