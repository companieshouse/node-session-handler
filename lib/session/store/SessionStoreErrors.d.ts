export declare class NoDataRetrievedError extends Error {
    constructor(key: string);
}
export declare class RetrievalError extends Error {
    constructor(key: string, err: Error);
}
export declare class StoringError extends Error {
    constructor(key: string, value: string, err: Error);
}
export declare class DeletionError extends Error {
    constructor(key: string, err: Error);
}
