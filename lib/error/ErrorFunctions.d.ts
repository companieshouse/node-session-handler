import { Request } from "express";
import ApplicationLogger from "ch-node-logging/lib/ApplicationLogger";
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
export declare const NAMESPACE = "ch-node-session-handler";
export declare const appLogger: () => ApplicationLogger;
declare type Logger = (m: string) => void;
export declare const log: Logger;
export declare const logDifference: (baseLogger: Logger) => <A>(expected: A, actual: A) => Logger;
export declare type ResponseHandler = (request: Request) => void;
export declare type ResponseErrorHandlerFactory = (logger: Logger) => (request: Request) => (errorEnum: ErrorEnum) => void;
export declare const LogOnlyAdapter: (logger: Logger) => (errorEnum: ErrorEnum) => ResponseHandler;
export declare const LogRequestAdapter: (logger: Logger, m?: string) => (errorEnum: ErrorEnum) => ResponseHandler;
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
