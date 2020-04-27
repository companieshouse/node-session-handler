import { CookieConstants } from "../../utils/CookieConstants";

export class CookieSecretNotSetError extends Error {
    constructor () {
        super("Cookie secret is not set");
    }
}

export class InvalidCookieLengthError extends Error {
    constructor (length: number) {
        super(`Cookie string is not long enough - it is ${length} characters long while it should have ${CookieConstants._cookieValueLength} characters`);
    }
}

export class InvalidCookieSignatureError extends Error {
    constructor (actualSignature: string, expectedSignature: string) {
        super(`Cookie signature is invalid - it is ${actualSignature} while it should be ${expectedSignature}`);
    }
}
