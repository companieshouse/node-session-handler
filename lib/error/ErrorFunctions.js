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
})(ErrorEnum = exports.ErrorEnum || (exports.ErrorEnum = {}));
exports.redirectURL = "/signin";
exports.log = (message) => console.log(message);
exports.logDifference = (expected) => (actual) => (message) => exports.log(`${message}\nExpected: ${expected}\nActual: ${actual}`);
exports.GeneralSessonError = (errorEnum) => (onError) => {
    return (response) => onError(exports.log)(response)(errorEnum);
};
exports.RedirectHandler = (logger) => (errorEnum) => {
    return (response) => {
        logger(errorEnum);
        response.redirect(exports.redirectURL);
    };
};
exports.SessionLengthError = (expected, actual) => exports.RedirectHandler(exports.logDifference(expected)(actual))(ErrorEnum._sessionLengthError);
exports.SignatureCheckError = (expected, actual) => exports.RedirectHandler(exports.logDifference(expected)(actual))(ErrorEnum._signatureCheckError);
exports.SessionExpiredError = exports.RedirectHandler(exports.log)(ErrorEnum._sessionExpiredError);
exports.SessionSecretNotSet = (_) => {
    exports.log(ErrorEnum._sessionSecretNotSet);
    throw Error(ErrorEnum._sessionSecretNotSet);
};
exports.PromiseError = (callStack) => (_) => {
    exports.log(`Error: ${ErrorEnum._promiseError}.\n${callStack}`);
};
exports.SignInInfoMissingError = exports.RedirectHandler(exports.log)(ErrorEnum._signInfoMissingError);
exports.AccessTokenMissingError = exports.RedirectHandler(exports.log)(ErrorEnum._accessTokenMissingError);
exports.ExpiresMissingError = exports.RedirectHandler(exports.log)(ErrorEnum._expiresInMissingError);
exports.NoDataRetrievedError = (key) => (_) => exports.log(`${ErrorEnum._noDataRetrievedError} using key: ${key}`);
//# sourceMappingURL=ErrorFunctions.js.map