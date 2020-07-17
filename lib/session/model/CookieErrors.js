"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidCookieSignatureError = exports.InvalidCookieLengthError = exports.CookieSecretNotSetError = void 0;
const CookieConstants_1 = require("../../utils/CookieConstants");
class CookieSecretNotSetError extends Error {
    constructor() {
        super("Cookie secret is not set");
    }
}
exports.CookieSecretNotSetError = CookieSecretNotSetError;
class InvalidCookieLengthError extends Error {
    constructor(length) {
        super(`Cookie string is not long enough - it is ${length} characters long while it should have ${CookieConstants_1.CookieConstants._cookieValueLength} characters`);
    }
}
exports.InvalidCookieLengthError = InvalidCookieLengthError;
class InvalidCookieSignatureError extends Error {
    constructor(actualSignature, expectedSignature) {
        super(`Cookie signature is invalid - it is ${actualSignature} while it should be ${expectedSignature}`);
    }
}
exports.InvalidCookieSignatureError = InvalidCookieSignatureError;
//# sourceMappingURL=CookieErrors.js.map