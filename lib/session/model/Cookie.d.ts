import { Session } from "../..";
export declare class Cookie {
    readonly sessionId: string;
    readonly signature: string;
    private constructor();
    get value(): string;
    static create(cookieSecret: string): Cookie;
    static representationOf(session: Session, cookieSecret: string): Cookie;
    static validateCookieString: (cookieSecret: string, cookieString: string) => Cookie;
}
