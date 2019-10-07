const encoding = require('../encoding/encoding');
const Session = require('../session/session');

module.exports = class Store {

  //TODO : Create session object that is loaded from Cache via Store
  #cache;
  #session;
  #secret;

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

    session = new Session();

    //TODO : Load secret from config - Should this be done here? Probably not.
    secret = "";
  };

  async load(encryptedSessionToken) {
    try {
      //Validate encrypted session token
      const validatedSession = await validateEncryptedSessionToken(encryptedSessionToken);

      //Get session from cache
      const encodedData = await getSessionFromCache();

      //Decode session
      session.setData(await decodeSession(encodedData));

      //Validate expiration
      const validExpiry = await validateExpiration();
    } catch (err) {
      //TODO : Error
    }

    //Return session
    return session.getData();
  };

  store() {
    //if session data is empty
  };

  #validateEncryptedSessionToken(encryptedSessionToken) {
    //Compare length  of the encrypted session token to that of expected length
    if (encryptedSessionToken.length < valueLength) {
      //TODO : Clear session
      //TODO : Throw error
    }

    //Get the session id from the encrypted session token
    session.setID(encryptedSessionToken.substring(0, signatureStart));

    //Strip the signature from the encrypted session token
    const sig = encryptedSessionToken.substring(signatureStart, encryptedSessionToken.length);

    //Validate that the signature is the same as what is expected
    if (sig !== generateSignature()) {
      //TODO : Clear session
      //TODO : Throw error
    }
  };

  #getSessionFromCache() {
    return cache.get(sessionID);
  }

  #validateExpiration() {
    if (sessionData.expires <= Date.now()) {
      //TODO : Throw error
    }
  };

  #decodeSession(encodedData) {
    //decodeBase64
    const base64Decoded = encoding.decodeBase64(encodedData);

    //decode msgpack
    return encoding.decodeMsgpack(base64Decoded);
  };

  #encodeSession() {

  };

  #generateSignature() {
    const sum = encoding.generateSha1Sum(session.getId() + secret);
    return encoding.encodeBase64(Buffer.from(sum));
  }
};
