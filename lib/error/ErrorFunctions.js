"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorEnum;
(function (ErrorEnum) {
    ErrorEnum["_sessionExpiredError"] = "Session has expired.";
    ErrorEnum["_signInfoMissingError"] = "Sign-in information missing.";
    ErrorEnum["_accessTokenMissingError"] = "Access Token missing";
    ErrorEnum["_expiresInMissingError"] = "Expires in field missing";
    ErrorEnum["_sessionParseError"] = "Failed to parse session object";
})(ErrorEnum = exports.ErrorEnum || (exports.ErrorEnum = {}));
exports.DifferenceError = (expected, actual, message) => new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
exports.SessionExpiredError = (expected, actual) => exports.DifferenceError(expected, actual, ErrorEnum._sessionExpiredError);
exports.SessionParseError = (object) => new Error(`Error: ${ErrorEnum._sessionParseError}. Received: ${object}`);
exports.SignInInfoMissingError = () => new Error(ErrorEnum._signInfoMissingError);
exports.AccessTokenMissingError = () => new Error(ErrorEnum._accessTokenMissingError);
exports.ExpiresMissingError = () => new Error(ErrorEnum._expiresInMissingError);
//# sourceMappingURL=ErrorFunctions.js.map