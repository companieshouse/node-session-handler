"use strict";

import ChLogger from "ch-logger";
import moment from "moment";

import encoding from "../encoding";
import createSession from "../session";
import cache from "../cache";
import config from "../config";

class SessionStore {

}

const createStore = function () {

    const secret = config.secret;
    const expiryPeriod = config.expiryPeriod;

    const idOctets = 21;
    const signatureStart = 28;
    const signatureLength = 27;
    const valueLength = signatureStart + signatureLength;

    me.load = async function (encryptedSessionToken) {

        const session = me.getSessionIdFromTokenAndValidate(encryptedSessionToken);

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

    me.validateExpiration = function (sessionData) {

        if (sessionData.expires <= moment().milliseconds()) {
            throw new Error("Session has expired");
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

export = createStore;
