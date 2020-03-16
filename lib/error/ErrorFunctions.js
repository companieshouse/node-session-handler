"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ErrorEnum;
(function (ErrorEnum) {
    ErrorEnum["_sessionLengthError"] = "Encrypted session token not long enough.";
    ErrorEnum["_signatureCheckError"] = "Expected signature does not equal signature provided.";
    ErrorEnum["_sessionExpiredError"] = "Session has expired.";
    ErrorEnum["_sessionSecretNotSet"] = "Session Secret is not set";
    ErrorEnum["_signInfoMissingError"] = "Sign-in information missing.";
    ErrorEnum["_accessTokenMissingError"] = "Access Token missing";
    ErrorEnum["_expiresInMissingError"] = "Expires in field missing";
    ErrorEnum["_storeError"] = "Store error";
    ErrorEnum["_promiseError"] = "Promise error";
    ErrorEnum["_noDataRetrievedError"] = "No data retrieved from Redis";
    ErrorEnum["_sessionParseError"] = "Failed to parse session object";
})(ErrorEnum = exports.ErrorEnum || (exports.ErrorEnum = {}));
exports.DifferenceError = (expected, actual, message) => new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);
exports.SessionLengthError = (expected, actual) => exports.DifferenceError(expected, actual, ErrorEnum._sessionLengthError);
exports.SignatureCheckError = (expected, actual) => exports.DifferenceError(expected, actual, ErrorEnum._signatureCheckError);
exports.SessionExpiredError = (expected, actual) => exports.DifferenceError(expected, actual, ErrorEnum._sessionExpiredError);
exports.SessionSecretNotSetError = () => new Error(ErrorEnum._sessionSecretNotSet);
exports.PromiseError = (callStack) => {
    throw new Error(`Error: ${ErrorEnum._promiseError}.\n${callStack}`);
};
exports.SessionParseError = (object) => new Error(`Error: ${ErrorEnum._sessionParseError}. Received: ${object}`);
exports.SignInInfoMissingError = () => new Error(ErrorEnum._signInfoMissingError);
exports.AccessTokenMissingError = () => new Error(ErrorEnum._accessTokenMissingError);
exports.ExpiresMissingError = () => new Error(ErrorEnum._expiresInMissingError);
exports.NoDataRetrievedError = (key) => {
    throw new Error(`${ErrorEnum._noDataRetrievedError} using key: ${key}`);
};
exports.StoringError = (err, key, value) => {
    throw new Error(`${err}\n${ErrorEnum._storeError} using key: ${key} and value ${value}`);
};
//# sourceMappingURL=ErrorFunctions.js.map