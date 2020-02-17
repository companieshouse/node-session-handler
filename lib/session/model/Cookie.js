"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const purify_ts_1 = require("purify-ts");
const SessionKey_1 = require("../keys/SessionKey");
const CookieUtils_1 = require("../../utils/CookieUtils");
class Cookie {
    constructor(sessionId, signature) {
        this.sessionId = sessionId;
        this.signature = signature;
    }
    get value() {
        return this.sessionId + this.signature;
    }
    static newCookie(sessionSecret) {
        const sessionId = CookieUtils_1.generateSessionId();
        const signature = CookieUtils_1.generateSignature(sessionId, sessionSecret);
        return new Cookie(sessionId, signature);
    }
}
exports.Cookie = Cookie;
Cookie.asCookie = (session) => {
    return new Cookie(session.data[SessionKey_1.SessionKey.Id], session.data[SessionKey_1.SessionKey.ClientSig]);
};
Cookie.validateCookieString = (sessionSecret) => (cookieString) => {
    return purify_ts_1.Either.of(cookieString)
        .chain(CookieUtils_1.validateSessionCookieLength)
        .chain(CookieUtils_1.validateCookieSignature(sessionSecret))
        .map(tuple => new Cookie(tuple[0], tuple[1]));
};
//# sourceMappingURL=Cookie.js.map