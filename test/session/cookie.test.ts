import { expect } from "chai";
import { extractSignature } from "../../src/utils/CookieUtils";
import { generateRandomBytesBase64, generateSessionId, generateSignature } from "../../src/utils/CookieUtils";
import { Cookie } from "../../src/session/model/Cookie";

describe("Cookie", () => {
    const cookieSecret = generateRandomBytesBase64(16);

    describe("cookie validation", () => {
        it("should pass if cookie signature is correct", () => {
            const sessionId: string = generateSessionId();
            const signature: string = generateSignature(sessionId, cookieSecret);

            const result = Cookie.validateCookieString(cookieSecret, sessionId + signature);
            expect(result.value).to.equal(sessionId + signature);
        });

        it("should fail if cookie string is too short", () => {
            const validSessionId: string = generateSessionId();
            const validSignature: string = generateSignature(validSessionId, cookieSecret);
            const invalidSessionId: string = "jasdfasd";
            const invalidSignature = "asdkfasd";

            [invalidSessionId + validSignature, validSessionId + invalidSignature, invalidSessionId + invalidSignature].forEach(cookie => {
                expect(() => Cookie.validateCookieString(cookieSecret, cookie))
                    .to.throw(`Cookie string is not long enough - it is ${cookie.length} characters long while it should have 55 characters`);
            });
        });

        it("should fail if cookie signature is wrong", () => {
            const cookieCreationSecret = generateRandomBytesBase64(16);
            const cookieVerificationSecret = generateRandomBytesBase64(16);

            const sessionId: string = generateSessionId();
            const signature: string = generateSignature(sessionId, cookieCreationSecret);

            const actualSignature = extractSignature(sessionId + signature);
            const expectedSignature = generateSignature(sessionId + signature, cookieVerificationSecret);
            expect(() => Cookie.validateCookieString(cookieVerificationSecret, sessionId + signature))
                .to.throw(`Cookie signature is invalid - it is ${actualSignature} while it should be ${expectedSignature}`);
        });
    });
});
