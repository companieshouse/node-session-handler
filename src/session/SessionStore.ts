"use strict";

import ChLogger from "ch-logger";
import moment from "moment";

import Encoding from "../encoding";
import cache from "../cache";
import config from "../config";
import ApplicationLogger from "ch-logger/lib/ApplicationLogger";
import { Session } from ".";

class SessionStore {

    private idOctets = 21;

    logger: ApplicationLogger;

    constructor(logger: ApplicationLogger) {
        this.logger = logger;
    }

    async load(sessionId: string) {

        let encodedData;

        try {

            encodedData = await cache.get(sessionId);

        } catch (error) {

            this.logger.error(error.message);
            throw new Error("Error trying to retrieve from cache");
        }

        const session: any = {};
        
        session.data = await this.decodeSession(encodedData);

        await this.validateExpiration(session.data);

        return session;
    }

    async store(session: Session) {

        if (session.id === "") {
            session.id = await Encoding.generateRandomBytesBase64(this.idOctets);
            session.expires = this.generateExpiry();
        }

        const encodedSessionData = this.encodeSession(session.getData());

        try {
            cache.set(session.id, encodedSessionData);
        } catch (err) {

            this.logger.debug(err.message);
            throw new Error("Error trying to store data in cache");
        }

        return session;
    };

    private validateExpiration(session: Session) {

        if (sessionData.expires <= moment().milliseconds()) {
            throw new Error("Session has expired");
        }
    }

    private decodeSession(encodedData: any) {

        const base64Decoded = Encoding.decodeBase64(encodedData);

        return Encoding.decodeMsgpack(base64Decoded);
    }

    private encodeSession(session: Session) {
        return Encoding.encodeBase64(Encoding.encodeMsgpack(sessionData));
    }

    private generateExpiry() {

        return moment()
            .add(config.session.expiryPeriod, "ms")
            .valueOf();
    }
}

export = SessionStore;
