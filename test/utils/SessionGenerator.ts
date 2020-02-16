import { Encoding, EncondingConstant } from "../../src/encoding/Encoding";
import { SessionHandlerConfig } from "../../src/SessionHandlerConfig";
import { SessionKeys } from "../../src/session/SessionKeys";
import { VerifiedSession, Session } from "../../src/session/model/Session";


export function getValidSessionDataJson(config: SessionHandlerConfig): any {
    const mockSessionId = Encoding.generateRandomBytesBase64(EncondingConstant._idOctets);
    const expectedSignature = Encoding.generateSignature(mockSessionId, config.cookieSecret);
    return {
        [SessionKeys.Id]: mockSessionId,
        [SessionKeys.ClientSig]: expectedSignature,
        [SessionKeys.Expires]: Date.now() + 1000,
        [SessionKeys.SignInInfo]: {
            [SessionKeys.AccessToken]: {
                access_token: "oKi1z8KY0gXsXu__hy2-YU_JJSdtxOkJ4K5MAE-gOFVzpKt5lvqnFpVeUjhqhVHZ1K8Hkr7M4IYdzJUnOz2hQw",
                expires_in: 3600,
                refresh_token: "y4YXof84bkUeBZlavRlAGfdq5VMkpPm6UR0OYwPvI6i6UDmtEiTQ1Ro-HGCGo01y4ploP4Kdwd6H4dEh8-E_Fg",
                token_type: "Bearer"
            },
            [SessionKeys.SignedIn]: 1
        }
    };
}

export function getValidSessionObject(config: SessionHandlerConfig): VerifiedSession {
    return new Session(getValidSessionDataJson(config)).verify()
        .orDefaultLazy(() => ({ } as VerifiedSession));
}

export function generateValidSessionCookie(config: SessionHandlerConfig): string {
    return Encoding.encodeSession(getValidSessionDataJson(config));
}

export function unmarshall(session: Session): any {
    const obj: any = {};
        const thisObj: any = session.data;
        obj[SessionKeys.Id] = session.data[SessionKeys.Id];
        const keys = Object.keys(thisObj).sort()
        for (const i in keys) {
            if (thisObj.hasOwnProperty(keys[i])) {
                obj[keys[i]] = thisObj[keys[i]];

            }
        }

        return obj;
}