import {
    generateSignature,
    generateSessionId,
    extractSignature,
    extractSessionId
} from "../../utils/CookieUtils";
import { CookieSecretNotSetError, InvalidCookieLengthError, InvalidCookieSignatureError } from "./CookieErrors";
import { CookieConstants } from "../../utils/CookieConstants";

const validateSessionCookieLength = (sessionCookie: string): void => {
    if (sessionCookie.length < CookieConstants._cookieValueLength) {
        throw new InvalidCookieLengthError(sessionCookie.length);
    }
};

const validateCookieSignature = (cookieSecret: string, cookieString: string): void => {
    if (!cookieSecret) {
        throw new CookieSecretNotSetError();
    }

    const actualSignature = extractSignature(cookieString);
    const expectedSignature = generateSignature(cookieString, cookieSecret);

    if (actualSignature !== expectedSignature) {
        throw new InvalidCookieSignatureError(actualSignature, expectedSignature);
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

    public static validateCookieString(cookieSecret: string, cookieString: string): Cookie {
        validateSessionCookieLength(cookieString);
        validateCookieSignature(cookieSecret, cookieString);
        return new Cookie(extractSessionId(cookieString), extractSignature(cookieString))
    }

}
