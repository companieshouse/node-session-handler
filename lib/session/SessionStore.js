"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Encoding_1 = require("../encoding/Encoding");
const purify_ts_1 = require("purify-ts");
const FailureType_1 = require("../error/FailureType");
const EitherAsyncUtils_1 = require("../utils/EitherAsyncUtils");
const ErrorFunctions_1 = require("../error/ErrorFunctions");
class SessionStore {
    constructor(redis) {
        this.redis = redis;
        this.load = (cookie) => {
            const decode = EitherAsyncUtils_1.wrapFunction(Encoding_1.Encoding.decode);
            return EitherAsyncUtils_1.wrapValue(cookie)
                .map(_ => _.sessionId)
                .chain(this.redisWrapper.get)
                .chain(decode);
        };
        this.store = (cookie, value) => {
            return this.redisWrapper.set(cookie.sessionId, Encoding_1.Encoding.encode(value));
        };
        this.delete = (cookie) => {
            return this.redisWrapper.del(cookie.sessionId);
        };
        this.redisWrapper = new RedisWrapper(redis);
    }
}
exports.SessionStore = SessionStore;
class RedisWrapper {
    constructor(client) {
        this.client = client;
        this.set = (key, value) => {
            const promise = this.client.set(key, value)
                .then(r => purify_ts_1.Right(r))
                .catch(err => purify_ts_1.Left(FailureType_1.Failure(ErrorFunctions_1.StoringError(err, key, value))));
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
}
//# sourceMappingURL=SessionStore.js.map