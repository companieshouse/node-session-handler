import SessionKeys from "./SessionKeys";
import config from "../config";

class AccessTokenData {

    expiresIn?: number;
    refreshToken?: any; // Todo: fix these types
    token?: any;
    tokenType?: any;

    constructor(rawData: any) {

        this.expiresIn = rawData[SessionKeys.ExpiresIn];
        this.refreshToken = rawData[SessionKeys.RefreshToken];
        this.token = rawData[SessionKeys.AccessToken];
        this.tokenType = rawData[SessionKeys.TokenType];
    }

    static createDefault() {

        return new AccessTokenData({
            [SessionKeys.ExpiresIn]: Date.now() + config.session.expiryPeriod,
            [SessionKeys.RefreshToken]: "Hello",
            [SessionKeys.AccessToken]: "Hello",
            [SessionKeys.TokenType]: "Hello"
        });
    }
}

export = AccessTokenData;
