import { expect } from "chai";
import { createNewVerifiedSession } from "../utils/SessionGenerator"
import { generateRandomBytesBase64, generateSessionId, generateSignature } from "../../src/utils/CookieUtils";
import { Cookie } from "../../src/session/model/Cookie";
import { CookieConfig } from "../../src/config/CookieConfig";
import { VerifiedSession } from "../../src/session/model/Session";
import { SessionKey } from "../../src/session/keys/SessionKey";

describe("Cookie", () => {
    const config: CookieConfig = {
        cookieName: "__SID",
        cookieSecret: generateRandomBytesBase64(16),
    };

    describe("cookie creation", () => {
        it("should build cookie from session data", () => {
            const sessionId = "id";
            const signature = "signature";

            const session: VerifiedSession = createNewVerifiedSession(config);
            session.data[SessionKey.Id] = sessionId;
            session.data[SessionKey.ClientSig] = signature;

            const cookie = Cookie.createFrom(session);
            expect(cookie.sessionId).to.be.equal(sessionId);
            expect(cookie.signature).to.be.equal(signature);
        })
    });

    describe("cookie validation", () => {
        it("should pass if cookie signature is correct", () => {
            const sessionId: string = generateSessionId();
            const signature: string = generateSignature(sessionId, config.cookieSecret);

            const result = Cookie.validateCookieString(config.cookieSecret)(sessionId + signature);
            expect(result.isRight()).to.eq(true);
            result.ifRight(cookie => {
                expect(cookie.value).is.equal(sessionId, sessionId);
            });
        });

        it("should fail if cookie string is too short", () => {
            const validSessionId: string = generateSessionId();
            const validSignature: string = generateSignature(validSessionId, config.cookieSecret);
            const invalidSessionId: string = "jasdfasd";
            const invalidSignature = "asdkfasd";

            [invalidSessionId + validSignature, validSessionId + invalidSignature, invalidSessionId + invalidSignature].forEach(cookie => {
                const result = Cookie.validateCookieString(config.cookieSecret)(cookie);
                expect(result.isLeft()).to.eq(true);
            });
        });

        it("should fail if cookie signature is wrong", () => {
            const cookieCreationSecret = generateRandomBytesBase64(16);
            const cookieVerificationSecret = generateRandomBytesBase64(16);

            const sessionId: string = generateSessionId();
            const signature: string = generateSignature(sessionId, cookieCreationSecret);

            const result = Cookie.validateCookieString(cookieVerificationSecret)(sessionId + signature);
            expect(result.isLeft()).to.eq(true);
        });
    });
});