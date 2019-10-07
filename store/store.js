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
    try {
      //Validate encrypted session token
      session = await getSessionIdFromTokenAndValidate(encryptedSessionToken);

      //Get session from cache
      const encodedData = await cache.get(session.getId());

      //Decode session
      session.setData(await decodeSession(encodedData));

      //Validate expiration
      const validExpiry = await validateExpiration();
    } catch (err) {
      //TODO : Error
    }

    //Return session
    return session;
  };

  async store(session) {
    try {
      //If session id is empty, we're storing a new session rather than updating an existing one
      if (session.getId() == "") {
        session.setId(await encoding.generateRandomBytesBase64(idOctets));
        session.setExpires(await generateExpiry());
      }

      const encodedSessionData = await encodeSession(session.getData());

      cache.set(session.getId(), encodedSessionData);
    } catch (err) {
      //TODO : Throw error
    }

    return session;
  };

  #getSessionIdFromTokenAndValidate(encryptedSessionToken) {
    //Compare length  of the encrypted session token to that of expected length
    if (encryptedSessionToken.length < valueLength) {
      //TODO : Clear session
      //TODO : Throw error

    }

    const session = new Session();
    session.setId(encryptedSessionToken.substring(0, signatureStart));

    //Strip the signature from the encrypted session token
    const sig = encryptedSessionToken.substring(signatureStart, encryptedSessionToken.length);

    //Validate that the signature is the same as what is expected
    if (sig !== await encoding.generateSha1SumBase64(session.getId() + secret)) {
      //TODO : Clear session
      //TODO : Throw error
    } else {
      return session;
    }
  };

  #validateExpiration() {
    if (sessionData.expires <= Date.now()) {
      //TODO : Throw error
    }
  };

  async #decodeSession(encodedData) {
    //decodeBase64
    const base64Decoded = await encoding.decodeBase64(encodedData);

    //decode msgpack
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
