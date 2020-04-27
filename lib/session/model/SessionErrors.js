"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class IncompleteSessionDataError extends Error {
    constructor(...pathSegments) {
        super(`Session data is incomplete - ${pathSegments.join(".")} property is missing`);
    }
}
exports.IncompleteSessionDataError = IncompleteSessionDataError;
class SessionExpiredError extends Error {
    constructor(expiryTimeInMilliseconds, currentTimeInMilliseconds) {
        super(`Session expired at ${expiryTimeInMilliseconds} (since UNIX epoch) while current time is ${currentTimeInMilliseconds} (since UNIX epoch)`);
    }
}
exports.SessionExpiredError = SessionExpiredError;
//# sourceMappingURL=SessionErrors.js.map