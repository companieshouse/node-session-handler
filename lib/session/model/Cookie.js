"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Encoding_1 = require("../../encoding/Encoding");
const purify_ts_1 = require("purify-ts");
const FailureType_1 = require("../../error/FailureType");
const ErrorFunctions_1 = require("../../error/ErrorFunctions");
const SessionKeys_1 = require("../SessionKeys");
class Cookie {
    constructor(sessionId, signature) {
        this.sessionId = sessionId;
        this.signature = signature;
    }
    get value() {
        return this.sessionId + this.signature;
    }
    static sessionCookie(verifiedSession) {
        return new Cookie(verifiedSession.data[SessionKeys_1.SessionKeys.SessionId], verifiedSession.data[SessionKeys_1.SessionKeys.ClientSig]);
    }
    static newCookie(sessionSecret) {
        const sessionId = Encoding_1.Encoding.generateSessionId();
        const signature = Encoding_1.Encoding.generateSignature(sessionId, sessionSecret);
        return new Cookie(sessionId, signature);
    }
    static validateCookieString(cookieString, sessionSecret) {
        return purify_ts_1.Either.of(cookieString)
            .chain(Cookie.validateSessionCookieLength)
            .chain(this.extractSessionId)
            .chain(sessionId => this.extractSignature(cookieString)
            .map(signature => new Cookie(sessionId, signature)));
    }
    static extractSessionId(sessionCookie) {
        return purify_ts_1.Right(sessionCookie.substring(0, Encoding_1.EncondingConstant._signatureStart));
    }
    static extractSignature(sessionCookie) {
        return purify_ts_1.Right(sessionCookie
            .substring(Encoding_1.EncondingConstant._signatureStart, Encoding_1.EncondingConstant._cookieValueLength));
    }
}
exports.Cookie = Cookie;
Cookie.validateSessionCookieLength = (sessionCookie) => {
    if (sessionCookie.length < Encoding_1.EncondingConstant._cookieValueLength) {
        return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.SessionLengthError(Encoding_1.EncondingConstant._cookieValueLength, sessionCookie.length)));
    }
    return purify_ts_1.Right(sessionCookie);
};
Cookie.validateCookieSignature = (sessionSecret, sessionId, signature) => {
    if (!sessionSecret) {
        return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.SessionSecretNotSet));
    }
    const expectedSig = Encoding_1.Encoding.generateSignature(sessionId, sessionSecret);
    if (signature !== expectedSig) {
        return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.SignatureCheckError(expectedSig, signature)));
    }
    return purify_ts_1.Right(signature);
};
//# sourceMappingURL=Cookie.js.map