export enum ErrorEnum {
    _sessionExpiredError = "Session has expired.",
    _signInfoMissingError = "Sign-in information missing.",
    _accessTokenMissingError = "Access Token missing",
    _expiresInMissingError = "Expires in field missing",
    _sessionParseError = "Failed to parse session object"
}

export const DifferenceError = <A>(expected: A, actual: A, message: string) =>
    new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);

export const SessionExpiredError = (expected: string, actual: string) => DifferenceError(expected, actual, ErrorEnum._sessionExpiredError);

export const SessionParseError = (object: any) => new Error(`Error: ${ErrorEnum._sessionParseError}. Received: ${object}`);

export const SignInInfoMissingError = () => new Error(ErrorEnum._signInfoMissingError);

export const AccessTokenMissingError = () => new Error(ErrorEnum._accessTokenMissingError);

export const ExpiresMissingError = () => new Error(ErrorEnum._expiresInMissingError);
