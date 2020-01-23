const log4js = require("log4js");
const logger = log4js.getLogger();

const moment = require("moment");

const encoding = require("../encoding");
const Session = require("../session");

config = {
  secret: "",
  expiryPeriod: 0
};

class Store {

  #cache;
  #secret;
  #expiryPeriod;

  static #idOctets = 21;
  static #signatureStart = 28;
  static #signatureLength = 27;
  static #valueLength = 55; //sig start + sig length

  constructor(cache, config) {
    this.#cache = cache;

    this.#secret = config.secret;
    this.#expiryPeriod = config.expiryPeriod;
  };

  async load(encryptedSessionToken) {
    //Validate encrypted session token
    const session = await this.getSessionIdFromTokenAndValidate(encryptedSessionToken);

    const encodedData = {};
    //Get session from cache - don"t expose any error thrown from the cache
    try {
      encodedData = await this.#cache.get(session.getId());
    } catch (err) {
      //Log as debug - handy for debugging general issues, but don"t want to pollute logs
      logger.debug(err.message);
      throw new Error("Error trying to retrieve from cache");
    }

    //Decode session
    session.setData(await decodeSession(encodedData));

    //Validate expiration
    await validateExpiration(session.getData());

    //Return session
    return session;
  };

  async store(session) {

    //If session id is empty, we"re storing a new session rather than updating an existing one
    if (session.getId() == "") {
      session.setId(encoding.generateRandomBytesBase64(idOctets));
      session.setExpires(generateExpiry());
    }

    //Encode session data before adding it to the cache
    const encodedSessionData = await encodeSession(session.getData());

    //Store session data in cache - don"t expose any error thrown from the cache
    try {
      cache.set(session.getId(), encodedSessionData);
    } catch (err) {
      //Log as debug - handy for debugging general issues, but don"t want to pollute logs
      logger.debug(err.message);
      throw new Error("Error trying to store data in cache");
    }

    return session;
  };

  getSessionIdFromTokenAndValidate(encryptedSessionToken) {
    this.validateTokenLength(encryptedSessionToken);

    const session = new Session();
    session.id = encryptedSessionToken.substring(0, Store.#signatureStart);

    //Strip the signature from the encrypted session token
    const sig = encryptedSessionToken.substring(Store.#signatureStart, encryptedSessionToken.length);

    //Validate that the signature is the same as what is expected
    this.validateSignature(sig, session.id);

    return session;
  };

  validateTokenLength(encryptedSessionToken) {
    if (encryptedSessionToken.length < Store.#valueLength) {
      throw new Error("Encrypted session token not long enough");
    }
  };

  validateExpiration(sessionData) {
    if (sessionData.expires <= moment().milliseconds()) {
      throw new Error("Session has expired");
    }
  };

  validateSignature(sig, sessionId) {
    if (sig !== encoding.generateSha1SumBase64(sessionId + this.#secret)) {
      throw new Error("Expected signature does not equal actual");
    }
  };

  decodeSession(encodedData) {
    const base64Decoded = encoding.decodeBase64(encodedData);
    return encoding.decodeMsgpack(base64Decoded);
  };

  async encodeSession(sessionData) {
    return encoding.encodeBase64(await encoding.encodeMsgpack(sessionData));
  };

  generateExpiry() {
    //Set expiry to now + expiry period (in ms)
    return moment().add(expiryPeriod, "ms");
  };
};

module.exports.config = config;
module.exports.Store = Store;
