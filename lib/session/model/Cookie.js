"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SessionKey_1 = require("../keys/SessionKey");
const CookieUtils_1 = require("../../utils/CookieUtils");
const ErrorFunctions_1 = require("../../error/ErrorFunctions");
const CookieConstants_1 = require("../../utils/CookieConstants");
const validateCookieSignature = (cookieSecret, cookieString) => {
    if (!cookieSecret) {
        throw ErrorFunctions_1.SessionSecretNotSetError();
    }
    const sig = CookieUtils_1.extractSignature(cookieString);
    const expectedSig = CookieUtils_1.generateSignature(cookieString, cookieSecret);
    if (sig !== expectedSig) {
        throw ErrorFunctions_1.SignatureCheckError(expectedSig, sig);
    }
};
const validateSessionCookieLength = (sessionCookie) => {
    if (sessionCookie.length < CookieConstants_1.CookieConstants._cookieValueLength) {
        throw ErrorFunctions_1.SessionLengthError(CookieConstants_1.CookieConstants._cookieValueLength, sessionCookie.length);
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
    static create(cookieSecret) {
        const sessionId = CookieUtils_1.generateSessionId();
        const signature = CookieUtils_1.generateSignature(sessionId, cookieSecret);
        return new Cookie(sessionId, signature);
    }
    static representationOf(session, cookieSecret) {
        const id = session.data[SessionKey_1.SessionKey.Id];
        return new Cookie(id, CookieUtils_1.generateSignature(id, cookieSecret));
    }
    ;
}
exports.Cookie = Cookie;
Cookie.validateCookieString = (cookieSecret, cookieString) => {
    validateSessionCookieLength(cookieString);
    validateCookieSignature(cookieSecret, cookieString);
    return new Cookie(CookieUtils_1.extractSessionId(cookieString), CookieUtils_1.extractSignature(cookieString));
};
//# sourceMappingURL=Cookie.js.map