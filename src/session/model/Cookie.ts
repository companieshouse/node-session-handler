import { Either } from "purify-ts";
import { Failure } from "../../error/FailureType";
import { VerifiedSession } from "./Session";
import { SessionKey } from "../keys/SessionKey";
import { generateSignature, generateSessionId, validateSessionCookieLength, validateCookieSignature } from "../../utils/CookieUtils";

export class Cookie {

    private constructor(public readonly sessionId: string, public readonly signature: string) { }


    public get value(): string {
        return this.sessionId + this.signature;
    }

    public static asCookie = (session: VerifiedSession): Cookie => {
        return new Cookie(session.data[SessionKey.Id], session.data[SessionKey.ClientSig]);
    };

    public static newCookie(sessionSecret: string): Cookie {
        const sessionId = generateSessionId();
        const signature = generateSignature(sessionId, sessionSecret);
        return new Cookie(sessionId, signature);
    }

    public static validateCookieString = (sessionSecret: string) => (cookieString: string): Either<Failure, Cookie> => {
        return Either.of<Failure, string>(cookieString)
            .chain(validateSessionCookieLength)
            .chain(validateCookieSignature(sessionSecret))
            .map(tuple => new Cookie(tuple[0], tuple[1]));
    };

}