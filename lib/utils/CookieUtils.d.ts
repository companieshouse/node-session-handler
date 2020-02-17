import { Either, Tuple } from "purify-ts";
import { Failure } from "../error/FailureType";
export declare enum CookieConstants {
    _idOctets = 21,
    _signatureStart = 28,
    _signatureLength = 27,
    _cookieValueLength = 55
}
export declare function generateSignature(id: string, secret: string): string;
export declare function generateSessionId(): string;
export declare function generateRandomBytesBase64(numBytes: number): string;
export declare function extractSessionId(sessionCookie: string): string;
export declare function extractSignature(sessionCookie: string): string;
export declare const validateCookieSignature: (sessionSecret: string) => (cookieString: string) => Either<Failure, Tuple<string, string>>;
export declare const validateSessionCookieLength: (sessionCookie: string) => Either<Failure, string>;
