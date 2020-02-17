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
exports.log = (message) => console.log(message);
exports.logDifference = (expected, actual) => (message) => exports.log(`${message}\nExpected: ${expected}\nActual: ${actual}`);
exports.LogOnly = (logger) => (errorEnum) => {
    return (response) => {
        logger(errorEnum);
    };
};
exports.SessionLengthError = (expected, actual) => exports.LogOnly(exports.logDifference(expected, actual))(ErrorEnum._sessionLengthError);
exports.SignatureCheckError = (expected, actual) => exports.LogOnly(exports.logDifference(expected, actual))(ErrorEnum._signatureCheckError);
exports.SessionExpiredError = exports.LogOnly(exports.log)(ErrorEnum._sessionExpiredError);
exports.SessionSecretNotSet = (_) => {
    exports.log(ErrorEnum._sessionSecretNotSet);
    throw Error(ErrorEnum._sessionSecretNotSet);
};
exports.PromiseError = (callStack) => (_) => {
    exports.log(`Error: ${ErrorEnum._promiseError}.\n${callStack}`);
};
exports.SessionParseError = (object) => (_) => {
    exports.log(`Error: ${ErrorEnum._sessionParseError}. Received: ${object}`);
};
exports.SignInInfoMissingError = exports.LogOnly(exports.log)(ErrorEnum._signInfoMissingError);
exports.AccessTokenMissingError = exports.LogOnly(exports.log)(ErrorEnum._accessTokenMissingError);
exports.ExpiresMissingError = exports.LogOnly(exports.log)(ErrorEnum._expiresInMissingError);
exports.NoDataRetrievedError = (key) => (_) => exports.log(`${ErrorEnum._noDataRetrievedError} using key: ${key}`);
exports.StoringError = (err, key, value) => (_) => exports.log(`${err}\n${ErrorEnum._storeError} using key: ${key} and value ${value}`);
//# sourceMappingURL=ErrorFunctions.js.map