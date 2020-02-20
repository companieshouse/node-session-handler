import { expect, config } from "chai";
import { generateSessionId, generateSignature, generateRandomBytesBase64 } from "../../src/utils/CookieUtils";
import { Cookie } from "../../src/session/model/Cookie";
import { CookieConfig } from "../../src/config/CookieConfig";

describe("Cookie", () => {
    const config: CookieConfig = {
        cookieName: "__SID",
        cookieSecret: generateRandomBytesBase64(16),
    };
    it("should fail if cookie is invalid", () => {

        // Generate valid sessin id, secret and signature.
        const mockSessionId: string = generateSessionId();
        const badId: string = "jasdfasd";

        const expectedSignature: string = generateSignature(mockSessionId, config.cookieSecret);
        const badSignature = "asdkfasd";

        const badCookieValue1: string = badId + expectedSignature;
        const badCookieValue2: string = mockSessionId + badSignature;
        const badCookieValue3: string = badId + badSignature;
        // Attempt to validate Cookie
        const result1 = Cookie.validateCookieString(config.cookieSecret)(badCookieValue1);
        const result2 = Cookie.validateCookieString(config.cookieSecret)(badCookieValue2);
        const result3 = Cookie.validateCookieString(config.cookieSecret)(badCookieValue3);

        expect(result1.isLeft()).to.eq(true)
        expect(result2.isLeft()).to.eq(true)
        expect(result3.isLeft()).to.eq(true)
    });

})