export class IncompleteSessionDataError extends Error {
    constructor (...pathSegments: string[]) {
        super(`Session data is incomplete - ${pathSegments.join(".")} property is missing`)
    }
}

export class SessionExpiredError extends Error {
    constructor (expiryTimeInMilliseconds: number, currentTimeInMilliseconds: number) {
        super(`Session expired at ${expiryTimeInMilliseconds} (since UNIX epoch) while current time is ${currentTimeInMilliseconds} (since UNIX epoch)`);
    }
}
