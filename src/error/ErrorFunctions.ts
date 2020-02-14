import { Response } from "express";

export enum ErrorEnum {
    _sessionLengthError = "Encrypted session token not long enough.",
    _signatureCheckError = "Expected signature does not equal signature provided.",
    _sessionExpiredError = "Session has expired.",
    _signInfoMissingError = "Sign-in information missing.",
    _accessTokenMissingError = "Access Token missing",
    _expiresInMissingError = "Expires in field missing",
    _storeError = "Store error",
    _promiseError = "Promise error",
    _noDataRetrievedError = "No data retrieved from Redis"
}

export type ResponseHandler = (response: Response) => void;
export type ResponseErrorHandlerFactory = (response: Response) => (errorEnum: ErrorEnum) => void;
export type GeneralErrorHandlerFactory =
    (errorEnum: ErrorEnum) => (onError: ResponseErrorHandlerFactory) => ResponseHandler;

export const log = (message: string) => console.log(message);

export const GeneralSessonError: GeneralErrorHandlerFactory =
    (errorEnum: ErrorEnum) => (onError: ResponseErrorHandlerFactory): ResponseHandler => {
        return (response: Response) => onError(response)(errorEnum);
    };

export const SessionLengthError: (expected: number, actual: number) => ResponseHandler =
    (expected: number, actual: number) =>
        GeneralSessonError(ErrorEnum._sessionLengthError)((r: Response) => (_: ErrorEnum) => {
            r.redirect("/signin");
            log(`${_}\nExpected: ${expected}\nActual: ${actual}`); r.redirect("/signin");
        });

export const SignatureCheckError: (expected: string, actual: string) => ResponseHandler =
    (expected: string, actual: string) =>
        GeneralSessonError(ErrorEnum._signatureCheckError)((r: Response) => (_: ErrorEnum) => {
            r.redirect("/signin");
            log(`${_}\nExpected: ${expected}\nActual: ${actual}`); r.redirect("/signin");
        });


export const SessionExpiredError: ResponseHandler =
    GeneralSessonError(ErrorEnum._sessionExpiredError)((r: Response) => (_: ErrorEnum) => {
        log(_); r.redirect("/signin");
    });
export const SessionSecretNotSet: ResponseHandler =
    GeneralSessonError(ErrorEnum._sessionExpiredError)((r: Response) => (_: ErrorEnum) => {
        log(_); throw Error("Session Secret is not set");
    });

export const PromiseError =
    (callStack: any): ResponseHandler =>
        GeneralSessonError(ErrorEnum._promiseError)((_: Response) => (err: ErrorEnum) =>
            log(`Error: ${err}.\n${callStack}`));

export const SignInInfoMissingError =
    GeneralSessonError(ErrorEnum._signInfoMissingError)
        ((r: Response) => (_: ErrorEnum) => log(ErrorEnum._signInfoMissingError));

export const AccessTokenMissingError = GeneralSessonError(ErrorEnum._accessTokenMissingError)
    ((r: Response) => (_: ErrorEnum) => log(ErrorEnum._accessTokenMissingError));

export const ExpiresMissingError = GeneralSessonError(ErrorEnum._expiresInMissingError)
    ((r: Response) => (_: ErrorEnum) => log(ErrorEnum._expiresInMissingError));


export const NoDataRetrievedError = (key: string) => GeneralSessonError(ErrorEnum._noDataRetrievedError)
    ((r: Response) => (_: ErrorEnum) => log(`${ErrorEnum._noDataRetrievedError} using key: ${key}`));