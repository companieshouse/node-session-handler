"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cookie = exports.validateCookieSignature = void 0;
const CookieUtils_1 = require("../../utils/CookieUtils");
const CookieErrors_1 = require("./CookieErrors");
const CookieConstants_1 = require("../../utils/CookieConstants");
const validateSessionCookieLength = (sessionCookie) => {
    if (sessionCookie.length < CookieConstants_1.CookieConstants._cookieValueLength) {
        throw new CookieErrors_1.InvalidCookieLengthError(sessionCookie.length);
    }
};
const validateCookieSignature = (cookieString, cookieSecret) => {
    if (!cookieSecret) {
        throw new CookieErrors_1.CookieSecretNotSetError();
    }
    const actualSignature = (0, CookieUtils_1.extractSignature)(cookieString);
    const expectedSignature = (0, CookieUtils_1.generateSignature)(cookieString, cookieSecret);
    if (actualSignature !== expectedSignature) {
        throw new CookieErrors_1.InvalidCookieSignatureError(actualSignature, expectedSignature);
    }
};
exports.validateCookieSignature = validateCookieSignature;
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
        const sessionId = (0, CookieUtils_1.generateSessionId)();
        const signature = (0, CookieUtils_1.generateSignature)(sessionId, cookieSecret);
        return new Cookie(sessionId, signature);
    }
    static createFrom(cookieString) {
        validateSessionCookieLength(cookieString);
        return new Cookie((0, CookieUtils_1.extractSessionId)(cookieString), (0, CookieUtils_1.extractSignature)(cookieString));
    }
}
exports.Cookie = Cookie;
//# sourceMappingURL=Cookie.js.map