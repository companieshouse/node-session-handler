"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
const crypto = __importStar(require("crypto"));
const Logger_1 = require("./Logger");
const _idOctets = (7 * 3);
const _signatureStart = (_idOctets * 4) / 3;
const _signatureLength = 27;
const _cookieValueLength = _signatureStart + _signatureLength;
const _cookieKey = '__SID';
const Cookie = {
    generateSignature: function (id, secret) {
        try {
            const adjustedId = this.extractSessionId(id);
            const value = crypto
                .createHash('sha1')
                .update(adjustedId + secret)
                .digest('base64');
            return value.substr(0, value.indexOf('='));
        }
        catch (err) {
            Logger_1.loggerInstance().error(err);
        }
    },
    extractSignature: function (sessionCookie) {
        return sessionCookie.substring(_signatureStart);
    },
    extractSessionId: function (sessionCookie) {
        return sessionCookie.substring(0, _signatureStart);
    },
    validateCookieSignature: function (sessionCookie, cookieSecret) {
        try {
            const actualSignature = this.extractSignature(sessionCookie);
            const expectedSignature = this.generateSignature(sessionCookie, cookieSecret);
            if (actualSignature !== expectedSignature) {
                return false;
            }
            else {
                return true;
            }
        }
        catch (err) {
            Logger_1.loggerInstance().error(err);
        }
    },
    getSessionId: function (requestCookies) {
        try {
            if (typeof requestCookies[_cookieKey] === 'undefined') {
                throw new Error(`Account session cookie '${_cookieKey}' missing in request`);
            }
            if (!this.validateCookieSignature(requestCookies[_cookieKey], process.env.COOKIE_SECRET)) {
                throw new Error(`Account session cookie not correctly signed`);
            }
            return requestCookies[_cookieKey].substring(0, _signatureStart);
        }
        catch (err) {
            Logger_1.loggerInstance().error(err);
            return false;
        }
    }
};
module.exports = Cookie;
//# sourceMappingURL=Cookie.js.map