import { Response, RequestHandler } from "express";

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
    _noDataRetrievedError = "No data retrieved from Redis"
}
export const redirectURL = "/signin";


type Logger = (m: string) => void;
export const log: Logger = (message: string) => console.log(message);
export const logDifference = <A>(expected: A) => (actual: A): Logger => (message: string) =>
    log(`${message}\nExpected: ${expected}\nActual: ${actual}`);

export type ResponseHandler = (response: Response) => void;
export type ResponseErrorHandlerFactory = (logger: Logger) => (response: Response) => (errorEnum: ErrorEnum) => void;
export type GeneralErrorHandlerFactory =
    (errorEnum: ErrorEnum) => (onError: ResponseErrorHandlerFactory) => ResponseHandler;


export const GeneralSessonError: GeneralErrorHandlerFactory =
    (errorEnum: ErrorEnum) => (onError: ResponseErrorHandlerFactory): ResponseHandler => {
        return (response: Response) => onError(log)(response)(errorEnum);
    };

export const RedirectHandler = (logger: Logger) => (errorEnum: ErrorEnum): ResponseHandler => {
    return (response: Response) => {
        logger(errorEnum);
        response.redirect(redirectURL);
    };
};
export const SessionLengthError =
    (expected: number, actual: number) =>
        RedirectHandler(logDifference(expected)(actual))(ErrorEnum._sessionLengthError);

export const SignatureCheckError =
    (expected: string, actual: string) =>
        RedirectHandler(logDifference(expected)(actual))(ErrorEnum._signatureCheckError);


export const SessionExpiredError: ResponseHandler = RedirectHandler(log)(ErrorEnum._sessionExpiredError);

export const SessionSecretNotSet: ResponseHandler =
    (_: Response) => {
        log(ErrorEnum._sessionSecretNotSet); throw Error(ErrorEnum._sessionSecretNotSet);
    };

export const PromiseError =
    (callStack: any): ResponseHandler =>
        (_: Response) => {
            log(`Error: ${ErrorEnum._promiseError}.\n${callStack}`);
        };

export const SignInInfoMissingError: ResponseHandler = RedirectHandler(log)(ErrorEnum._signInfoMissingError);

export const AccessTokenMissingError: ResponseHandler = RedirectHandler(log)(ErrorEnum._accessTokenMissingError);

export const ExpiresMissingError: ResponseHandler = RedirectHandler(log)(ErrorEnum._expiresInMissingError);

export const NoDataRetrievedError = (key: string): ResponseHandler =>
    (_: Response) => log(`${ErrorEnum._noDataRetrievedError} using key: ${key}`);