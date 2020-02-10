"use strict";

const logger = require("ch-logger");
const moment = require("moment");

const encoding = require("../encoding");
const createSession = require("../session");

const createStore = function (newCache, config) {

    const me = {};

    const cache = newCache;
    const secret = config.secret;
    const expiryPeriod = config.expiryPeriod;

    const idOctets = 21;
    const signatureStart = 28;
    const signatureLength = 27;
    const valueLength = signatureStart + signatureLength;

    me.load = async function (encryptedSessionToken) {

        const session = await me.getSessionIdFromTokenAndValidate(encryptedSessionToken);

        let encodedData;

        try {
            encodedData = await cache.get(session.id);
        } catch (err) {

            logger.debug(err.message);
            throw new Error("Error trying to retrieve from cache");
        }

        session.data = await me.decodeSession(encodedData);

        await me.validateExpiration(session.data);

        return session;
    };

    me.store = function (session) {

        if (session.id === "") {
            session.id = encoding.generateRandomBytesBase64(idOctets);
            session.expires = me.generateExpiry();
        }

        const encodedSessionData = me.encodeSession(session.getData());

        try {
            cache.set(session.id, encodedSessionData);
        } catch (err) {

            logger.debug(err.message);
            throw new Error("Error trying to store data in cache");
        }

        return session;
    };

    me.getSessionIdFromTokenAndValidate = function (encryptedSessionToken) {

        me.validateTokenLength(encryptedSessionToken);

        const session = createSession();

        session.id = encryptedSessionToken.substring(0, signatureStart);

        // Strip the signature from the encrypted session token
        const sig = encryptedSessionToken.substring(signatureStart, encryptedSessionToken.length);

        me.validateSignature(sig, session.id);

        return session;
    };

    me.validateTokenLength = function (encryptedSessionToken) {

        if (encryptedSessionToken.length < valueLength) {
            throw new Error("Encrypted session token not long enough");
        }
    };

    me.validateExpiration = function (sessionData) {

        if (sessionData.expires <= moment().milliseconds()) {
            throw new Error("Session has expired");
        }
    };

    me.validateSignature = function (sig, sessionId) {

        if (sig !== encoding.generateSha1SumBase64(sessionId + secret)) {
            throw new Error("Expected signature does not equal actual");
        }
    };

    me.decodeSession = function (encodedData) {

        const base64Decoded = encoding.decodeBase64(encodedData);

        return encoding.decodeMsgpack(base64Decoded);
    };

    me.encodeSession = function (sessionData) {
        return encoding.encodeBase64(encoding.encodeMsgpack(sessionData));
    };

    me.generateExpiry = function () {
        return moment().add(expiryPeriod, "ms");
    };

    return me;
};

module.exports = createStore;
