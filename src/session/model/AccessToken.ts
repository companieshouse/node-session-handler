import { SessionKeys } from "../SessionKeys";

export class AccessToken {
    public readonly [SessionKeys.AccessToken]?: string;
    public readonly [SessionKeys.ExpiresIn]?: number;
    public readonly [SessionKeys.RefreshToken]?: string;
    public readonly [SessionKeys.TokenType]?: string;

    public static createDefaultAccessToken(expiryPeriod: number): AccessToken {
        return {
            [SessionKeys.ExpiresIn]: expiryPeriod,
            [SessionKeys.TokenType]: "temp"
        };
    }

}

