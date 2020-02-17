import { Either } from "purify-ts";
import { Failure } from "../../error/FailureType";
import { VerifiedSession } from "./Session";
export declare class Cookie {
    readonly sessionId: string;
    readonly signature: string;
    private constructor();
    get value(): string;
    static asCookie: (session: VerifiedSession) => Cookie;
    static newCookie(sessionSecret: string): Cookie;
    static validateCookieString: (sessionSecret: string) => (cookieString: string) => Either<Failure, Cookie>;
}
