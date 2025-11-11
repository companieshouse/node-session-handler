export declare class CookieSecretNotSetError extends Error {
    constructor();
}
export declare class InvalidCookieLengthError extends Error {
    constructor(length: number);
}
export declare class InvalidCookieSignatureError extends Error {
    constructor(actualSignature: string, expectedSignature: string);
}
