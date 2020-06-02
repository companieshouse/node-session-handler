"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const ioredis_1 = __importDefault(require("ioredis"));
const Logger_1 = require("./Logger");
const client = null;
const Cache = {
    _setClient: function () {
        try {
            if (!this.clent || typeof this.client === 'undefined') {
                this.client = new ioredis_1.default(`redis://${process.env.CACHE_SERVER}`);
            }
        }
        catch (err) {
            Logger_1.loggerInstance().error(err);
        }
    },
    set: function (key, value, ttl) {
        this._setClient();
        return new Promise((resolve, reject) => {
            this.client.set(key, value, "EX", ttl)
                .then(_ => {
                resolve(true);
            }).catch(err => {
                Logger_1.loggerInstance().error(err);
                reject(false);
            });
        });
    },
    get: function (key) {
        this._setClient();
        return new Promise((resolve, reject) => {
            this.client.get(key)
                .then(result => {
                resolve(result);
            }).catch(err => {
                Logger_1.loggerInstance().error(err);
                reject(false);
            });
        });
    },
    delete: function (key) {
        this._setClient();
        return new Promise((resolve, reject) => {
            this.client.del(key)
                .then(_ => {
                resolve(true);
            }).catch(err => {
                Logger_1.loggerInstance().error(err);
                reject(false);
            });
        });
    }
};
module.exports = Cache;
//# sourceMappingURL=Cache.js.map