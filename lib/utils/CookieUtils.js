"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSessionId = generateSessionId;
exports.generateRandomBytesBase64 = generateRandomBytesBase64;
exports.generateSignature = generateSignature;
exports.extractSessionId = extractSessionId;
exports.extractSignature = extractSignature;
const crypto = __importStar(require("crypto"));
const CookieConstants_1 = require("./CookieConstants");
function generateSessionId() {
    return generateRandomBytesBase64(CookieConstants_1.CookieConstants._idOctets);
}
function generateRandomBytesBase64(numBytes) {
    return crypto.randomBytes(numBytes).toString("base64");
}
function generateSignature(id, secret) {
    const adjustedId = extractSessionId(id);
    const value = crypto
        .createHash("sha1")
        .update(adjustedId + secret)
        .digest("base64");
    return value.substr(0, value.indexOf("="));
}
function extractSessionId(sessionCookie) {
    return sessionCookie.substring(0, CookieConstants_1.CookieConstants._signatureStart);
}
function extractSignature(sessionCookie) {
    return sessionCookie.substring(CookieConstants_1.CookieConstants._signatureStart);
}
//# sourceMappingURL=CookieUtils.js.map