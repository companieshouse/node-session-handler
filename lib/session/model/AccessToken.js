"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const SessionKeys_1 = require("../SessionKeys");
class AccessToken {
    static createDefaultAccessToken(expiryPeriod) {
        return {
            [SessionKeys_1.SessionKeys.ExpiresIn]: expiryPeriod,
            [SessionKeys_1.SessionKeys.TokenType]: "temp"
        };
    }
}
exports.AccessToken = AccessToken;
SessionKeys_1.SessionKeys.AccessToken, SessionKeys_1.SessionKeys.ExpiresIn, SessionKeys_1.SessionKeys.RefreshToken, SessionKeys_1.SessionKeys.TokenType;
//# sourceMappingURL=AccessToken.js.map