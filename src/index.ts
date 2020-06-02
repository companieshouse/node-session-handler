import msgpack5 from "msgpack5";
import * as cookie from "./Cookie";
import * as cache from "./Cache";
import { loggerInstance } from "./Logger";

const _appDataKey = process.env.SESSION_APP_KEY;
const _defaultTtl = 60*60;

const Session = {

  /**
   * Set up default parameters
   *
   * @param req - the request object as supplied the the consumer
   * @return <void>
   */
  _setUp: function (req): void {
    try {
      this.sessionData = { appData: null, accountData: null };
      this.sessionId = cookie.getSessionId(req.cookies);
    } catch (err) {
      loggerInstance().error(err);
    }
  },

  /**
   * Bootsrap a session
   *
   * @param req - the request object as supplied the the consumer
   * @param res - the response object as supplied the the consumer
   * @return <void>
   */
  start: function (req, res): Promise<void> {
    this._setUp(req);
    return Promise.all(
      [
        this.read('appData'),
        this.read('accountData')
      ]
    ).then(([a, b]) => {
      this.sessionData.appData = JSON.parse(a);
      this.sessionData.accountData = b ? this.decodeAccountData(b) : b;
      res.locals.session = this.sessionData;
      Promise.resolve(true);
    }).catch(err => {
      loggerInstance().error(err);
      Promise.reject(false);
    });
  },

  /**
   * Read data from session
   *
   * @param type - the type of read to be performed
   * @return <Promise>
   */
  read: function (type): Promise<any> {
    return new Promise((resolve, reject) => {
      if (type === 'appData') {
        cache.get(_appDataKey)
          .then(r => {
            resolve(r);
          }).catch(err => {
            loggerInstance().error(err);
            resolve(null);
          });
      } else if (type === 'accountData') {
        cache.get(this.sessionId)
          .then(r => {
            resolve(r);
          }).catch(err => {
            loggerInstance().error(err);
            resolve(null);
          });
      } else {
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
  write: function (res, data): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (typeof res.locals.session === 'undefined' || typeof res.locals.session.appData === 'undefined') {
        loggerInstance().error('Session was not properly started - missing appData field');
        reject(false);
      } else {
        res.locals.session.appData = data;
        cache.set(_appDataKey, JSON.stringify(data), _defaultTtl)
          .then(_ => {
            resolve(true);
          }).catch(err => {
            loggerInstance().error(err);
            reject(false);
          })
      }
    });
  },

  /**
   * Delete app data from session
   *
   * @param res - the response object as supplied the the consumer
   * @return <Promise>
   */
  delete: function (res): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (typeof res.locals.session === 'undefined' || typeof res.locals.session.appData === 'undefined') {
        loggerInstance().error('Session was not properly started - missing appData field');
        reject(false);
      } else {
        delete res.locals.session.appData;
        cache.delete(_appDataKey)
          .then(_ => {
            resolve(true);
          }).catch(err => {
            loggerInstance().error(err);
            reject(false);
          });
      }
    });
  },

  /**
   * Decodes data  saved against a user account by the accounts team
   *
   * @param data - user data from cache to be decoded
   * @return <Object>
   */
  decodeAccountData: function(data) {
    const buffer = Buffer.from(data, 'base64');
    let decoded;
    try {
      return JSON.parse(msgpack5().decode(buffer));
    } catch (err) {
      loggerInstance().error(err);
    }
  }
};

export = Session;
