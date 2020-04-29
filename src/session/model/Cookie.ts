import {
    generateSignature,
    generateSessionId,
    extractSignature,
    extractSessionId
} from "../../utils/CookieUtils";
import { CookieSecretNotSetError, InvalidCookieLengthError, InvalidCookieSignatureError } from "./CookieErrors";
import { CookieConstants } from "../../utils/CookieConstants";
import { loggerInstance } from "../../Logger";

const validateSessionCookieLength = (sessionCookie: string): void => {
    if (sessionCookie.length < CookieConstants._cookieValueLength) {
        throw new InvalidCookieLengthError(sessionCookie.length);
    }
};

export const validateCookieSignature = (cookieString: string, cookieSecret: string): void => {
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

    public static createNew(cookieSecret: string): Cookie {
        const sessionId = generateSessionId();
        const signature = generateSignature(sessionId, cookieSecret);

        loggerInstance().debug(`Creating cookie - SESSION ID: ${sessionId}`);
        return new Cookie(sessionId, signature);
    }

    public static createFrom(cookieString: string): Cookie {
        validateSessionCookieLength(cookieString);
        return new Cookie(extractSessionId(cookieString), extractSignature(cookieString))
    }

}
