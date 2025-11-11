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
exports.SessionStore = void 0;
const SessionStoreErrors_1 = require("./SessionStoreErrors");
const Encoding_1 = require("../../encoding/Encoding");
const TimeUtils_1 = require("../../utils/TimeUtils");
const SessionKey_1 = require("../keys/SessionKey");
const Logger_1 = require("../../Logger");
class SessionStore {
    constructor(redis) {
        this.redis = redis;
        this.load = (cookie) => __awaiter(this, void 0, void 0, function* () {
            (0, Logger_1.loggerInstance)().debug(`Loading from session store - COOKIE ID: ${cookie.sessionId}`);
            return Encoding_1.Encoding.decode(yield this.redisWrapper.get(cookie.sessionId));
        });
        this.store = (cookie_1, value_1, ...args_1) => __awaiter(this, [cookie_1, value_1, ...args_1], void 0, function* (cookie, value, timeToLiveInSeconds = 3600) {
            (0, Logger_1.loggerInstance)().debug(`Storing in session store - COOKIE ID: ${cookie.sessionId}`);
            value[SessionKey_1.SessionKey.Expires] = (0, TimeUtils_1.getSecondsSinceEpoch)() + timeToLiveInSeconds;
            return this.redisWrapper.set(cookie.sessionId, Encoding_1.Encoding.encode(value), timeToLiveInSeconds);
        });
        this.delete = (cookie) => __awaiter(this, void 0, void 0, function* () {
            (0, Logger_1.loggerInstance)().debug(`Deleting from session store - COOKIE ID: ${cookie.sessionId}`);
            return this.redisWrapper.del(cookie.sessionId);
        });
        this.redisWrapper = new RedisWrapper(redis);
    }
}
exports.SessionStore = SessionStore;
class RedisWrapper {
    constructor(client) {
        this.client = client;
        this.set = (key, value, timeToLiveInSeconds) => __awaiter(this, void 0, void 0, function* () {
            return this.client.set(key, value, "EX", timeToLiveInSeconds)
                .then(() => { return; })
                .catch(err => {
                throw new SessionStoreErrors_1.StoringError(key, value, err);
            });
        });
        this.get = (key) => __awaiter(this, void 0, void 0, function* () {
            const checkIfResultEmpty = (result) => {
                if (!result) {
                    throw new SessionStoreErrors_1.NoDataRetrievedError(key);
                }
                return result;
            };
            return this.client.get(key)
                .then(checkIfResultEmpty)
                .catch(err => {
                throw new SessionStoreErrors_1.RetrievalError(key, err);
            });
        });
        this.del = (key) => __awaiter(this, void 0, void 0, function* () {
            return this.client.del(key)
                .then(() => { return; })
                .catch(err => {
                throw new SessionStoreErrors_1.DeletionError(key, err);
            });
        });
    }
}
//# sourceMappingURL=SessionStore.js.map