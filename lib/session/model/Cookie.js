"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cookie = exports.validateCookieSignature = void 0;
const CookieUtils_1 = require("../../utils/CookieUtils");
const CookieErrors_1 = require("./CookieErrors");
const CookieConstants_1 = require("../../utils/CookieConstants");
const Logger_1 = require("../../Logger");
const validateSessionCookieLength = (sessionCookie) => {
    if (sessionCookie.length < CookieConstants_1.CookieConstants._cookieValueLength) {
        throw new CookieErrors_1.InvalidCookieLengthError(sessionCookie.length);
    }
};
exports.validateCookieSignature = (cookieString, cookieSecret) => {
    Logger_1.loggerInstance().info(`validating cookie signature: ${cookieString}`);
    if (!cookieSecret) {
        throw new CookieErrors_1.CookieSecretNotSetError();
    }
    const actualSignature = CookieUtils_1.extractSignature(cookieString);
    const expectedSignature = CookieUtils_1.generateSignature(cookieString, cookieSecret);
    if (actualSignature !== expectedSignature) {
        throw new CookieErrors_1.InvalidCookieSignatureError(actualSignature, expectedSignature);
    }
};
class Cookie {
    constructor(sessionId, signature) {
        this.sessionId = sessionId;
        this.signature = signature;
        if (!sessionId) {
            throw new Error("Session ID is required");
        }
        if (!signature) {
            throw new Error("Signature is required");
        }
    }
    get value() {
        return this.sessionId + this.signature;
    }
    static createNew(cookieSecret) {
        const sessionId = CookieUtils_1.generateSessionId();
        const signature = CookieUtils_1.generateSignature(sessionId, cookieSecret);
        return new Cookie(sessionId, signature);
    }
    static createFrom(cookieString) {
        Logger_1.loggerInstance().info(`creating cookie from cookieString: ${cookieString}`);
        validateSessionCookieLength(cookieString);
        return new Cookie(CookieUtils_1.extractSessionId(cookieString), CookieUtils_1.extractSignature(cookieString));
    }
}
exports.Cookie = Cookie;
//# sourceMappingURL=Cookie.js.map