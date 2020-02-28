import { Cookie } from "../../src/session/model/Cookie";
import { expect } from 'chai';

describe("Signature Test", () => {
    it("should validate the cookie signature", () => {
        const secret = "ChGovUk-XQrbf3sLj2abFxIY2TlapsJ";
        const sessionCookie = "pj/uPaDgbNFS+m0AXiKCzoxTSP4rl2LnIBu6sU/CmqgkYtj0s8q1LwM";

        expect(Cookie.validateCookieString(secret)(sessionCookie).isRight()).to.eq(true);

    });
});