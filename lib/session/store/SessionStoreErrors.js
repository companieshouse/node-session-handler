"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class NoDataRetrievedError extends Error {
    constructor(key) {
        super(`No data retrieved from data store using key: ${key}`);
    }
}
exports.NoDataRetrievedError = NoDataRetrievedError;
class RetrievalError extends Error {
    constructor(key, err) {
        super(`Data retrieval failed for key ${key} due to error: ${err}`);
    }
}
exports.RetrievalError = RetrievalError;
class StoringError extends Error {
    constructor(key, value, err) {
        super(`Data storing failed for key ${key} and value ${value} due to error: ${err}`);
    }
}
exports.StoringError = StoringError;
class DeletionError extends Error {
    constructor(key, err) {
        super(`Data deletion failed for key ${key} due to error: ${err}`);
    }
}
exports.DeletionError = DeletionError;
//# sourceMappingURL=SessionStoreErrors.js.map