import { Either } from "purify-ts";
import { Failure } from "../../error/FailureType";
import { VerifiedSession } from "./Session";
export declare class Cookie {
    readonly sessionId: string;
    readonly signature: string;
    private constructor();
    get value(): string;
    static create(cookieSecret: string): Cookie;
    static createFrom(session: VerifiedSession): Cookie;
    static validateCookieString: (cookieSecret: string) => (cookieString: string) => Either<Failure, Cookie>;
}
