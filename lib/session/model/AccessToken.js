"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SessionKeys_1 = require("../SessionKeys");
class AccessToken {
    static createDefaultAccessToken(expiryPeriod) {
        return {
            [SessionKeys_1.SessionKeys.ExpiresIn]: Date.now() + expiryPeriod,
            [SessionKeys_1.SessionKeys.RefreshToken]: "Hello",
            [SessionKeys_1.SessionKeys.AccessToken]: "Hello",
            [SessionKeys_1.SessionKeys.TokenType]: "Hello"
        };
    }
}
exports.AccessToken = AccessToken;
SessionKeys_1.SessionKeys.AccessToken, SessionKeys_1.SessionKeys.ExpiresIn, SessionKeys_1.SessionKeys.RefreshToken, SessionKeys_1.SessionKeys.TokenType;
//# sourceMappingURL=AccessToken.js.map