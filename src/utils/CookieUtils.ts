import * as crypto from "crypto";
import { Either, Left, Right, Tuple } from "purify-ts";
import { Failure } from "../error/FailureType";
import { SessionSecretNotSet, SignatureCheckError, SessionLengthError } from "../error/ErrorFunctions";

export enum CookieConstants {
    _idOctets = (7 * 3),
    _signatureStart = (_idOctets * 4) / 3,
    _signatureLength = 27,
    _cookieValueLength = _signatureStart + _signatureLength
}

export function generateSignature(id: string, secret: string): string {
    const adjustedId = id.substr(0, CookieConstants._idOctets);
    const value = crypto
        .createHash("sha1")
        .update(adjustedId + secret)
        .digest("base64");
    return value.substr(0, CookieConstants._signatureLength);
}

export function generateSessionId(): string {
    return generateRandomBytesBase64(CookieConstants._idOctets);
}

export function generateRandomBytesBase64(numBytes: number): string {
    return crypto.randomBytes(numBytes).toString("base64");
}

export function extractSessionId(sessionCookie: string): string {
    return sessionCookie.substring(0, CookieConstants._signatureStart);
}

export function extractSignature(sessionCookie: string): string {
    return sessionCookie.substring(CookieConstants._signatureStart, CookieConstants._cookieValueLength);
}

export const validateCookieSignature = (sessionSecret: string) => (cookieString: string): Either<Failure, Tuple<string, string>> => {

    if (!sessionSecret) {
        return Left(Failure(SessionSecretNotSet));
    }

    const id = extractSessionId(cookieString);
    const sig = extractSignature(cookieString);

    const expectedSig = generateSignature(id, sessionSecret);

    if (sig !== expectedSig) {

        return Left(Failure(SignatureCheckError(expectedSig, sig)));
    }
    return Right(Tuple(id, sig));
};

export const validateSessionCookieLength = (sessionCookie: string): Either<Failure, string> => {
    if (sessionCookie.length < CookieConstants._cookieValueLength) {
        return Left(Failure(SessionLengthError(CookieConstants._cookieValueLength, sessionCookie.length)));
    }
    return Right(sessionCookie);

};

