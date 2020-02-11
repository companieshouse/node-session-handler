"use strict";

import ChLogger from "ch-logger";
import moment from "moment";

import Encoding from "../encoding";
import cache from "../cache";
import config from "../config";
import ApplicationLogger from "ch-logger/lib/ApplicationLogger";
import { Session } from ".";

class SessionStore {

    private _idOctets = 21;

    private _logger: ApplicationLogger;

    constructor(logger: ApplicationLogger) {
        this._logger = logger;
    }

    async load(sessionId: string) {

        let encodedData;

        try {
            encodedData = await cache.get(sessionId);

        } catch (error) {

            this._logger.error(error.message);
            throw new Error("Error trying to retrieve from cache");
        }

        const decodedData = await this.decodeSession(encodedData);

        await this.validateExpiration(session);

        return session;
    }

    async store(session: Session) {

        if (session.id === "") {
            session.id = await Encoding.generateRandomBytesBase64(this._idOctets);
            session.expires = this.generateExpiry();
        }

        const encodedSessionData = this.encodeSession(session);

        try {

            cache.set(session.id, encodedSessionData);

        } catch (err) {

            this._logger.debug(err.message);
            throw new Error("Error trying to store data in cache");
        }

        return session;
    };

    private validateExpiration(session: Session) {

        if (session.expires <= moment().milliseconds()) {
            throw new Error("Session has expired");
        }
    }

    private decodeSession(encodedData: any) {

        const base64Decoded = Encoding.decodeBase64(encodedData);

        return Encoding.decodeMsgpack(base64Decoded);
    }

    private encodeSession(session: Session) {
        return Encoding.encodeBase64(Encoding.encodeMsgpack(session));
    }

    private generateExpiry() {

        return moment()
            .add(config.session.expiryPeriod, "ms")
            .valueOf();
    }
}

export = SessionStore;
