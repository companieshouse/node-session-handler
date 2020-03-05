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
const CookieConstants_1 = require("./CookieConstants");
function generateSessionId() {
    return generateRandomBytesBase64(CookieConstants_1.CookieConstants._idOctets);
}
exports.generateSessionId = generateSessionId;
function generateRandomBytesBase64(numBytes) {
    return crypto.randomBytes(numBytes).toString("base64");
}
exports.generateRandomBytesBase64 = generateRandomBytesBase64;
function generateSignature(id, secret) {
    const adjustedId = extractSessionId(id);
    const value = crypto
        .createHash("sha1")
        .update(adjustedId + secret)
        .digest("base64");
    return value.substr(0, value.indexOf("="));
}
exports.generateSignature = generateSignature;
function extractSessionId(sessionCookie) {
    return sessionCookie.substring(0, CookieConstants_1.CookieConstants._signatureStart);
}
exports.extractSessionId = extractSessionId;
function extractSignature(sessionCookie) {
    return sessionCookie.substring(CookieConstants_1.CookieConstants._signatureStart);
}
exports.extractSignature = extractSignature;
//# sourceMappingURL=CookieUtils.js.map