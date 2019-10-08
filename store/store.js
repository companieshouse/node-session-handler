const log4js = require('log4js');
const logger = log4js.getLogger();

const encoding = require('../encoding/encoding');
const Session = require('../session/session');

module.exports = class Store {

  #cache;
  #secret;

  static #idOctets = 21;
  static #signatureStart = 28;
  static #signatureLength = 27;
  static #valueLength = signatureStart + signatureLength;

  constructor() {
    //TODO : Source cache details from config, or passed into store?
    this.cache = new Cache({
      password: "abc",
      addr: "127.0.0.1:1234",
      db: 0
    });

    //TODO : Load secret from config - Should this be done here? Probably not.
    secret = "";
  };

  async load(encryptedSessionToken) {
    const session;

    //Validate encrypted session token
    session = await getSessionIdFromTokenAndValidate(encryptedSessionToken);

    const encodedData;
    //Get session from cache - don't expose any error thrown from the cache
    try {
      encodedData = await cache.get(session.getId());
    } catch (err) {
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

    //If session id is empty, we're storing a new session rather than updating an existing one
    if (session.getId() == "") {
      session.setId(await encoding.generateRandomBytesBase64(idOctets));
      session.setExpires(await generateExpiry());
    }

    //Encode session data before adding it to the cache
    const encodedSessionData = await encodeSession(session.getData());

    //Store session data in cache - don't expose any error thrown from the cache
    try {
      cache.set(session.getId(), encodedSessionData);
    } catch (err) {
      //Log as debug - handy for debugging general issues, but don't want to pollute logs
      logger.debug(err.message);
      throw new Error("Error trying to store data in cache");
    }

    return session;
  };

  #getSessionIdFromTokenAndValidate(encryptedSessionToken) {
    //Compare length  of the encrypted session token to that of expected length
    if (encryptedSessionToken.length < valueLength) {
      throw new Error("Encrypted session token not expected length");
    }

    const session = new Session();
    session.setId(encryptedSessionToken.substring(0, signatureStart));

    //Strip the signature from the encrypted session token
    const sig = encryptedSessionToken.substring(signatureStart, encryptedSessionToken.length);

    //Validate that the signature is the same as what is expected
    if (sig !== await encoding.generateSha1SumBase64(session.getId() + secret)) {
      throw new Error("Expected signature does not equal actual");
    } else {
      return session;
    }
  };

  #validateExpiration(sessionData) {
    if (sessionData.expires <= Date.now()) {
      throw new Error("Session has expired");
    }
  };

  async #decodeSession(encodedData) {
    const base64Decoded = await encoding.decodeBase64(encodedData);
    return encoding.decodeMsgpack(base64Decoded);
  };

  async #encodeSession(sessionData) {
    const msgpackEncoded = await encoding.encodeMsgpack(sessionData);
    return encoding.encodeBase64(msgpackEncoded);
  };

  #generateExpiry() {
    //TODO : Implement expiry
  };
};
