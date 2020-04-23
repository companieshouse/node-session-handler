import { expect } from "chai";
import { createSession } from "../utils/SessionGenerator"
import { generateRandomBytesBase64, generateSessionId, generateSignature } from "../../src/utils/CookieUtils";
import { Cookie } from "../../src/session/model/Cookie";
import { SessionKey } from "../../src/session/keys/SessionKey";

describe("Cookie", () => {
    const cookieSecret = generateRandomBytesBase64(16);

    describe("cookie creation", () => {
        it("should build cookie from session data", () => {
            const sessionId = generateSessionId();
            const signature = generateSignature(sessionId, cookieSecret);

            const session = createSession(cookieSecret);
            session.data[SessionKey.Id] = sessionId;

            const cookie = Cookie.representationOf(session, cookieSecret);
            expect(cookie.sessionId).to.be.equal(sessionId);
            expect(cookie.signature).to.be.equal(signature);
        })
    });

    describe("cookie validation", () => {
        it("should pass if cookie signature is correct", () => {
            const sessionId: string = generateSessionId();
            const signature: string = generateSignature(sessionId, cookieSecret);

            const result = Cookie.validateCookieString(cookieSecret, sessionId + signature);
            expect(result.value).to.deep.eq(sessionId + signature);
        });

        it("should fail if cookie string is too short", () => {
            const validSessionId: string = generateSessionId();
            const validSignature: string = generateSignature(validSessionId, cookieSecret);
            const invalidSessionId: string = "jasdfasd";
            const invalidSignature = "asdkfasd";

            [invalidSessionId + validSignature, validSessionId + invalidSignature, invalidSessionId + invalidSignature].forEach(cookie => {
                expect(() => Cookie.validateCookieString(cookieSecret, cookie)).to.throw();
            });
        });

        it("should fail if cookie signature is wrong", () => {
            const cookieCreationSecret = generateRandomBytesBase64(16);
            const cookieVerificationSecret = generateRandomBytesBase64(16);

            const sessionId: string = generateSessionId();
            const signature: string = generateSignature(sessionId, cookieCreationSecret);

            expect(() => Cookie.validateCookieString(cookieVerificationSecret, sessionId + signature)).to.throw();
        });
    });
});
