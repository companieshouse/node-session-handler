import Encoding from "./encoding";
import config from "./config";
import { Either, Left, Right } from "purify-ts";
import { Response } from "express";

export enum ValidatorConstant {
    _signatureStart = 28,
    _signatureLength = 27,
    _cookieLength = 55
}

export enum ValidatorErrorEnum {
    _sessionLengthError = "Encrypted session token not long enough.",
    _signatureCheckError = "Expected signature does not equal signature provided."
}

export type ValidatorErrorFunction = (response: Response) => ValidatorErrorEnum;
export const SessionLengthError: ValidatorErrorFunction = (response: Response) => {
    response.redirect("/signin");
    return ValidatorErrorEnum._sessionLengthError;
};

export const SignatureCheckError: ValidatorErrorFunction = (response: Response) => {
    response.redirect("/signin");
    return ValidatorErrorEnum._signatureCheckError;
};

export type Success<T> = { result: T; };
export type Failure = { errorFunction: ValidatorErrorFunction; };

export const Success = <T>(result: T): Success<T> => {
    return {
        result
    };
};
export const Failure = (errorFunction: ValidatorErrorFunction): Failure => {
    return {
        errorFunction
    };
};

export class SessionValidator {

    public static validateSessionCookieLength =
        (sessionCookie: string): Either<Failure, Success<string>> => {

            if (sessionCookie.length < ValidatorConstant._cookieLength) {
                return Left(Failure(SessionLengthError));
            }
            return Right(Success(sessionCookie));

        };

    public static validateSessionCookieSignature =
        (sessionCookie: string, sessionIdValue: string): Either<Failure, Success<string>> => {
            const signature = sessionCookie.substring(ValidatorConstant._signatureStart, sessionCookie.length);

            if (signature !== Encoding.generateSha1SumBase64(sessionIdValue + config.session.secret)) {

                return Left(Failure(SignatureCheckError));
            }

            return Right(Success(signature));
        };

}


