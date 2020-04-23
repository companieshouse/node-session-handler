export declare enum ErrorEnum {
    _sessionExpiredError = "Session has expired.",
    _signInfoMissingError = "Sign-in information missing.",
    _accessTokenMissingError = "Access Token missing",
    _expiresInMissingError = "Expires in field missing",
    _sessionParseError = "Failed to parse session object"
}
export declare const DifferenceError: <A>(expected: A, actual: A, message: string) => Error;
export declare const SessionExpiredError: (expected: string, actual: string) => Error;
export declare const SessionParseError: (object: any) => Error;
export declare const SignInInfoMissingError: () => Error;
export declare const AccessTokenMissingError: () => Error;
export declare const ExpiresMissingError: () => Error;
