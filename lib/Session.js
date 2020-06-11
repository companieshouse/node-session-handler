"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const msgpack5_1 = __importDefault(require("msgpack5"));
const cookie = __importStar(require("./Cookie"));
const cache = __importStar(require("./Cache"));
const Logger_1 = require("./Logger");
const SessionError_1 = __importDefault(require("./SessionError"));
const _appDataKey = process.env.SESSION_APP_KEY;
const _defaultTtl = 60 * 60;
const Session = {
    cookie: cookie,
    cache: cache,
    /**
     * Bootstrap a session
     *
     * @param req - the request object as supplied the the consumer
     * @param res - the response object as supplied the the consumer
     * @return <void>
     */
    start: function (req, res) {
        let signature = { appData: null, accountData: null, id: null };
        try {
            const sessionId = this.cookie.getSessionId(req.cookies);
            if (!sessionId) {
                throw new SessionError_1.default('Invalid session Id');
            }
            else {
                return Promise.all([
                    this.read(sessionId, 'appData'),
                    this.read(sessionId, 'accountData')
                ]).then(([a, b]) => {
                    const acc = b ? this._decodeAccountData(b) : b;
                    const o = {
                        appData: JSON.parse(a),
                        accountData: acc,
                        id: acc['.id']
                    };
                    res.locals.session = o;
                    return Promise.resolve(true);
                }).catch(err => {
                    Logger_1.loggerInstance().error(err);
                    res.locals.session = signature;
                    return Promise.reject(new SessionError_1.default(err.message));
                });
            }
        }
        catch (err) {
            Logger_1.loggerInstance().error(err);
            res.locals.session = signature;
            return Promise.reject(new SessionError_1.default(err.message));
        }
    },
    /**
     * Read data from session cache
     *
     * @param type - the type of read to be performed
     * @return <Promise>
     */
    read: function (sessionId, type) {
        return new Promise((resolve, reject) => {
            if (type === 'appData') {
                this.cache.get(`${_appDataKey}.${sessionId}`)
                    .then(r => {
                    resolve(r);
                }).catch(err => {
                    Logger_1.loggerInstance().error(err);
                    resolve(null);
                });
            }
            else if (type === 'accountData') {
                this.cache.get(sessionId)
                    .then(r => {
                    resolve(r);
                }).catch(err => {
                    Logger_1.loggerInstance().error(err);
                    resolve(null);
                });
            }
            else {
                reject(new SessionError_1.default('Invalid type option'));
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
            const sessionId = this.getId(res);
            if (!sessionId) {
                reject(new SessionError_1.default('Session Id does not exist'));
            }
            else {
                this.cache.set(`${_appDataKey}.${sessionId}`, JSON.stringify(data), _defaultTtl)
                    .then(_ => {
                    res.locals.session.appData = data;
                    resolve(true);
                }).catch(err => {
                    Logger_1.loggerInstance().error(err);
                    reject(new SessionError_1.default(err.message));
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
            const sessionId = this.getId(res);
            if (!sessionId) {
                reject(new SessionError_1.default('Session Id does not exist'));
            }
            else {
                this.cache.delete(`${_appDataKey}.${sessionId}`)
                    .then(_ => {
                    res.locals.session.appData = null;
                    resolve(true);
                }).catch(err => {
                    Logger_1.loggerInstance().error(err);
                    reject(new SessionError_1.default(err.message));
                });
            }
        });
    },
    /**
     * Retrieve an Id from the accountData object from the response object
     *
     * @param res - the response object
     * @return <void>
     */
    getId: function (res) {
        try {
            if (!res.locals.session.accountData) {
                throw new SessionError_1.default('Account data is null -- posiibly missing or unrecognised __SID');
            }
            else {
                return res.locals.session.accountData['.id'];
            }
        }
        catch (err) {
            return false;
        }
    },
    /**
     * Determine if a user is logged in or not
     *
     * @param res - the response object
     * @return <void>
     */
    isLoggedIn: function (res) {
        try {
            let r = false;
            if (res.locals.session.accountData.signin_info.signed_in === 1) {
                r = true;
            }
            return r;
        }
        catch (err) {
            return false;
        }
    },
    /**
     * Decodes data saved against a user's sessionId by the accounts service
     *
     * @param data - user data from cache to be decoded
     * @return <Object>
     */
    _decodeAccountData: function (data) {
        try {
            const buffer = Buffer.from(data, 'base64');
            const decoded = msgpack5_1.default().decode(buffer);
            return typeof (decoded) === 'string' ? JSON.parse(decoded) : decoded;
        }
        catch (err) {
            Logger_1.loggerInstance().error(err);
            return null;
        }
    }
};
module.exports = Session;
//# sourceMappingURL=Session.js.map