const log4js = require("log4js");
const moment = require("moment");

const encoding = require("../encoding");
const createSession = require("../session");

const logger = log4js.getLogger();

const config = {
    secret: "",
    expiryPeriod: 0
};

const createStore = function (newCache, config) {
    const store = {};

    const cache = newCache;
    const secret = config.secret;
    const expiryPeriod = config.expiryPeriod;

    const idOctets = 21;
    const signatureStart = 28;
    const signatureLength = 27;
    const valueLength = 55; //sig start + sig length

    store.load = async function (encryptedSessionToken) {
        // Validate encrypted session token
        const session = await store.getSessionIdFromTokenAndValidate(encryptedSessionToken);

        const encodedData = {};
        // Get session from cache - don"t expose any error thrown from the cache
        try {
            encodedData = await cache.get(session.id);
        } catch (err) {
            // Log as debug - handy for debugging general issues, but don"t want to pollute logs
            logger.debug(err.message);
            throw new Error("Error trying to retrieve from cache");
        }

        // Decode session
        session.data = await decodeSession(encodedData);

        // Validate expiration
        await validateExpiration(session.data);

        // Return session
        return session;
    };

    store.store = async function (session) {

        // If session id is empty, we"re storing a new session rather than updating an existing one
        if (session.id == "") {
            session.id = encoding.generateRandomBytesBase64(idOctets);
            session.expires = generateExpiry();
        }

        // Encode session data before adding it to the cache
        const encodedSessionData = await encodeSession(session.getData());

        // Store session data in cache - don"t expose any error thrown from the cache
        try {
            cache.set(session.id, encodedSessionData);
        } catch (err) {
            // Log as debug - handy for debugging general issues, but don"t want to pollute logs
            logger.debug(err.message);
            throw new Error("Error trying to store data in cache");
        }

        return session;
    };

    store.getSessionIdFromTokenAndValidate = function (encryptedSessionToken) {

        store.validateTokenLength(encryptedSessionToken);

        const session = createSession();
        session.id = encryptedSessionToken.substring(0, signatureStart);

        // Strip the signature from the encrypted session token
        const sig = encryptedSessionToken.substring(signatureStart, encryptedSessionToken.length);

        // Validate that the signature is the same as what is expected
        store.validateSignature(sig, session.id);

        return session;
    };

    store.validateTokenLength = function (encryptedSessionToken) {
        if (encryptedSessionToken.length < valueLength) {
            throw new Error("Encrypted session token not long enough");
        }
    };

    store.validateExpiration = function (sessionData) {
        if (sessionData.expires <= moment().milliseconds()) {
            throw new Error("Session has expired");
        }
    };

    store.validateSignature = function (sig, sessionId) {
        if (sig !== encoding.generateSha1SumBase64(sessionId + secret)) {
            throw new Error("Expected signature does not equal actual");
        }
    };

    store.decodeSession = function (encodedData) {
        const base64Decoded = encoding.decodeBase64(encodedData);
        return encoding.decodeMsgpack(base64Decoded);
    };

    store.encodeSession = async function (sessionData) {
        return encoding.encodeBase64(await encoding.encodeMsgpack(sessionData));
    };

    store.generateExpiry = function () {
        // Set expiry to now + expiry period (in ms)
        return moment().add(expiryPeriod, "ms");
    };

    return store;
};

module.exports.config = config;
module.exports = createStore;
