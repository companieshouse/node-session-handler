import { Response } from "express";
export declare enum ErrorEnum {
    _sessionLengthError = "Encrypted session token not long enough.",
    _signatureCheckError = "Expected signature does not equal signature provided.",
    _sessionExpiredError = "Session has expired.",
    _sessionSecretNotSet = "Session Secret is not set",
    _signInfoMissingError = "Sign-in information missing.",
    _accessTokenMissingError = "Access Token missing",
    _expiresInMissingError = "Expires in field missing",
    _storeError = "Store error",
    _promiseError = "Promise error",
    _noDataRetrievedError = "No data retrieved from Redis",
    _sessionParseError = "Failed to parse session object"
}
declare type Logger = (m: string) => void;
export declare const log: Logger;
export declare const logDifference: <A>(expected: A, actual: A) => Logger;
export declare type ResponseHandler = (response: Response) => void;
export declare type ResponseErrorHandlerFactory = (logger: Logger) => (response: Response) => (errorEnum: ErrorEnum) => void;
export declare type GeneralErrorHandlerFactory = (errorEnum: ErrorEnum) => (onError: ResponseErrorHandlerFactory) => ResponseHandler;
export declare const LogOnly: (logger: Logger) => (errorEnum: ErrorEnum) => ResponseHandler;
export declare const SessionLengthError: (expected: number, actual: number) => ResponseHandler;
export declare const SignatureCheckError: (expected: string, actual: string) => ResponseHandler;
export declare const SessionExpiredError: (expected: string, actual: string) => ResponseHandler;
export declare const SessionSecretNotSet: ResponseHandler;
export declare const PromiseError: (callStack: any) => ResponseHandler;
export declare const SessionParseError: (object: any) => ResponseHandler;
export declare const SignInInfoMissingError: ResponseHandler;
export declare const AccessTokenMissingError: ResponseHandler;
export declare const ExpiresMissingError: ResponseHandler;
export declare const NoDataRetrievedError: (key: string) => ResponseHandler;
export declare const StoringError: (err: string, key: string, value: string) => ResponseHandler;
export {};
