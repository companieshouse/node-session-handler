import { Either } from "purify-ts";
import { Failure } from "../../error/FailureType";
import { VerifiedSession } from "./Session";
export declare class Cookie {
    readonly sessionId: string;
    readonly signature: string;
    private constructor();
    get value(): string;
    static sessionCookie(verifiedSession: VerifiedSession): Cookie;
    static newCookie(sessionSecret: string): Cookie;
    static validateCookieString(cookieString: string, sessionSecret: string): Either<Failure, Cookie>;
    static validateSessionCookieLength: (sessionCookie: string) => Either<Failure, string>;
    static extractSessionId(sessionCookie: string): Either<Failure, string>;
    static extractSignature(sessionCookie: string): Either<Failure, string>;
    static validateCookieSignature: (sessionSecret: string, sessionId: string, signature: string) => Either<Failure, string>;
}
