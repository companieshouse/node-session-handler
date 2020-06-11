import msgpack5 from 'msgpack5';
import * as cookie from './Cookie';
import * as cache from './Cache';
import { loggerInstance } from './Logger';
import SessionError from './SessionError';

const _appDataKey = process.env.SESSION_APP_KEY;
const _defaultTtl = 60 * 60;

const Session: { [k: string]: any } = {

  cookie: cookie,

  cache: cache,

  /**
   * Bootstrap a session
   *
   * @param req - the request object as supplied the the consumer
   * @param res - the response object as supplied the the consumer
   * @return <void>
   */
  start: function (req, res): Promise<boolean> {
    let signature = { appData: null, accountData: null, id: null };
    try {
      const sessionId = this.cookie.getSessionId(req.cookies);
      if (!sessionId) {
        throw new SessionError('Invalid session Id');
      } else {
        return Promise.all(
          [
            this.read(sessionId, 'appData'),
            this.read(sessionId, 'accountData')
          ]
        ).then(([a, b]) => {
          const acc = b ? this._decodeAccountData(b) : b;
          const o = {
            appData: JSON.parse(a),
            accountData: acc,
            id: acc['.id']
          };
          res.locals.session = o;
          return Promise.resolve(true);
        }).catch(err => {
          loggerInstance().error(err);
          res.locals.session = signature;
          return Promise.reject(new SessionError(err.message));
        });
      }
    } catch (err) {
      loggerInstance().error(err);
      res.locals.session = signature;
      return Promise.reject(new SessionError(err.message));
    }
  },

  /**
   * Read data from session cache
   *
   * @param type - the type of read to be performed
   * @return <Promise>
   */
  read: function (sessionId: string, type: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if (type === 'appData') {
        this.cache.get(`${_appDataKey}.${sessionId}`)
          .then(r => {
            resolve(r);
          }).catch(err => {
            loggerInstance().error(err);
            resolve(null);
          });
      } else if (type === 'accountData') {
        this.cache.get(sessionId)
          .then(r => {
            resolve(r);
          }).catch(err => {
            loggerInstance().error(err);
            resolve(null);
          });
      } else {
        reject(new SessionError('Invalid type option'));
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
      const sessionId = this.getId(res);
      if (!sessionId) {
        reject(new SessionError('Session Id does not exist'));
      } else {
        this.cache.set(`${_appDataKey}.${sessionId}`, JSON.stringify(data), _defaultTtl)
          .then(_ => {
            res.locals.session.appData = data;
            resolve(true);
          }).catch(err => {
            loggerInstance().error(err);
            reject(new SessionError(err.message));
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
  delete: function (res): Promise<boolean> {
    return new Promise((resolve, reject) => {
      const sessionId = this.getId(res);
      if (!sessionId) {
        reject(new SessionError('Session Id does not exist'));
      } else {
        this.cache.delete(`${_appDataKey}.${sessionId}`)
          .then(_ => {
            res.locals.session.appData = null;
            resolve(true);
          }).catch(err => {
            loggerInstance().error(err);
            reject(new SessionError(err.message));
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
  getId: function (res): any {
    try {
      if (!res.locals.session.accountData) {
        throw new SessionError('Account data is null -- posiibly missing or unrecognised __SID');
      } else {
        return res.locals.session.accountData['.id'];
      }
    } catch (err) {
      return false;
    }
  },

  /**
   * Determine if a user is logged in or not
   *
   * @param res - the response object
   * @return <void>
   */
  isLoggedIn: function (res): boolean {
    try {
      let r = false;
      if (res.locals.session.accountData.signin_info.signed_in === 1) {
        r = true;
      }
      return r;
    } catch (err) {
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
      const decoded = msgpack5().decode(buffer);
      return typeof(decoded) === 'string' ? JSON.parse(decoded) : decoded;
    } catch (err) {
      loggerInstance().error(err);
      return null;
    }
  }
};

export = Session;
