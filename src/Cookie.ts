import * as crypto from "crypto";
import { loggerInstance } from "./Logger";

const _idOctets = (7 * 3);
const _signatureStart = (_idOctets * 4) / 3;
const _signatureLength = 27;
const _cookieValueLength = _signatureStart + _signatureLength;
const _cookieKey = '__SID';

const Cookie = {

  generateSignature: function (id: string, secret: string): string {
    try {
      const adjustedId = this.extractSessionId(id);
      const value = crypto
        .createHash("sha1")
        .update(adjustedId + secret)
        .digest("base64");
      return value.substr(0, value.indexOf("="));
    } catch (err) {
      loggerInstance().error(err);
    }
  },

  extractSignature: function (sessionCookie: string): string {
    return sessionCookie.substring(_signatureStart);
  },

  extractSessionId: function (sessionCookie: string): string {
    return sessionCookie.substring(0, _signatureStart);
  },

  validateCookieSignature: function (sessionCookie: string, cookieSecret: string): boolean {
    try {
      const actualSignature = this.extractSignature(sessionCookie);
      const expectedSignature = this.generateSignature(sessionCookie, cookieSecret);
      if (actualSignature !== expectedSignature) {
        return false
      } else {
        return true;
      }
    } catch (err) {
      loggerInstance().error(err);
    }
  },

  getSessionId: function (requestCookies: object): any {
    try {
      if(typeof requestCookies[_cookieKey] === 'undefined') {
        throw `Account session cookie '${_cookieKey}' missing in request`;
      }
      if (!this.validateCookieSignature(requestCookies[_cookieKey], process.env.COOKIE_SECRET)) {
        throw `Account session cookie not correctly signed`;
      }
      return requestCookies[_cookieKey].substring(0, _signatureStart);
    } catch (err) {
      loggerInstance().error(err);
      return false;
    }
  }
};

export = Cookie;
