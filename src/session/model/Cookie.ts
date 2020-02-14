import { Encoding, EncondingConstant } from "../../encoding/Encoding";
import { Either, Left, Right } from "purify-ts";
import { Failure } from "../../error/FailureType";
import { SessionSecretNotSet, SignatureCheckError, SessionLengthError } from "../../error/ErrorFunctions";
import { VerifiedSession } from "./Session";
import { SessionKeys } from "../SessionKeys";

export class Cookie {

    private constructor(public readonly sessionId: string, public readonly signature: string) { }


    public get value(): string {
        return this.sessionId + this.signature;
    }

    public static sessionCookie(verifiedSession: VerifiedSession): Cookie {
        return new Cookie(verifiedSession.data[SessionKeys.SessionId], verifiedSession.data[SessionKeys.ClientSig]);
    }

    public static newCookie(sessionSecret: string): Cookie {
        const sessionId = Encoding.generateSessionId();
        const signature = Encoding.generateSignature(sessionId, sessionSecret);
        return new Cookie(sessionId, signature);
    }

    public static validateCookieString(cookieString: string, sessionSecret: string): Either<Failure, Cookie> {
        return Either.of<Failure, string>(cookieString)
            .chain(Cookie.validateSessionCookieLength)
            .chain(this.extractSessionId)
            .chain(sessionId => this.extractSignature(cookieString)
                .map(signature => new Cookie(sessionId, signature)));
    }

    public static validateSessionCookieLength = (sessionCookie: string): Either<Failure, string> => {

        if (sessionCookie.length < EncondingConstant._cookieValueLength) {
            return Left(Failure(SessionLengthError(EncondingConstant._cookieValueLength, sessionCookie.length)));
        }
        return Right(sessionCookie);

    };

    public static extractSessionId(sessionCookie: string): Either<Failure, string> {
        return Right(sessionCookie.substring(0, EncondingConstant._signatureStart));

    }

    public static extractSignature(sessionCookie: string): Either<Failure, string> {
        return Right(sessionCookie
            .substring(EncondingConstant._signatureStart, EncondingConstant._cookieValueLength));

    }


    public static validateCookieSignature = (sessionSecret: string, sessionId: string, signature: string)
        : Either<Failure, string> => {

        if (!sessionSecret) {
            return Left(Failure(SessionSecretNotSet));
        }

        const expectedSig = Encoding.generateSignature(sessionId, sessionSecret);

        if (signature !== expectedSig) {

            return Left(Failure(SignatureCheckError(expectedSig, signature)));
        }

        return Right(signature);
    };

}