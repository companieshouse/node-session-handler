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
export declare const DifferenceError: <A>(expected: A, actual: A, message: string) => Error;
export declare const SessionLengthError: (expected: number, actual: number) => Error;
export declare const SignatureCheckError: (expected: string, actual: string) => Error;
export declare const SessionExpiredError: (expected: string, actual: string) => Error;
export declare const SessionSecretNotSetError: () => Error;
export declare const PromiseError: (callStack: any) => never;
export declare const SessionParseError: (object: any) => Error;
export declare const SignInInfoMissingError: () => Error;
export declare const AccessTokenMissingError: () => Error;
export declare const ExpiresMissingError: () => Error;
export declare const NoDataRetrievedError: (key: string) => never;
export declare const StoringError: (err: string, key: string, value: string) => never;
