"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto = __importStar(require("crypto"));
const purify_ts_1 = require("purify-ts");
const FailureType_1 = require("../error/FailureType");
const ErrorFunctions_1 = require("../error/ErrorFunctions");
var CookieConstants;
(function (CookieConstants) {
    CookieConstants[CookieConstants["_idOctets"] = 21] = "_idOctets";
    CookieConstants[CookieConstants["_signatureStart"] = 28] = "_signatureStart";
    CookieConstants[CookieConstants["_signatureLength"] = 27] = "_signatureLength";
    CookieConstants[CookieConstants["_cookieValueLength"] = 55] = "_cookieValueLength";
})(CookieConstants = exports.CookieConstants || (exports.CookieConstants = {}));
function generateSignature(id, secret) {
    const adjustedId = id.substr(0, CookieConstants._idOctets);
    const value = crypto
        .createHash("sha1")
        .update(adjustedId + secret)
        .digest("base64");
    return value.substr(0, CookieConstants._signatureLength);
}
exports.generateSignature = generateSignature;
function generateSessionId() {
    return generateRandomBytesBase64(CookieConstants._idOctets);
}
exports.generateSessionId = generateSessionId;
function generateRandomBytesBase64(numBytes) {
    return crypto.randomBytes(numBytes).toString("base64");
}
exports.generateRandomBytesBase64 = generateRandomBytesBase64;
function extractSessionId(sessionCookie) {
    return sessionCookie.substring(0, CookieConstants._signatureStart);
}
exports.extractSessionId = extractSessionId;
function extractSignature(sessionCookie) {
    return sessionCookie.substring(CookieConstants._signatureStart, CookieConstants._cookieValueLength);
}
exports.extractSignature = extractSignature;
exports.validateCookieSignature = (sessionSecret) => (cookieString) => {
    if (!sessionSecret) {
        return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.SessionSecretNotSet));
    }
    const id = extractSessionId(cookieString);
    const sig = extractSignature(cookieString);
    const expectedSig = generateSignature(id, sessionSecret);
    if (sig !== expectedSig) {
        return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.SignatureCheckError(expectedSig, sig)));
    }
    return purify_ts_1.Right(purify_ts_1.Tuple(id, sig));
};
exports.validateSessionCookieLength = (sessionCookie) => {
    if (sessionCookie.length < CookieConstants._cookieValueLength) {
        return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.SessionLengthError(CookieConstants._cookieValueLength, sessionCookie.length)));
    }
    return purify_ts_1.Right(sessionCookie);
};
//# sourceMappingURL=CookieUtils.js.map