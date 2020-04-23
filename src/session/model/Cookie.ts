import { SessionKey } from "../keys/SessionKey";
import {
    generateSignature,
    generateSessionId,
    extractSignature,
    extractSessionId
} from "../../utils/CookieUtils";
import { CookieSecretNotSetError, InvalidCookieLengthError, InvalidCookieSignatureError } from "./CookieErrors";
import { CookieConstants } from "../../utils/CookieConstants";
import { Session } from "../..";

const validateCookieSignature = (cookieSecret: string, cookieString: string): void => {
    if (!cookieSecret) {
        throw new CookieSecretNotSetError();
    }

    const sig = extractSignature(cookieString);

    const expectedSig = generateSignature(cookieString, cookieSecret);

    if (sig !== expectedSig) {
        throw new InvalidCookieSignatureError(sig, expectedSig);
    }

};

const validateSessionCookieLength = (sessionCookie: string): void => {
    if (sessionCookie.length < CookieConstants._cookieValueLength) {
        throw new InvalidCookieLengthError(sessionCookie.length);
    }
};

export class Cookie {

    private constructor(public readonly sessionId: string, public readonly signature: string) {
        if (!sessionId) {
            throw new Error("Session ID is required");
        }
        if (!signature) {
            throw new Error("Signature is required");
        }
    }

    public get value(): string {
        return this.sessionId + this.signature;
    }

    public static create(cookieSecret: string): Cookie {
        const sessionId = generateSessionId();
        const signature = generateSignature(sessionId, cookieSecret);
        return new Cookie(sessionId, signature);
    }

    public static representationOf(session: Session, cookieSecret: string): Cookie {
        const id = session.data[SessionKey.Id];
        return new Cookie(id, generateSignature(id, cookieSecret));
    }

    public static validateCookieString(cookieSecret: string, cookieString: string): Cookie {
        validateSessionCookieLength(cookieString);
        validateCookieSignature(cookieSecret, cookieString);
        return new Cookie(extractSessionId(cookieString), extractSignature(cookieString))
    }

}
