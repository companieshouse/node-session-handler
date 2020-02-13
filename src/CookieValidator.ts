import config from "./config";
import { Either, Left, Right } from "purify-ts";
import { SessionLengthError, SignatureCheckError, SessionSecretNotSet } from "./error/ErrorFunctions";
import { Failure } from "./error/FailureType";
import { Encoding, EncondingConstant } from "./encoding/Encoding";

export class CookieValidator {

    public static validateSessionCookieLength =
        (sessionCookie: string): Either<Failure, string> => {

            if (sessionCookie.length < EncondingConstant._cookieValueLength) {
                return Left(Failure(SessionLengthError));
            }
            return Right(sessionCookie);

        };

    public static validateCookieSignature(sessionCookie: string): Either<Failure, string> {

        const signature = sessionCookie
            .substring(EncondingConstant._signatureStart, EncondingConstant._cookieValueLength);

        const sessionId = sessionCookie.substring(0, EncondingConstant._signatureStart);

        if (!config.session.secret) {
            return Left(Failure(SessionSecretNotSet));
        }

        const expectedSig = Encoding.generateSignature(sessionId, config.session.secret);

        if (signature !== expectedSig) {

            return Left(Failure(SignatureCheckError(expectedSig, signature)));
        }

        return Right(sessionId);
    };

    public static extractSessionId(sessionCookie: string): Either<Failure, string> {
        return Either.of<Failure, string>(sessionCookie)
            .chain(CookieValidator.validateSessionCookieLength)
            .chain(CookieValidator.validateCookieSignature);
    }

}


