import SessionKeys from "./SessionKeys";
import config from "../config";

class AccessTokenData {

    expiresIn?: number;
    refreshToken?: any; // Todo: fix these types
    token?: any;
    tokenType?: any;

    constructor(data: any) {
        this.expiresIn = data[SessionKeys.ExpiresIn];
        this.refreshToken = data[SessionKeys.RefreshToken];
        this.token = data[SessionKeys.AccessToken];
        this.tokenType = data[SessionKeys.TokenType];
    }

    static createDefault() {
        return new AccessTokenData({
            [SessionKeys.ExpiresIn]: Date.now() + config.session.expiryPeriod,
            [SessionKeys.RefreshToken]: "Hello", // Todo fix all this
            [SessionKeys.AccessToken]: "Hello",
            [SessionKeys.TokenType]: "Hello"
        });
    }
}

export = AccessTokenData;
