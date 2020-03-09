import { Request } from "express";
import { createLogger } from "ch-node-logging";
import ApplicationLogger = require('ch-node-logging/lib/ApplicationLogger');

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

export const NAMESPACE = "ch-node-session-handler";

let mAppLogger: ApplicationLogger;

export const appLogger = () => {
    if (!mAppLogger) {
        mAppLogger = createLogger(NAMESPACE);
    }
    return mAppLogger
};

type Logger = (m: string) => void;
export const log: Logger = (message: string) => console.log(message);
export const logDifference = (baseLogger: Logger) => <A>(expected: A, actual: A): Logger => (message: string) =>
    baseLogger(`${message}\nExpected: ${expected}\nActual: ${actual}`);

export type ResponseHandler = (request: Request) => void;
export type ResponseErrorHandlerFactory = (logger: Logger) => (request: Request) => (errorEnum: ErrorEnum) => void;

export const LogOnlyAdapter = (logger: Logger) => (errorEnum: ErrorEnum): ResponseHandler => {
    return (response: Request) => {
        logger(errorEnum);
    };
};

export const LogRequestAdapter = (logger: Logger, m?: string) => (errorEnum: ErrorEnum): ResponseHandler => {
    return (request: Request) => {
        appLogger().errorRequest(request, errorEnum);
        logger(m);

    };
};
export const SessionLengthError =
    (expected: number, actual: number) =>
        LogRequestAdapter(logDifference(appLogger().error)(expected, actual))(ErrorEnum._sessionLengthError);

export const SignatureCheckError =
    (expected: string, actual: string) =>
        LogRequestAdapter(logDifference(appLogger().error)(expected, actual))(ErrorEnum._signatureCheckError);

export const SessionExpiredError: ResponseHandler = LogRequestAdapter(appLogger().error)(ErrorEnum._sessionExpiredError);

export const SessionSecretNotSet: ResponseHandler =
    (_: Request) => {
        appLogger().error(ErrorEnum._sessionSecretNotSet); throw Error(ErrorEnum._sessionSecretNotSet);
    };

export const PromiseError =
    (callStack: any): ResponseHandler =>
        LogRequestAdapter(appLogger().error, `Error: ${ErrorEnum._promiseError}.\n${callStack}`)(ErrorEnum._promiseError);

export const SessionParseError =
    (object: any): ResponseHandler =>
        LogRequestAdapter(appLogger().error, `Error: ${ErrorEnum._sessionParseError}. Received: ${object}`)(ErrorEnum._promiseError);

export const SignInInfoMissingError: ResponseHandler = LogRequestAdapter(appLogger().info)(ErrorEnum._signInfoMissingError);

export const AccessTokenMissingError: ResponseHandler = LogRequestAdapter(log)(ErrorEnum._accessTokenMissingError);

export const ExpiresMissingError: ResponseHandler = LogRequestAdapter(log)(ErrorEnum._expiresInMissingError);

export const NoDataRetrievedError = (key: string): ResponseHandler =>
    LogRequestAdapter(appLogger().error, `${ErrorEnum._noDataRetrievedError} using key: ${key}`)(ErrorEnum._noDataRetrievedError);

export const StoringError = (err: string, key: string, value: string): ResponseHandler =>
    LogRequestAdapter(appLogger().error, `${ErrorEnum._storeError} using key: ${key}`)(ErrorEnum._storeError);
