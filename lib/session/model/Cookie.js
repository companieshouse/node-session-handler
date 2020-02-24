"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const purify_ts_1 = require("purify-ts");
const FailureType_1 = require("../../error/FailureType");
const SessionKey_1 = require("../keys/SessionKey");
const CookieUtils_1 = require("../../utils/CookieUtils");
const ErrorFunctions_1 = require("../../error/ErrorFunctions");
const CookieConstants_1 = require("../../utils/CookieConstants");
const validateCookieSignature = (cookieSecret) => (cookieString) => {
    if (!cookieSecret) {
        return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.SessionSecretNotSet));
    }
    const id = extractSessionId(cookieString);
    const sig = extractSignature(cookieString);
    const expectedSig = CookieUtils_1.generateSignature(id, cookieSecret);
    if (sig !== expectedSig) {
        return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.SignatureCheckError(expectedSig, sig)));
    }
    return purify_ts_1.Right(purify_ts_1.Tuple(id, sig));
};
function extractSessionId(sessionCookie) {
    return sessionCookie.substring(0, CookieConstants_1.CookieConstants._signatureStart);
}
function extractSignature(sessionCookie) {
    return sessionCookie.substring(CookieConstants_1.CookieConstants._signatureStart, CookieConstants_1.CookieConstants._cookieValueLength);
}
const validateSessionCookieLength = (sessionCookie) => {
    if (sessionCookie.length < CookieConstants_1.CookieConstants._cookieValueLength) {
        return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.SessionLengthError(CookieConstants_1.CookieConstants._cookieValueLength, sessionCookie.length)));
    }
    return purify_ts_1.Right(sessionCookie);
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
    static createFrom(session) {
        return new Cookie(session.data[SessionKey_1.SessionKey.Id], session.data[SessionKey_1.SessionKey.ClientSig]);
    }
    ;
}
exports.Cookie = Cookie;
Cookie.validateCookieString = (cookieSecret) => (cookieString) => {
    return purify_ts_1.Either.of(cookieString)
        .chain(validateSessionCookieLength)
        .chain(validateCookieSignature(cookieSecret))
        .map(tuple => new Cookie(tuple[0], tuple[1]));
};
//# sourceMappingURL=Cookie.js.map