"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
const msgpack5_1 = __importDefault(require("msgpack5"));
const cookie = __importStar(require("./Cookie"));
const cache = __importStar(require("./Cache"));
const Logger_1 = require("./Logger");
const _appDataKey = process.env.SESSION_APP_KEY;
const _defaultTtl = 60 * 60;
const Session = {
    cookie: cookie,
    cache: cache,
    /**
     * Set up default parameters
     *
     * @param req - the request object as supplied the the consumer
     * @return <void>
     */
    _setUp: function (req) {
        try {
            this.sessionData = { appData: null, accountData: null };
            this.sessionId = this.cookie.getSessionId(req.cookies);
        }
        catch (err) {
            Logger_1.loggerInstance().error(err);
        }
    },
    /**
     * Bootstrap a session
     *
     * @param req - the request object as supplied the the consumer
     * @param res - the response object as supplied the the consumer
     * @return <void>
     */
    start: function (req, res) {
        this._setUp(req);
        return Promise.all([
            this.read('appData'),
            this.read('accountData')
        ]).then(([a, b]) => {
            this.sessionData.appData = JSON.parse(a);
            this.sessionData.accountData = b ? this.decodeAccountData(b) : b;
            res.locals.session = this.sessionData;
            return Promise.resolve(true);
        }).catch(err => {
            Logger_1.loggerInstance().error(err);
            return Promise.reject(false);
        });
    },
    /**
     * Read data from session
     *
     * @param type - the type of read to be performed
     * @return <Promise>
     */
    read: function (type) {
        return new Promise((resolve, reject) => {
            if (type === 'appData') {
                this.cache.get(_appDataKey)
                    .then(r => {
                    resolve(r);
                }).catch(err => {
                    Logger_1.loggerInstance().error(err);
                    resolve(null);
                });
            }
            else if (type === 'accountData') {
                this.cache.get(this.sessionId)
                    .then(r => {
                    resolve(r);
                }).catch(err => {
                    Logger_1.loggerInstance().error(err);
                    resolve(null);
                });
            }
            else {
                reject('Invalid type option');
            }
        });
    },
    /**
     * Write data to session
     *
     * @param res - the response object as supplied the the consumer
     * @param data - data to be written to memory and to Cache
     * @return <Promise>
     */
    write: function (res, data) {
        return new Promise((resolve, reject) => {
            if (typeof res.locals.session === 'undefined' || typeof res.locals.session.appData === 'undefined') {
                Logger_1.loggerInstance().error('Session was not properly started - missing appData field');
                reject(false);
            }
            else {
                this.cache.set(_appDataKey, JSON.stringify(data), _defaultTtl)
                    .then(_ => {
                    res.locals.session.appData = data;
                    resolve(true);
                }).catch(err => {
                    Logger_1.loggerInstance().error(err);
                    reject(false);
                });
            }
        });
    },
    /**
     * Delete app data from session
     *
     * @param res - the response object as supplied the the consumer
     * @return <Promise>
     */
    delete: function (res) {
        return new Promise((resolve, reject) => {
            if (typeof res.locals.session === 'undefined' || typeof res.locals.session.appData === 'undefined') {
                Logger_1.loggerInstance().error('Session was not properly started - missing appData field');
                reject(false);
            }
            else {
                delete res.locals.session.appData;
                this.cache.delete(_appDataKey)
                    .then(_ => {
                    resolve(true);
                }).catch(err => {
                    Logger_1.loggerInstance().error(err);
                    reject(false);
                });
            }
        });
    },
    /**
     * Decodes data saved against a user's sessionId by the accounts service
     *
     * @param data - user data from cache to be decoded
     * @return <Object>
     */
    decodeAccountData: function (data) {
        try {
            const buffer = Buffer.from(data, 'base64');
            const decoded = msgpack5_1.default().decode(buffer);
            return typeof (decoded) === 'string' ? JSON.parse(decoded) : decoded;
        }
        catch (err) {
            Logger_1.loggerInstance().error(err);
        }
    }
};
module.exports = Session;
//# sourceMappingURL=Session.js.map