import { Response } from "express";

export enum ErrorEnum {
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

type Logger = (m: string) => void;
export const log: Logger = (message: string) => console.log(message);
export const logDifference = <A>(expected: A, actual: A): Logger => (message: string) =>
    log(`${message}\nExpected: ${expected}\nActual: ${actual}`);

export type ResponseHandler = (response: Response) => void;
export type ResponseErrorHandlerFactory = (logger: Logger) => (response: Response) => (errorEnum: ErrorEnum) => void;
export type GeneralErrorHandlerFactory =
    (errorEnum: ErrorEnum) => (onError: ResponseErrorHandlerFactory) => ResponseHandler;

export const LogOnly = (logger: Logger) => (errorEnum: ErrorEnum): ResponseHandler => {
    return (response: Response) => {
        logger(errorEnum);
    };
};
export const SessionLengthError =
    (expected: number, actual: number) =>
        LogOnly(logDifference(expected, actual))(ErrorEnum._sessionLengthError);

export const SignatureCheckError =
    (expected: string, actual: string) =>
        LogOnly(logDifference(expected, actual))(ErrorEnum._signatureCheckError);

export const SessionExpiredError: ResponseHandler = LogOnly(log)(ErrorEnum._sessionExpiredError);

export const SessionSecretNotSet: ResponseHandler =
    (_: Response) => {
        log(ErrorEnum._sessionSecretNotSet); throw Error(ErrorEnum._sessionSecretNotSet);
    };

export const PromiseError =
    (callStack: any): ResponseHandler =>
        (_: Response) => {
            log(`Error: ${ErrorEnum._promiseError}.\n${callStack}`);
        };
export const SessionParseError =
    (object: any): ResponseHandler =>
        (_: Response) => {
            log(`Error: ${ErrorEnum._sessionParseError}. Received: ${object}`);
        };

export const SignInInfoMissingError: ResponseHandler = LogOnly(log)(ErrorEnum._signInfoMissingError);

export const AccessTokenMissingError: ResponseHandler = LogOnly(log)(ErrorEnum._accessTokenMissingError);

export const ExpiresMissingError: ResponseHandler = LogOnly(log)(ErrorEnum._expiresInMissingError);

export const NoDataRetrievedError = (key: string): ResponseHandler =>
    (_: Response) => log(`${ErrorEnum._noDataRetrievedError} using key: ${key}`);

export const StoringError = (err: string, key: string, value: string): ResponseHandler =>
    (_: Response) => log(`${err}\n${ErrorEnum._storeError} using key: ${key} and value ${value}`);