"use strict";
class SessionError extends Error {
    constructor(message) {
        super(message);
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, SessionError);
        }
        this.name = 'SessionError';
        this.message = message;
    }
}
module.exports = SessionError;
//# sourceMappingURL=SessionError.js.map