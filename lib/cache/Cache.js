"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const purify_ts_1 = require("purify-ts");
const FailureType_1 = require("../error/FailureType");
const ErrorFunctions_1 = require("../error/ErrorFunctions");
const EitherUtils_1 = require("../utils/EitherUtils");
const IORedis = require("ioredis");
class Cache {
    constructor(client) {
        this.client = client;
        this.set = (key, value) => {
            return EitherUtils_1.eitherPromiseToEitherAsync(this.client.set(key, value)
                .then(r => purify_ts_1.Either.of(r))
                .catch(err => purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.PromiseError(err)))));
        };
        this.get = (key) => {
            return EitherUtils_1.eitherPromiseToEitherAsync(this.client.get(key.sessionId)
                .then(result => purify_ts_1.Either.of(result).chain(r => {
                if (!r)
                    return purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.NoDataRetrievedError(key.value)));
                return purify_ts_1.Right(r);
            })).catch(err => purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.PromiseError(err)))));
        };
        this.del = (key) => {
            return EitherUtils_1.eitherPromiseToEitherAsync(this.client.del(key)
                .then(r => purify_ts_1.Either.of(r))
                .catch(err => purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.PromiseError(err)))));
        };
    }
    static redisInstance(config) {
        return new IORedis(`redis://:${config.cachePassword}@${config.cacheServer}/${config.cacheDB}`);
    }
}
exports.Cache = Cache;
//# sourceMappingURL=Cache.js.map