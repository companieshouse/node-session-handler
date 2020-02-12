import { SessionKeys } from "../SessionKeys";
import config = require("../../config");

export interface IAccessToken {
    [SessionKeys.AccessToken]?: string;
    [SessionKeys.ExpiresIn]?: number;
    [SessionKeys.RefreshToken]?: string;
    [SessionKeys.TokenType]?: string;
}

// TODO: Fix default values.
export function createDefaultAccessToken(): IAccessToken {
    return {
        [SessionKeys.ExpiresIn]: Date.now() + config.session.expiryPeriod,
        [SessionKeys.RefreshToken]: "Hello",
        [SessionKeys.AccessToken]: "Hello",
        [SessionKeys.TokenType]: "Hello"
    };
}
