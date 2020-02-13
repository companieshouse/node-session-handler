import { SessionKeys } from "../SessionKeys";
import config = require("../../config");

export class AccessToken {
    public readonly [SessionKeys.AccessToken]?: string;
    public readonly [SessionKeys.ExpiresIn]?: number;
    public readonly [SessionKeys.RefreshToken]?: string;
    public readonly [SessionKeys.TokenType]?: string;

    public static createDefaultAccessToken(): AccessToken {
        return {
            [SessionKeys.ExpiresIn]: this.generateExpiry(),
            [SessionKeys.RefreshToken]: "Hello",
            [SessionKeys.AccessToken]: "Hello",
            [SessionKeys.TokenType]: "Hello"
        };
    }

    public static generateExpiry(): number {
        return Date.now() + config.session.expiryPeriod;
    }
}

