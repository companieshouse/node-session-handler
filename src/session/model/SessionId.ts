import { CookieValidator } from "../../CookieValidator";
import { Either } from "purify-ts";
import { Encoding } from "../../encoding/Encoding";
import { Failure } from "../../error/FailureType";
import { UnverifiedSession } from "./Session";

export class SessionId {

    public readonly value: string;
    private constructor(sessionIdValue: string) {
        this.value = sessionIdValue;
    }

    public static getValidatedSessionId(sessionCookie: string): Either<Failure, SessionId> {
        return CookieValidator.extractSessionId(sessionCookie)
            .map(idSuccess => new SessionId(idSuccess));
    }

    public static async randomSessionId(): Promise<SessionId> {
        return new SessionId(await Encoding.generateSessionId());
    }
};