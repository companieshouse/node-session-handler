"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const purify_ts_1 = require("purify-ts");
const FailureType_1 = require("../error/FailureType");
const ErrorFunctions_1 = require("../error/ErrorFunctions");
const EitherAsyncUtils_1 = require("../utils/EitherAsyncUtils");
const IORedis = require("ioredis");
class Cache {
    constructor(client) {
        this.client = client;
        this.set = (key, value) => {
            const promise = this.client.set(key, value)
                .then(r => purify_ts_1.Right(r))
                .catch(err => purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.PromiseError(err))));
            return EitherAsyncUtils_1.wrapPromise(promise);
        };
        this.get = (key) => {
            const checkIfResultEmpty = (result) => {
                if (!result) {
                    return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.NoDataRetrievedError(key)));
                }
                return purify_ts_1.Right(result);
            };
            const promise = () => this.client.get(key)
                .then(checkIfResultEmpty)
                .catch(err => purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.PromiseError(err))));
            return EitherAsyncUtils_1.wrapPromise(promise());
        };
        this.del = (key) => {
            const promise = this.client.del(key)
                .then(r => purify_ts_1.Right(r))
                .catch(err => purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.PromiseError(err))));
            return EitherAsyncUtils_1.wrapPromise(promise);
        };
    }
    static redisInstance(config) {
        return new IORedis(`redis://:${config.cachePassword}@${config.cacheServer}/${config.cacheDB}`);
    }
}
exports.Cache = Cache;
//# sourceMappingURL=Cache.js.map