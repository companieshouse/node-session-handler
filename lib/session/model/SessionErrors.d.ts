export declare class IncompleteSessionDataError extends Error {
    constructor(...pathSegments: string[]);
}
export declare class SessionExpiredError extends Error {
    constructor(expiryTimeInMilliseconds: number, currentTimeInMilliseconds: number);
}
