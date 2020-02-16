import { SessionKeys } from "../SessionKeys";
export declare class AccessToken {
    readonly [SessionKeys.AccessToken]?: string;
    readonly [SessionKeys.ExpiresIn]?: number;
    readonly [SessionKeys.RefreshToken]?: string;
    readonly [SessionKeys.TokenType]?: string;
    static createDefaultAccessToken(expiryPeriod: number): AccessToken;
}
