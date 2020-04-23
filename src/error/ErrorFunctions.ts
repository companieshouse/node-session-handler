export enum ErrorEnum {
    _sessionLengthError = "Encrypted session token not long enough.",
    _signatureCheckError = "Expected signature does not equal signature provided.",
    _sessionExpiredError = "Session has expired.",
    _sessionSecretNotSet = "Session Secret is not set",
    _signInfoMissingError = "Sign-in information missing.",
    _accessTokenMissingError = "Access Token missing",
    _expiresInMissingError = "Expires in field missing",
    _sessionParseError = "Failed to parse session object"
}

export const DifferenceError = <A>(expected: A, actual: A, message: string) =>
    new Error(`${message}\nExpected: ${expected}\nActual: ${actual}`);


export const SessionLengthError =
    (expected: number, actual: number) =>
        DifferenceError(expected, actual, ErrorEnum._sessionLengthError);

export const SignatureCheckError =
    (expected: string, actual: string) => DifferenceError(expected, actual, ErrorEnum._signatureCheckError);


export const SessionExpiredError = (expected: string, actual: string) => DifferenceError(expected, actual, ErrorEnum._sessionExpiredError);

export const SessionSecretNotSetError = () => new Error(ErrorEnum._sessionSecretNotSet);

export const SessionParseError = (object: any) => new Error(`Error: ${ErrorEnum._sessionParseError}. Received: ${object}`);

export const SignInInfoMissingError = () => new Error(ErrorEnum._signInfoMissingError);

export const AccessTokenMissingError = () => new Error(ErrorEnum._accessTokenMissingError);

export const ExpiresMissingError = () => new Error(ErrorEnum._expiresInMissingError);
