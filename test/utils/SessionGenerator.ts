import { AccessTokenKeys } from "../../src/session/keys/AccessTokenKeys";
import { SessionKey } from "../../src/session/keys/SessionKey";
import { SignInInfoKeys } from "../../src/session/keys/SignInInfoKeys";
import { Cookie } from "../../src/session/model/Cookie";
import { Session } from "../../src/session/model/Session";
import { IAccessToken } from "../../src/session/model/SessionInterfaces";
import { generateRandomBytesBase64 } from "../../src/utils/CookieUtils";

export function createSession(cookieSecret: string, extraData?: any): Session {
    return new Session(createSessionData(cookieSecret, extraData));
}

export function createSessionData(cookieSecret: string, extraData?: any): any {
    const cookie: Cookie = Cookie.createNew(cookieSecret);
    const expiryTimeInSeconds = 3600

    const sessionData = extraData ? extraData : {};
    sessionData[SessionKey.Id] = cookie.sessionId;
    sessionData[SessionKey.ClientSig] = cookie.signature;
    sessionData[SessionKey.SignInInfo] = {
        [SignInInfoKeys.AccessToken]: createDefaultAccessToken(expiryTimeInSeconds),
        [SignInInfoKeys.SignedIn]: 0
    };
    sessionData[SessionKey.Expires] = Date.now() + expiryTimeInSeconds * 1000;

    return sessionData;
}

const createDefaultAccessToken = (expiryPeriod: number): IAccessToken => {
    return {
        [AccessTokenKeys.AccessToken]: generateRandomBytesBase64(64),
        [AccessTokenKeys.RefreshToken]: generateRandomBytesBase64(64),
        [AccessTokenKeys.ExpiresIn]: expiryPeriod,
        [AccessTokenKeys.TokenType]: "Bearer"
    };
};
