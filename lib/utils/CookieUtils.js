"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractSignature = exports.extractSessionId = exports.generateSignature = exports.generateRandomBytesBase64 = exports.generateSessionId = void 0;
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