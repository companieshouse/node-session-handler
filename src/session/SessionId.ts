import { SessionValidator, Failure } from "../SessionValidator";
import { Either } from "purify-ts";

export class SessionId {

    private readonly sessionIdValue: string;
    private constructor(sessionIdValue: string) {
        this.sessionIdValue = sessionIdValue;
    }

    public static validSessionId(
        sessionCookie: string): Either<Failure, SessionId> {
        return SessionValidator.validateSessionCookieLength(sessionCookie)
            .chain(validToken => SessionValidator.validateSessionCookieSignature(signature, sessionIdValue))
            .map(validSignature => new SessionId(sessionIdValue));
    }
};