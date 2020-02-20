import { Encoding } from "../../src/encoding/Encoding";
import { CookieConfig } from "../../src/config/CookieConfig";
import { VerifiedSession, Session } from "../../src/session/model/Session";
import { Cookie } from "../../src/session/model/Cookie";
import { SessionKey } from "../../src/session/keys/SessionKey";
import { SignInInfoKeys } from "../../src/session/keys/SignInInfoKeys";
import { IAccessToken, ISession } from "../../src/session/model/SessionInterfaces";
import { AccessTokenKeys } from "../../src/session/keys/AccessTokenKeys";
import { generateRandomBytesBase64, generateSessionId, generateSignature } from "../../src/utils/CookieUtils";


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

export function generateValidSessionCookie(config: CookieConfig): string {
    return Encoding.encode(new Session(getValidSessionDataJson(config)));
}

export function unmarshall(session: Session): any {
    const obj: any = {};
        const thisObj: any = session.data;
        obj[SessionKey.Id] = session.data[SessionKey.Id];
        const keys = Object.keys(thisObj).sort()
        for (const i in keys) {
            if (thisObj.hasOwnProperty(keys[i])) {
                obj[keys[i]] = thisObj[keys[i]];

            }
        }

        return obj;
}

export function createNewVerifiedSession(
    config: CookieConfig,
    extraData?: any): VerifiedSession {

    const newCookie: Cookie = Cookie.newCookie(config.cookieSecret);

    const accessToken = createDefaultAccessToken(3600);

    const signInInfo = {
        [SignInInfoKeys.AccessToken]: accessToken,
        [SignInInfoKeys.SignedIn]: 0
    };

    const sessionData = !extraData ? {} : extraData;

    sessionData[SessionKey.Id] = newCookie.sessionId;
    sessionData[SessionKey.ClientSig] = newCookie.signature;
    sessionData[SessionKey.SignInInfo] = signInInfo;
    sessionData[SessionKey.Expires] = Date.now() + accessToken.expires_in * 1000;

    return new Session(sessionData) as VerifiedSession;
}

export const createDefaultAccessToken = (expiryPeriod: number): IAccessToken => {
    return {
        [AccessTokenKeys.AccessToken]: generateRandomBytesBase64(64),
        [AccessTokenKeys.ExpiresIn]: expiryPeriod,
        [AccessTokenKeys.RefreshToken]: null,
        [AccessTokenKeys.TokenType]: "temp",
    };
};