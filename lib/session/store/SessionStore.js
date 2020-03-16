"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Encoding_1 = require("../../encoding/Encoding");
const ErrorFunctions_1 = require("../../error/ErrorFunctions");
const SessionKey_1 = require("../keys/SessionKey");
const TimeUtils_1 = require("../../utils/TimeUtils");
class SessionStore {
    constructor(redis) {
        this.redis = redis;
        this.load = (cookie) => __awaiter(this, void 0, void 0, function* () {
            try {
                return Encoding_1.Encoding.decode(yield this.redisWrapper.get(cookie.sessionId));
            }
            catch (err) {
                console.error(err);
            }
        });
        this.store = (cookie, value, timeToLiveInSeconds = 3600) => __awaiter(this, void 0, void 0, function* () {
            try {
                value[SessionKey_1.SessionKey.Expires] = TimeUtils_1.getSecondsSinceEpoch() + timeToLiveInSeconds;
                return this.redisWrapper.set(cookie.sessionId, Encoding_1.Encoding.encode(value), timeToLiveInSeconds);
            }
            catch (err) {
                console.error(err);
            }
        });
        this.delete = (cookie) => __awaiter(this, void 0, void 0, function* () {
            try {
                return this.redisWrapper.del(cookie.sessionId);
            }
            catch (err) {
                console.error(err);
            }
        });
        this.redisWrapper = new RedisWrapper(redis);
    }
}
exports.SessionStore = SessionStore;
class RedisWrapper {
    constructor(client) {
        this.client = client;
        this.set = (key, value, timeToLiveInSeconds) => __awaiter(this, void 0, void 0, function* () {
            const promise = this.client.set(key, value, "EX", timeToLiveInSeconds)
                .catch(err => ErrorFunctions_1.StoringError(err, key, value));
            return promise;
        });
        this.get = (key) => __awaiter(this, void 0, void 0, function* () {
            const checkIfResultEmpty = (result) => {
                if (!result) {
                    return (ErrorFunctions_1.NoDataRetrievedError(key));
                }
                return result;
            };
            const promise = () => this.client.get(key)
                .then(checkIfResultEmpty)
                .catch(ErrorFunctions_1.PromiseError);
            return promise();
        });
        this.del = (key) => __awaiter(this, void 0, void 0, function* () {
            const promise = this.client.del(key)
                .catch(ErrorFunctions_1.PromiseError);
            return promise;
        });
    }
}
//# sourceMappingURL=SessionStore.js.map