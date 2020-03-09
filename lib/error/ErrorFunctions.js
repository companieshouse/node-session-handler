"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ch_node_logging_1 = require("ch-node-logging");
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
exports.NAMESPACE = "ch-node-session-handler";
let mAppLogger;
exports.appLogger = () => {
    if (!mAppLogger) {
        mAppLogger = ch_node_logging_1.createLogger(exports.NAMESPACE);
    }
    return mAppLogger;
};
exports.log = (message) => console.log(message);
exports.logDifference = (baseLogger) => (expected, actual) => (message) => baseLogger(`${message}\nExpected: ${expected}\nActual: ${actual}`);
exports.LogOnlyAdapter = (logger) => (errorEnum) => {
    return (response) => {
        logger(errorEnum);
    };
};
exports.LogRequestAdapter = (logger, m) => (errorEnum) => {
    return (request) => {
        exports.appLogger().errorRequest(request, errorEnum);
        logger(m);
    };
};
exports.SessionLengthError = (expected, actual) => exports.LogRequestAdapter(exports.logDifference(exports.appLogger().error)(expected, actual))(ErrorEnum._sessionLengthError);
exports.SignatureCheckError = (expected, actual) => exports.LogRequestAdapter(exports.logDifference(exports.appLogger().error)(expected, actual))(ErrorEnum._signatureCheckError);
exports.SessionExpiredError = (expected, actual) => exports.LogRequestAdapter(exports.logDifference(exports.appLogger().error)(expected, actual))(ErrorEnum._sessionExpiredError);
exports.SessionSecretNotSet = (_) => {
    exports.LogOnlyAdapter(exports.appLogger().error)(ErrorEnum._sessionSecretNotSet);
    throw Error(ErrorEnum._sessionSecretNotSet);
};
exports.PromiseError = (callStack) => exports.LogRequestAdapter(exports.appLogger().error, `Error: ${ErrorEnum._promiseError}.\n${callStack}`)(ErrorEnum._promiseError);
exports.SessionParseError = (object) => exports.LogRequestAdapter(exports.appLogger().error, `Error: ${ErrorEnum._sessionParseError}. Received: ${object}`)(ErrorEnum._promiseError);
exports.SignInInfoMissingError = exports.LogRequestAdapter(exports.appLogger().info)(ErrorEnum._signInfoMissingError);
exports.AccessTokenMissingError = exports.LogRequestAdapter(exports.log)(ErrorEnum._accessTokenMissingError);
exports.ExpiresMissingError = exports.LogRequestAdapter(exports.log)(ErrorEnum._expiresInMissingError);
exports.NoDataRetrievedError = (key) => exports.LogRequestAdapter(exports.appLogger().error, `${ErrorEnum._noDataRetrievedError} using key: ${key}`)(ErrorEnum._noDataRetrievedError);
exports.StoringError = (err, key, value) => exports.LogRequestAdapter(exports.appLogger().error, `${ErrorEnum._storeError} using key: ${key}`)(ErrorEnum._storeError);
//# sourceMappingURL=ErrorFunctions.js.map