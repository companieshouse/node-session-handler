"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const ioredis_1 = __importDefault(require("ioredis"));
const Logger_1 = require("./Logger");
const redisClient = () => {
    if (typeof process.env.CACHE_SERVER !== 'undefined') {
        return new ioredis_1.default(`redis://${process.env.CACHE_SERVER}`);
    }
};
const Cache = {
    client: redisClient(),
    set: function (key, value, ttl) {
        return new Promise((resolve, reject) => {
            this.client.set(key, value, 'EX', ttl)
                .then(_ => {
                resolve(true);
            }).catch(err => {
                Logger_1.loggerInstance().error(err);
                reject(err);
            });
        });
    },
    get: function (key) {
        return new Promise((resolve, reject) => {
            this.client.get(key)
                .then(result => {
                resolve(result);
            }).catch(err => {
                Logger_1.loggerInstance().error(err);
                reject(err);
            });
        });
    },
    delete: function (key) {
        return new Promise((resolve, reject) => {
            this.client.del(key)
                .then(_ => {
                resolve(true);
            }).catch(err => {
                Logger_1.loggerInstance().error(err);
                reject(err);
            });
        });
    }
};
module.exports = Cache;
//# sourceMappingURL=Cache.js.map