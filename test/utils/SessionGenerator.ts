import { IAccessToken, ISession } from "../../src/session/model/SessionInterfaces";
import { Session, VerifiedSession } from "../../src/session/model/Session";
import { generateRandomBytesBase64, generateSessionId, generateSignature } from "../../src/utils/CookieUtils";

import { AccessTokenKeys } from "../../src/session/keys/AccessTokenKeys";
import { Cookie } from "../../src/session/model/Cookie";
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { CookieConfig } from "../../src/config/CookieConfig";
import { SessionKey } from "../../src/session/keys/SessionKey";
import { SignInInfoKeys } from "../../src/session/keys/SignInInfoKeys";

export function getValidSessionDataJson(config: CookieConfig): ISession {
    const mockSessionId = generateSessionId();
    const expectedSignature = generateSignature(mockSessionId, config.cookieSecret);
    return {
        [SessionKey.Id]: mockSessionId,
        [SessionKey.ClientSig]: expectedSignature,
        [SessionKey.Expires]: Date.now() + 3600 * 1000,
        [SessionKey.SignInInfo]: {
            [SignInInfoKeys.AccessToken]: {
                access_token: "oKi1z8KY0gXsXu__hy2-YU_JJSdtxOkJ4K5MAE-gOFVzpKt5lvqnFpVeUjhqhVHZ1K8Hkr7M4IYdzJUnOz2hQw",
                expires_in: 3600,
                refresh_token: "y4YXof84bkUeBZlavRlAGfdq5VMkpPm6UR0OYwPvI6i6UDmtEiTQ1Ro-HGCGo01y4ploP4Kdwd6H4dEh8-E_Fg",
                token_type: "Bearer"
            },
            [SignInInfoKeys.SignedIn]: 1
        }
    };
}

export function getValidSessionObject(config: CookieConfig): VerifiedSession {
    return new Session(getValidSessionDataJson(config)).verify()
        .orDefaultLazy(() => ({ } as VerifiedSession));
}

export function createNewVerifiedSession(cookieSecret: string, extraData?: any): VerifiedSession {
    const cookie: Cookie = Cookie.create(cookieSecret);

    const signInInfo = {
        [SignInInfoKeys.AccessToken]: createDefaultAccessToken(3600),
        [SignInInfoKeys.SignedIn]: 0
    };

    const sessionData = !extraData ? {} : extraData;

    sessionData[SessionKey.Id] = cookie.sessionId;
    sessionData[SessionKey.ClientSig] = cookie.signature;
    sessionData[SessionKey.SignInInfo] = signInInfo;
    sessionData[SessionKey.Expires] = Date.now() + createDefaultAccessToken(3600).expires_in * 1000;

    return new Session(sessionData) as VerifiedSession;
}

export const createDefaultAccessToken = (expiryPeriod: number): IAccessToken => {
    return {
        [AccessTokenKeys.AccessToken]: generateRandomBytesBase64(64),
        [AccessTokenKeys.ExpiresIn]: expiryPeriod,
        [AccessTokenKeys.RefreshToken]: null,
        [AccessTokenKeys.TokenType]: "temp"
    };
};
