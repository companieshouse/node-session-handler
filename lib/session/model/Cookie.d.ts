export declare const validateCookieSignature: (cookieString: string, cookieSecret: string) => void;
export declare class Cookie {
    readonly sessionId: string;
    readonly signature: string;
    private constructor();
    get value(): string;
    static createNew(cookieSecret: string): Cookie;
    static createFrom(cookieString: string): Cookie;
}
