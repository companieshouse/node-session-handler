export class NoDataRetrievedError extends Error {
    constructor (key: string) {
        super(`No data retrieved from data store using key: ${key}`);
    }
}

export class RetrievalError extends Error {
    constructor (key: string, err: Error) {
        super(`Data retrieval failed for key ${key} due to error: ${err}`);
    }
}

export class StoringError extends Error {
    constructor (key: string, value: string, err: Error) {
        super(`Data storing failed for key ${key} and value ${value} due to error: ${err}`);
    }
}

export class DeletionError extends Error {
    constructor (key: string, err: Error) {
        super(`Data deletion failed for key ${key} due to error: ${err}`);
    }
}
