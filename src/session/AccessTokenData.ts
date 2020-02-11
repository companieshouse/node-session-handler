import SessionKeys from "./SessionKeys";

class AccessTokenData {

    expiresIn?: number;
    refreshToken?: any;
    token?: any;
    tokenType?: any;

    constructor(rawData: any) {

        this.expiresIn = rawData[SessionKeys.ExpiresIn];
        this.refreshToken = rawData[SessionKeys.RefreshToken];
        this.token = rawData[SessionKeys.AccessToken];
        this.tokenType = rawData[SessionKeys.TokenType];
    }
}

export = AccessTokenData;
